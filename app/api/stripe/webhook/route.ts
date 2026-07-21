import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { decodeCodesFromMetadata } from "@/lib/checkout"
import { SOLLY_PACKAGE_SKU } from "@/lib/solly-entitlement"

export const runtime = "nodejs"

const CREDITS_PACK_SKU_HINT = "extra Solly drafts" // matches the product name set on the credits Payment Link

async function grantEntitlement(email: string, sessionId: string, paymentIntent: string | null) {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return
  const { error } = await supabaseAdmin.from("solly_entitlements").upsert(
    {
      email,
      product_sku: SOLLY_PACKAGE_SKU,
      status: "paid",
      stripe_session_id: sessionId,
      stripe_payment_intent: paymentIntent,
    },
    { onConflict: "stripe_session_id" },
  )
  if (error) console.log("[webhook] Failed to grant entitlement:", error.message)
}

async function grantCredits(email: string, sessionId: string, credits: number, amountCents: number) {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return

  const { data: existingPurchase } = await supabaseAdmin
    .from("solly_credit_purchases")
    .select("id")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle()
  if (existingPurchase) return // already granted, avoid double-crediting

  await supabaseAdmin.from("solly_credit_purchases").insert({
    email,
    stripe_checkout_session_id: sessionId,
    credits_granted: credits,
    amount_cents: amountCents,
  })

  const { data: existing } = await supabaseAdmin
    .from("solly_credits")
    .select("credits_remaining")
    .eq("email", email)
    .maybeSingle()

  const newBalance = (existing?.credits_remaining ?? 0) + credits
  const { error } = await supabaseAdmin
    .from("solly_credits")
    .upsert({ email, credits_remaining: newBalance, updated_at: new Date().toISOString() })
  if (error) console.log("[webhook] Failed to grant credits:", error.message)
}

async function unlockSollyDocuments(conversationId: string, codes: string[], sessionId: string, email: string | null, amountCents: number) {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return

  const { data: purchase } = await supabaseAdmin
    .from("form_purchases")
    .upsert(
      {
        email: email ?? "unknown@solumsafetyconsulting.com.au",
        form_codes: codes,
        amount_cents: amountCents,
        currency: "aud",
        status: "paid",
        stripe_checkout_session_id: sessionId,
        conversation_id: conversationId,
      },
      { onConflict: "stripe_checkout_session_id" },
    )
    .select("id")
    .single()

  for (const code of codes) {
    await supabaseAdmin
      .from("form_sessions")
      .update({ status: "delivered", form_purchase_id: purchase?.id ?? null, updated_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("form_code", code)
  }

  await supabaseAdmin
    .from("solly_conversations")
    .update({ status: "completed", client_email: email, updated_at: new Date().toISOString() })
    .eq("id", conversationId)
}

async function revokeByStripeSessionId(sessionId: string) {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return

  await supabaseAdmin.from("solly_entitlements").update({ status: "refunded" }).eq("stripe_session_id", sessionId)
  await supabaseAdmin.from("form_purchases").update({ status: "refunded" }).eq("stripe_checkout_session_id", sessionId)
  // Credits: don't silently claw back already-spent credits, but stop the
  // purchase from having granted anything further — flag for manual review
  // via the purchase record rather than mutating a balance that may have
  // already been drawn down.
  await supabaseAdmin
    .from("solly_credit_purchases")
    .update({ credits_granted: 0 })
    .eq("stripe_checkout_session_id", sessionId)
}

export async function POST(request: NextRequest) {
  const signature = (await headers()).get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    console.log("[webhook] Missing signature or STRIPE_WEBHOOK_SECRET — cannot verify request.")
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.log("[webhook] Signature verification failed:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 })
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.payment_status !== "paid") return NextResponse.json({ received: true })

      const email = session.customer_details?.email ?? session.customer_email ?? null
      const paymentIntent =
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null
      const amountCents = session.amount_total ?? 0

      // Solly one-off document purchase (has conversationId + codes metadata).
      if (session.metadata?.conversationId && session.metadata?.codes) {
        const codes = session.metadata.codes.split(",").filter(Boolean)
        await unlockSollyDocuments(session.metadata.conversationId, codes, session.id, email, amountCents)
      }
      // Solly credits top-up pack.
      else if (session.metadata?.type === "solly_credits" || session.line_items) {
        // Static Payment Links don't carry our custom metadata, so also
        // check the product name as a fallback signal.
        const isCreditsPurchase =
          session.metadata?.type === "solly_credits" ||
          (await isLikelyCreditsPurchase(session.id))
        if (isCreditsPurchase && email) {
          const credits = Number.parseInt(session.metadata?.credits ?? "10", 10)
          await grantCredits(email, session.id, credits, amountCents)
        }
      }

      // SolumWHS package — check line items/metadata for the SKU regardless
      // of which flow triggered checkout (dynamic session or static link).
      const codes = decodeCodesFromMetadata(session.metadata)
      if (codes.includes(SOLLY_PACKAGE_SKU) && email) {
        await grantEntitlement(email, session.id, paymentIntent)
      }
    }

    if (event.type === "charge.refunded" || event.type === "charge.dispute.created") {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null
      if (paymentIntentId) {
        // Find the checkout session tied to this payment intent to revoke by session id.
        const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 })
        const session = sessions.data[0]
        if (session) await revokeByStripeSessionId(session.id)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.log("[webhook] Handler error:", err instanceof Error ? err.message : err)
    // Still 200 so Stripe doesn't retry-storm us for a bug on our side;
    // errors are logged for manual follow-up instead.
    return NextResponse.json({ received: true, error: "logged" })
  }
}

// Static Payment Links (like the credits pack) don't carry custom metadata.
// Fall back to checking the line item description against a known hint.
async function isLikelyCreditsPurchase(sessionId: string): Promise<boolean> {
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 5 })
    return lineItems.data.some((li) => (li.description ?? "").includes(CREDITS_PACK_SKU_HINT))
  } catch {
    return false
  }
}
