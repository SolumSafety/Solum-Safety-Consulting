import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { stripe } from "@/lib/stripe"

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
          status: "delivered",
          form_purchase_id: purchase?.id ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", formSession.id)

      if (unlockError) {
        console.log("[solly] Failed to unlock", code, unlockError.message)
        continue
      }

      unlocked.push({ formCode: code, sessionId: formSession.id })
    }

    await supabaseAdmin
      .from("solly_conversations")
      .update({ status: "completed", client_email: email, updated_at: new Date().toISOString() })
      .eq("id", conversationId)

    // Same-site redirect — no separate app origin needed.
    const origin = request.nextUrl.origin
    return NextResponse.redirect(`${origin}/solly/complete?conversation=${conversationId}`)
  } catch (err) {
    console.log("[solly] Verify error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Could not verify purchase." }, { status: 500 })
  }
}
