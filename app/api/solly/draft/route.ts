import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { anthropic, SOLLY_MODEL } from "@/lib/solly/anthropic-client"
import { SOLLY_DRAFT_SYSTEM_PROMPT } from "@/lib/solly/prompts"
import { checkRateLimit, getClientIdentifier } from "@/lib/solly/rate-limit"

function applyWatermark(html: string): string {
  const watermarkStyle = `
    <style>
      .solly-watermark-wrap { position: relative; }
      .solly-watermark-overlay {
        position: fixed; inset: 0; pointer-events: none; z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
      }
      .solly-watermark-text {
        font-size: 64px; font-weight: 700; color: rgba(120,120,120,0.18);
        transform: rotate(-30deg); white-space: nowrap; user-select: none;
      }
    </style>`
  const overlay = `<div class="solly-watermark-overlay"><span class="solly-watermark-text">DRAFT — NOT FOR USE — PURCHASE TO UNLOCK</span></div>`
  return `${watermarkStyle}<div class="solly-watermark-wrap">${overlay}${html}${DRAFT_DISCLAIMER}</div>`
}

// Fixed, non-AI-generated text — always identical regardless of what Claude
// produced, so it can't be silently dropped or altered by the model.
const DRAFT_DISCLAIMER = `
  <div style="margin-top:32px;padding:16px;border-top:2px solid #E4DFD3;font-size:12px;color:#5A6472;">
    <strong>Draft notice:</strong> This document was drafted with the assistance of Solly, an AI WHS Agent, based
    on information provided in a chat conversation. It has not yet been reviewed and must not be used, relied
    upon, or actioned in this form.
  </div>`

const FINAL_DISCLAIMER = `
  <div style="margin-top:32px;padding:16px;border-top:2px solid #E4DFD3;font-size:12px;color:#5A6472;">
    <strong>Document notice:</strong> This document was drafted with the assistance of Solly, an AI WHS Agent,
    based on information provided in a chat conversation. It should be reviewed and adapted by a qualified person
    to reflect your specific site conditions before use, and does not constitute legal advice.
  </div>`

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Solly is temporarily unavailable. Please try again shortly." }, { status: 503 })
    }

    const { conversationId, email } = (await request.json()) as { conversationId: string; email?: string }
    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId." }, { status: 400 })
    }

    const { data: conversation, error: convError } = await supabaseAdmin
      .from("solly_conversations")
      .select("*")
      .eq("id", conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 })
    }

    // If an email was supplied and the conversation doesn't have one yet
    // (e.g. a client just purchased credits before ever reaching the
    // finalize step), attach it now so credits can be recognized.
    if (email && !conversation.client_email) {
      await supabaseAdmin.from("solly_conversations").update({ client_email: email }).eq("id", conversationId)
      conversation.client_email = email
    }

    // Paying clients (topped-up credits) skip the free IP-based limit
    // entirely — a credit is consumed instead. Falls back to the IP limit
    // if they have none.
    let usedCredit = false
    if (conversation.client_email) {
      const { data: creditRow } = await supabaseAdmin
        .from("solly_credits")
        .select("credits_remaining")
        .eq("email", conversation.client_email)
        .maybeSingle()

      if (creditRow && creditRow.credits_remaining > 0) {
        const { error: decrementError } = await supabaseAdmin
          .from("solly_credits")
          .update({ credits_remaining: creditRow.credits_remaining - 1, updated_at: new Date().toISOString() })
          .eq("email", conversation.client_email)
          .eq("credits_remaining", creditRow.credits_remaining) // optimistic lock, avoids double-spend races

        if (!decrementError) usedCredit = true
      }
    }

    if (!usedCredit) {
      const identifier = getClientIdentifier(request)
      const rateLimit = await checkRateLimit({
        identifier,
        route: "draft",
        maxRequests: 8,
        windowMinutes: 60,
        bypassKey: request.headers.get("x-solly-bypass"),
      })
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: "You've requested a lot of drafts recently. Please wait a bit before trying again.",
            rateLimited: true,
          },
          { status: 429 },
        )
      }
    }

    await supabaseAdmin
      .from("solly_conversations")
      .update({ status: "drafting", updated_at: new Date().toISOString() })
      .eq("id", conversationId)

    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("form_sessions")
      .select("*")
      .eq("conversation_id", conversationId)

    if (sessionsError || !sessions) {
      return NextResponse.json({ error: "Could not load draft sessions." }, { status: 500 })
    }

    const transcriptText = (conversation.conversation ?? [])
      .map((t: { role: string; content: string }) => `${t.role.toUpperCase()}: ${t.content}`)
      .join("\n")

    const results = []
    for (const session of sessions) {
      const { data: template, error: templateError } = await supabaseAdmin
        .from("forms_library")
        .select("code, title, html_content, applicable_jurisdictions, applicable_legislation")
        .eq("code", session.form_code)
        .single()

      if (templateError || !template?.html_content) {
        console.log("[solly] Missing template content for", session.form_code)
        continue
      }

      const legislationNote = template.applicable_legislation
        ? `LEGAL BASIS FOR THIS TEMPLATE: ${template.applicable_legislation}\nYou may reference this in the document where the template structure calls for a legislative basis, using this text exactly. Do not add, modify, or supplement it with any other legislation, code of practice, or standard you are not given here.`
        : `LEGAL BASIS FOR THIS TEMPLATE: not provided in the system. If the template has a field for legislative reference, leave it as [CONFIRM: applicable legislation/code of practice reference] rather than inventing one.`

      const claudeResponse = await anthropic.messages.create({
        model: SOLLY_MODEL,
        max_tokens: 8000,
        system: SOLLY_DRAFT_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `CONVERSATION WITH CLIENT:\n${transcriptText}\n\n${legislationNote}\n\nBLANK TEMPLATE (${template.title}):\n${template.html_content}\n\nReturn the completed HTML document.`,
          },
        ],
      })

      const filledHtml = claudeResponse.content
        .filter((b): b is { type: "text"; text: string } => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim()

      const previewHtml = applyWatermark(filledHtml)
      const finalHtmlWithDisclaimer = `${filledHtml}${FINAL_DISCLAIMER}`

      const { error: updateError } = await supabaseAdmin
        .from("form_sessions")
        .update({
          preview_html: previewHtml,
          // Store the clean version too so finalize doesn't need to re-generate.
          final_html: finalHtmlWithDisclaimer,
          status: "ready_for_purchase",
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.id)

      if (updateError) {
        console.log("[solly] Failed to save draft for", session.form_code, updateError.message)
        continue
      }

      results.push({ formCode: session.form_code, sessionId: session.id, previewHtml })
    }

    await supabaseAdmin
      .from("solly_conversations")
      .update({ status: "ready_for_purchase", updated_at: new Date().toISOString() })
      .eq("id", conversationId)

    return NextResponse.json({ conversationId, drafts: results })
  } catch (err) {
    console.log("[solly] Draft error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Solly could not complete the draft. Please try again." }, { status: 500 })
  }
}
