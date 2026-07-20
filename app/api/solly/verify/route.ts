import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { stripe } from "@/lib/stripe"

async function notifyReviewerOfPendingDocuments(clientEmail: string, formCodes: string[], origin: string) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL?.trim() || "info@solumsafetyconsulting.com.au"
  if (!apiKey) {
    console.log("[solly] RESEND_API_KEY not set — skipping reviewer notification for", clientEmail, formCodes)
    return
  }
  const configuredFrom = process.env.CONTACT_FROM_EMAIL?.trim()
  const fromIsUnverified = !configuredFrom || /@(gmail|outlook|hotmail|yahoo|icloud)\.com>?\s*$/i.test(configuredFrom)
  const from = fromIsUnverified ? "Solum Safety Consulting <onboarding@resend.dev>" : configuredFrom

  const resend = new Resend(apiKey)
  try {
    await resend.emails.send({
      from,
      to,
      subject: `Solly: ${formCodes.length} paid document${formCodes.length === 1 ? "" : "s"} awaiting review`,
      html: `
        <h2>Paid documents awaiting review</h2>
        <p><strong>Client:</strong> ${clientEmail}</p>
        <p><strong>Templates:</strong> ${formCodes.join(", ")}</p>
        <p><a href="${origin}/solly/admin/review">Review now</a></p>
      `,
    })
  } catch (err) {
    console.log("[solly] Failed to send reviewer notification:", err instanceof Error ? err.message : err)
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")
  const conversationId = request.nextUrl.searchParams.get("conversation_id")

  if (!sessionId || !conversationId) {
    return NextResponse.json({ error: "Missing session_id or conversation_id." }, { status: 400 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Solly is temporarily unavailable. Please try again shortly." }, { status: 503 })
    }

    let session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch {
      return NextResponse.json({ error: "Invalid or unknown purchase session." }, { status: 403 })
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not verified." }, { status: 403 })
    }

    const codes = (session.metadata?.codes ?? "").split(",").filter(Boolean)
    if (codes.length === 0) {
      return NextResponse.json({ error: "Purchase could not be matched to any templates." }, { status: 404 })
    }

    const email = session.customer_details?.email ?? session.customer_email ?? null
    const paymentIntent =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id

    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("form_purchases")
      .upsert(
        {
          email: email ?? "unknown@solumsafetyconsulting.com.au",
          form_codes: codes,
          amount_cents: session.amount_total ?? 0,
          currency: "aud",
          status: "paid",
          stripe_checkout_session_id: sessionId,
          stripe_payment_intent: paymentIntent ?? null,
          conversation_id: conversationId,
        },
        { onConflict: "stripe_checkout_session_id" },
      )
      .select("id")
      .single()

    if (purchaseError) {
      console.log("[solly] Failed to record purchase:", purchaseError.message)
    }

    const unlocked = []
    for (const code of codes) {
      const { data: formSession, error: fetchError } = await supabaseAdmin
        .from("form_sessions")
        .select("id, final_html")
        .eq("conversation_id", conversationId)
        .eq("form_code", code)
        .maybeSingle()

      if (fetchError || !formSession) {
        console.log("[solly] No matching form_session for code", code)
        continue
      }

      const { error: unlockError } = await supabaseAdmin
        .from("form_sessions")
        .update({
          status: "pending_review",
          form_purchase_id: purchase?.id ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", formSession.id)

      if (unlockError) {
        console.log("[solly] Failed to move", code, "to review:", unlockError.message)
        continue
      }

      unlocked.push({ formCode: code, sessionId: formSession.id })
    }

    await supabaseAdmin
      .from("solly_conversations")
      .update({ status: "ready_for_purchase", client_email: email, updated_at: new Date().toISOString() })
      .eq("id", conversationId)

    if (email && unlocked.length > 0) {
      await notifyReviewerOfPendingDocuments(email, unlocked.map((u) => u.formCode), request.nextUrl.origin)
    }

    // Same-site redirect — no separate app origin needed.
    const origin = request.nextUrl.origin
    return NextResponse.redirect(`${origin}/solly/complete?conversation=${conversationId}`)
  } catch (err) {
    console.log("[solly] Verify error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Could not verify purchase." }, { status: 500 })
  }
}
