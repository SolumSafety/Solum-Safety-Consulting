import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { stripe } from "@/lib/stripe"

async function getOrigin() {
  const headersList = await headers()
  return (
    headersList.get("origin") ??
    (headersList.get("host") ? `https://${headersList.get("host")}` : "")
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Solly is temporarily unavailable. Please try again shortly." }, { status: 503 })
    }

    const { conversationId, email } = (await request.json()) as {
      conversationId: string
      email: string
    }

    if (!conversationId || !email) {
      return NextResponse.json({ error: "Missing conversationId or email." }, { status: 400 })
    }

    const { data: conversation, error: convError } = await supabaseAdmin
      .from("solly_conversations")
      .select("*")
      .eq("id", conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 })
    }

    const confirmedCodes: string[] = conversation.confirmed_form_codes ?? []
    if (confirmedCodes.length === 0) {
      return NextResponse.json({ error: "No confirmed templates to finalize." }, { status: 400 })
    }

    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("form_sessions")
      .select("*")
      .eq("conversation_id", conversationId)
      .in("form_code", confirmedCodes)

    if (sessionsError || !sessions || sessions.length === 0) {
      return NextResponse.json({ error: "Drafts not ready yet — run /api/solly/draft first." }, { status: 400 })
    }

    const notReady = sessions.filter((s) => s.status !== "ready_for_purchase" && s.status !== "delivered")
    if (notReady.length > 0) {
      return NextResponse.json(
        { error: `These templates aren't drafted yet: ${notReady.map((s) => s.form_code).join(", ")}` },
        { status: 400 },
      )
    }

    // ---------------------------------------------------------------
    // TRUE branch — client already holds the SolumWHS package entitlement.
    // ---------------------------------------------------------------
    const { data: entitlement, error: entError } = await supabaseAdmin
      .from("solly_entitlements")
      .select("id")
      .eq("email", email)
      .eq("status", "paid")
      .maybeSingle()

    if (entError) {
      console.log("[solly] Entitlement lookup failed:", entError.message)
    }

    if (entitlement) {
      const unlocked = []
      for (const session of sessions) {
        if (session.status !== "delivered") {
          const { error: unlockError } = await supabaseAdmin
            .from("form_sessions")
            .update({
              status: "delivered",
              solly_entitlement_id: entitlement.id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", session.id)

          if (unlockError) {
            console.log("[solly] Failed to unlock session", session.id, unlockError.message)
            continue
          }
        }
        unlocked.push({ formCode: session.form_code, sessionId: session.id, finalHtml: session.final_html })
      }

      await supabaseAdmin
        .from("solly_conversations")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", conversationId)

      return NextResponse.json({
        unlocked: true,
        method: "entitlement",
        documents: unlocked,
      })
    }

    // ---------------------------------------------------------------
    // FALSE branch — no bundle entitlement. Offer a one-off purchase for
    // the confirmed templates, or flag bundle-only ones for upsell.
    // ---------------------------------------------------------------
    const { data: templates, error: templatesError } = await supabaseAdmin
      .from("forms_library")
      .select("code, title, standalone_price_cents")
      .in("code", confirmedCodes)

    if (templatesError || !templates) {
      return NextResponse.json({ error: "Could not load pricing." }, { status: 500 })
    }

    const bundleOnly = templates.filter((t) => t.standalone_price_cents == null)
    const purchasable = templates.filter((t) => t.standalone_price_cents != null)

    if (bundleOnly.length > 0 && purchasable.length === 0) {
      return NextResponse.json({
        unlocked: false,
        requiresBundle: true,
        bundleOnlyCodes: bundleOnly.map((t) => t.code),
        message:
          "These templates are only available as part of the full SolumWHS package ($165, unlocks Solly for everything, forever).",
      })
    }

    const lineItems = purchasable.map((t) => ({
      price_data: {
        currency: "aud",
        product_data: { name: t.title },
        unit_amount: t.standalone_price_cents!,
      },
      quantity: 1,
    }))

    const origin = await getOrigin()

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: email,
      metadata: {
        conversationId,
        codes: purchasable.map((t) => t.code).join(","),
      },
      success_url: `${origin}/api/solly/verify?session_id={CHECKOUT_SESSION_ID}&conversation_id=${conversationId}`,
      cancel_url: `${origin}/solly?conversation=${conversationId}`,
    })

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 500 })
    }

    await supabaseAdmin
      .from("solly_conversations")
      .update({ status: "ready_for_purchase", updated_at: new Date().toISOString() })
      .eq("id", conversationId)

    return NextResponse.json({
      unlocked: false,
      method: "one_off_purchase",
      checkoutUrl: session.url,
      bundleOnlyCodes: bundleOnly.length > 0 ? bundleOnly.map((t) => t.code) : undefined,
      bundleUpsellMessage:
        bundleOnly.length > 0
          ? `Note: ${bundleOnly.map((t) => t.title).join(", ")} ${bundleOnly.length > 1 ? "are" : "is"} bundle-only and not included in this checkout. The full $165 package unlocks these too, forever.`
          : undefined,
    })
  } catch (err) {
    console.log("[solly] Finalize error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Could not finalize documents. Please try again." }, { status: 500 })
  }
}
