import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { anthropic, SOLLY_MODEL } from "@/lib/solly/anthropic-client"
import { SOLLY_INTAKE_SYSTEM_PROMPT } from "@/lib/solly/prompts"

type ChatTurn = { role: "user" | "assistant"; content: string }

type IntakeReply =
  | { type: "question"; message: string }
  | { type: "recommendation"; message: string; codes: string[] }

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Solly is temporarily unavailable. Please try again shortly." }, { status: 503 })
    }

    const body = await request.json()
    const { conversationId, message, clientEmail } = body as {
      conversationId?: string
      message: string
      clientEmail?: string
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message." }, { status: 400 })
    }

    // Load or create the conversation.
    let conversation
    if (conversationId) {
      const { data, error } = await supabaseAdmin
        .from("solly_conversations")
        .select("*")
        .eq("id", conversationId)
        .single()
      if (error || !data) {
        return NextResponse.json({ error: "Conversation not found." }, { status: 404 })
      }
      conversation = data
    } else {
      const { data, error } = await supabaseAdmin
        .from("solly_conversations")
        .insert({ client_email: clientEmail ?? null, conversation: [], status: "gathering_requirements" })
        .select("*")
        .single()
      if (error || !data) {
        return NextResponse.json({ error: "Could not start conversation." }, { status: 500 })
      }
      conversation = data
    }

    const transcript: ChatTurn[] = conversation.conversation ?? []
    transcript.push({ role: "user", content: message })

    // Pull lightweight metadata only (not full html_content) to keep the
    // prompt small — Solly just needs to know what's available to recommend.
    const { data: forms, error: formsError } = await supabaseAdmin
      .from("forms_library")
      .select("code, title, category, subcategory, applicable_jurisdictions, applicable_legislation")
      .eq("is_active", true)

    if (formsError) {
      return NextResponse.json({ error: "Could not load template library." }, { status: 500 })
    }

    const catalogueContext = `AVAILABLE TEMPLATES:\n${(forms ?? [])
      .map((f) => {
        const jurisdictions = (f.applicable_jurisdictions ?? ["ALL"]).join("/")
        const legislation = f.applicable_legislation ? ` [Legal basis: ${f.applicable_legislation}]` : ""
        return `${f.code} — ${f.title} (${f.category}${f.subcategory ? " / " + f.subcategory : ""}) [Jurisdiction: ${jurisdictions}]${legislation}`
      })
      .join("\n")}`

    const claudeResponse = await anthropic.messages.create({
      model: SOLLY_MODEL,
      max_tokens: 1000,
      system: `${SOLLY_INTAKE_SYSTEM_PROMPT}\n\n${catalogueContext}`,
      messages: transcript.map((t) => ({ role: t.role, content: t.content })),
      tools: [
        {
          name: "respond_to_client",
          description:
            "Send your reply to the client. Use type='question' while still gathering information, or type='recommendation' once you have enough detail to propose specific templates.",
          input_schema: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["question", "recommendation"] },
              message: {
                type: "string",
                description: "The natural, conversational reply shown directly to the client. No markdown code fences, no JSON.",
              },
              codes: {
                type: "array",
                items: { type: "string" },
                description: "Only when type='recommendation': the exact template codes from AVAILABLE TEMPLATES being proposed.",
              },
            },
            required: ["type", "message"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "respond_to_client" },
    })

    const toolUse = claudeResponse.content.find(
      (block): block is { type: "tool_use"; input: Record<string, unknown> } => block.type === "tool_use",
    )

    let parsed: IntakeReply
    if (toolUse && typeof toolUse.input.message === "string") {
      const input = toolUse.input
      if (input.type === "recommendation" && Array.isArray(input.codes)) {
        parsed = { type: "recommendation", message: input.message as string, codes: input.codes as string[] }
      } else {
        parsed = { type: "question", message: input.message as string }
      }
    } else {
      // Extremely unlikely with a forced tool call, but never leave the
      // client with nothing — fall back to any text block Claude produced.
      const rawText = claudeResponse.content
        .filter((block): block is { type: "text"; text: string } => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim()
      parsed = { type: "question", message: rawText || "Sorry, I had trouble responding. Could you try rephrasing that?" }
    }

    transcript.push({ role: "assistant", content: parsed.message })

    const updates: Record<string, unknown> = {
      conversation: transcript,
      updated_at: new Date().toISOString(),
    }

    if (parsed.type === "recommendation") {
      // Only keep codes that actually exist in the library.
      const validCodes = new Set((forms ?? []).map((f) => f.code))
      const codes = parsed.codes.filter((c) => validCodes.has(c))
      updates.recommended_form_codes = codes
      updates.status = "recommended"
    }

    const { error: updateError } = await supabaseAdmin
      .from("solly_conversations")
      .update(updates)
      .eq("id", conversation.id)

    if (updateError) {
      console.log("[solly] Failed to persist conversation:", updateError.message)
    }

    return NextResponse.json({
      conversationId: conversation.id,
      reply: parsed.message,
      type: parsed.type,
      recommendedCodes: parsed.type === "recommendation" ? updates.recommended_form_codes : undefined,
    })
  } catch (err) {
    console.log("[solly] Chat error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Solly ran into a problem. Please try again." }, { status: 500 })
  }
}
