import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { anthropic, SOLLY_MODEL } from "@/lib/solly/anthropic-client"
import { checkRateLimit, getClientIdentifier } from "@/lib/solly/rate-limit"
import { bundles, industryBundles } from "@/lib/catalogue"

const PHOTO_ANALYSIS_PROMPT = `You are Solly, the WHS Agent for Solum Safety Consulting. A client has uploaded a
photo of their worksite and wants you to identify visible WHS hazards.

RULES:
- Only report hazards you can actually see evidence of in the image. Never invent or assume
  a hazard that isn't visibly indicated — e.g. don't claim "inadequate fall protection" unless
  you can see people at height without visible protection, or unguarded edges.
- Be specific about what you see and where (e.g. "the ladder on the left is not tied off" not
  "there may be ladder safety issues").
- Rate each hazard's apparent severity: low / medium / high — based only on what's visible,
  not assumptions about frequency or context you can't see.
- Do NOT provide legal citations, Code of Practice references, or compliance verdicts — you're
  flagging visible hazards for the client's awareness, not issuing a compliance assessment.
  Recommend they follow up with the matching form/template to properly document and address it.
- If the image shows nothing hazard-relevant (or isn't a worksite photo at all), say so plainly
  rather than inventing hazards to seem useful.
- After listing hazards, recommend matching draftable forms from DRAFTABLE FORMS (same rules as
  normal recommendations — real codes only, correct jurisdiction awareness if known) and any
  relevant PACKAGES.
- You must respond using the respond_to_photo_analysis tool.`

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Solly is temporarily unavailable. Please try again shortly." }, { status: 503 })
    }

    const { conversationId, imageBase64, mediaType, email } = (await request.json()) as {
      conversationId?: string
      imageBase64: string
      mediaType: string
      email?: string
    }

    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ error: "Missing image." }, { status: 400 })
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mediaType)) {
      return NextResponse.json({ error: "Unsupported image type." }, { status: 400 })
    }
    // Rough sanity check on size — base64 is ~33% larger than raw bytes.
    if (imageBase64.length > 10_000_000) {
      return NextResponse.json({ error: "Image is too large. Please use a smaller photo." }, { status: 400 })
    }

    // Paying clients (topped-up credits) skip the free IP-based limit
    // entirely — a credit is consumed instead, same pool as drafts. Falls
    // back to the IP limit if they have none.
    let usedCredit = false
    if (email) {
      const { data: creditRow } = await supabaseAdmin
        .from("solly_credits")
        .select("credits_remaining")
        .eq("email", email)
        .maybeSingle()

      if (creditRow && creditRow.credits_remaining > 0) {
        const { error: decrementError } = await supabaseAdmin
          .from("solly_credits")
          .update({ credits_remaining: creditRow.credits_remaining - 1, updated_at: new Date().toISOString() })
          .eq("email", email)
          .eq("credits_remaining", creditRow.credits_remaining) // optimistic lock, avoids double-spend races

        if (!decrementError) usedCredit = true
      }
    }

    if (!usedCredit) {
      const identifier = getClientIdentifier(request)
      const rateLimit = await checkRateLimit({
        identifier,
        route: "photo",
        maxRequests: 5,
        windowMinutes: 60,
        bypassKey: request.headers.get("x-solly-bypass"),
      })
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: "You've analysed a lot of photos recently. Please wait a bit before trying again.",
            rateLimited: true,
          },
          { status: 429 },
        )
      }
    }

    let conversation
    if (conversationId) {
      const { data } = await supabaseAdmin.from("solly_conversations").select("*").eq("id", conversationId).single()
      conversation = data
    }
    if (!conversation) {
      const { data, error } = await supabaseAdmin
        .from("solly_conversations")
        .insert({ conversation: [], status: "gathering_requirements", client_email: email ?? null })
        .select("*")
        .single()
      if (error || !data) return NextResponse.json({ error: "Could not start conversation." }, { status: 500 })
      conversation = data
    }
    if (email && !conversation.client_email) {
      await supabaseAdmin.from("solly_conversations").update({ client_email: email }).eq("id", conversation.id)
      conversation.client_email = email
    }

    const { data: forms } = await supabaseAdmin
      .from("forms_library")
      .select("code, title, category, subcategory, applicable_jurisdictions")
      .eq("is_active", true)
      .in("category", ["WHS", "Project Management"])

    const draftableContext = `DRAFTABLE FORMS:\n${(forms ?? [])
      .map((f) => `${f.code} — ${f.title} (${f.category}) [Jurisdiction: ${(f.applicable_jurisdictions ?? ["ALL"]).join("/")}]`)
      .join("\n")}`
    const packageContext = `PACKAGES:\n${[...bundles.map((b) => `${b.code} — ${b.name}`), ...industryBundles.map((i) => `${i.code} — ${i.name}`)].join("\n")}`

    const claudeResponse = await anthropic.messages.create({
      model: SOLLY_MODEL,
      max_tokens: 1500,
      system: `${PHOTO_ANALYSIS_PROMPT}\n\n${draftableContext}\n\n${packageContext}`,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType as "image/jpeg", data: imageBase64 } },
            { type: "text", text: "Analyse this worksite photo for visible WHS hazards." },
          ],
        },
      ],
      tools: [
        {
          name: "respond_to_photo_analysis",
          description: "Report the hazard analysis and recommendations for this photo.",
          input_schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "Conversational summary shown to the client — what you saw, in plain language.",
              },
              hazards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] },
                  },
                  required: ["description", "severity"],
                },
              },
              codes: { type: "array", items: { type: "string" }, description: "Draftable form codes recommended." },
              packageCodes: { type: "array", items: { type: "string" }, description: "Package codes recommended." },
            },
            required: ["message", "hazards"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "respond_to_photo_analysis" },
    })

    const toolUse = claudeResponse.content.find(
      (b): b is { type: "tool_use"; input: Record<string, unknown> } => b.type === "tool_use",
    )

    if (!toolUse) {
      return NextResponse.json({ error: "Solly could not analyse this photo. Please try again." }, { status: 500 })
    }

    const hazards = Array.isArray(toolUse.input.hazards) ? toolUse.input.hazards : []
    const message = typeof toolUse.input.message === "string" ? toolUse.input.message : "Here's what I found."

    const validFormCodes = new Set((forms ?? []).map((f) => f.code))
    const validPackageCodes = new Set([...bundles.map((b) => b.code), ...industryBundles.map((i) => i.code)])
    const codes = Array.isArray(toolUse.input.codes) ? (toolUse.input.codes as string[]).filter((c) => validFormCodes.has(c)) : []
    const packageCodes = Array.isArray(toolUse.input.packageCodes)
      ? (toolUse.input.packageCodes as string[]).filter((c) => validPackageCodes.has(c))
      : []

    const transcript = conversation.conversation ?? []
    transcript.push({ role: "user", content: "[Uploaded a worksite photo for hazard analysis]" })
    transcript.push({ role: "assistant", content: message })

    await supabaseAdmin
      .from("solly_conversations")
      .update({
        conversation: transcript,
        recommended_form_codes: codes,
        status: codes.length > 0 || packageCodes.length > 0 ? "recommended" : conversation.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversation.id)

    return NextResponse.json({
      conversationId: conversation.id,
      reply: message,
      hazards,
      recommendedCodes: codes,
      recommendedForms: codes.map((code) => ({
        code,
        title: (forms ?? []).find((f) => f.code === code)?.title ?? code,
      })),
      recommendedPackages: packageCodes.map((code) => {
        const bundle = bundles.find((b) => b.code === code)
        const industry = industryBundles.find((i) => i.code === code)
        return { code, name: bundle?.name ?? industry?.name ?? code }
      }),
    })
  } catch (err) {
    console.log("[solly] Photo analysis error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Could not analyse this photo. Please try again." }, { status: 500 })
  }
}
