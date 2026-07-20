import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { stripe } from "@/lib/stripe"
import { decodeCodesFromMetadata } from "@/lib/checkout"
import { anthropic, SOLLY_MODEL } from "@/lib/solly/anthropic-client"
import { checkRateLimit, getClientIdentifier } from "@/lib/solly/rate-limit"

const TRANSLATE_PROMPT = `You translate WHS toolbox talk documents for Solum Safety Consulting into other
languages for non-English-speaking workforces in Australia.

RULES:
- Translate the visible text content faithfully — don't summarise, shorten, or add content
  that wasn't in the original.
- Preserve ALL HTML structure, tags, classes, and attributes exactly as given. Only translate
  the human-readable text nodes (headings, paragraphs, list items, labels, button text). Never
  translate CSS, JavaScript, HTML tag names, attribute names, or class names.
- Keep any codes, document reference numbers (e.g. SSC-TBT-01), dates, and the "Solum Safety
  Consulting" brand name untranslated.
- Use natural, workplace-appropriate language in the target language — this will be read aloud
  or followed by workers on site, not read as formal literature.
- Return ONLY the complete translated HTML document. No commentary, no markdown fences.`

// Bundle codes that unlock free translation for any of their talks — the
// only two toolbox-talk-selling packages right now.
const TRANSLATION_ELIGIBLE_BUNDLES = new Set(["GTBT-SSC-Bundle-001"])

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 })
    }

    const identifier = getClientIdentifier(request)
    const rateLimit = await checkRateLimit({
      identifier,
      route: "translate",
      maxRequests: 15,
      windowMinutes: 60,
      bypassKey: request.headers.get("x-solly-bypass"),
    })
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "You've translated a lot of talks recently. Please wait a bit before trying again." },
        { status: 429 },
      )
    }

    const { sessionId, talkCode, targetLanguage } = (await request.json()) as {
      sessionId: string
      talkCode: string
      targetLanguage: string
    }

    if (!sessionId || !talkCode || !targetLanguage) {
      return NextResponse.json({ error: "Missing sessionId, talkCode, or targetLanguage." }, { status: 400 })
    }

    // Verify this purchase actually included a bundle this talk belongs to
    // — same pattern as the existing /api/download route.
    let session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch {
      return NextResponse.json({ error: "Invalid or unknown purchase session." }, { status: 403 })
    }
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not verified." }, { status: 403 })
    }

    const purchasedCodes = decodeCodesFromMetadata(session.metadata)
    const hasEligibleBundle = purchasedCodes.some((c) => TRANSLATION_ELIGIBLE_BUNDLES.has(c))
    if (!hasEligibleBundle) {
      return NextResponse.json({ error: "This purchase doesn't include a translatable toolbox talk bundle." }, { status: 403 })
    }

    const { data: talk, error: talkError } = await supabaseAdmin
      .from("toolbox_talks")
      .select("code, title, bundle_code, html_content")
      .eq("code", talkCode)
      .single()

    if (talkError || !talk) {
      return NextResponse.json({ error: "Talk not found." }, { status: 404 })
    }

    if (!purchasedCodes.includes(talk.bundle_code)) {
      return NextResponse.json({ error: "This purchase doesn't include the bundle this talk belongs to." }, { status: 403 })
    }

    const claudeResponse = await anthropic.messages.create({
      model: SOLLY_MODEL,
      max_tokens: 8000,
      system: TRANSLATE_PROMPT,
      messages: [
        {
          role: "user",
          content: `Translate this toolbox talk into ${targetLanguage}:\n\n${talk.html_content}`,
        },
      ],
    })

    const translatedHtml = claudeResponse.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim()

    return NextResponse.json({
      code: talk.code,
      title: talk.title,
      targetLanguage,
      html: translatedHtml,
    })
  } catch (err) {
    console.log("[toolbox-talks] Translate error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Could not translate this talk. Please try again." }, { status: 500 })
  }
}
