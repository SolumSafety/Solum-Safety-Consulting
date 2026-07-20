import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Solly is temporarily unavailable. Please try again shortly." }, { status: 503 })
    }

    const { conversationId, confirmedCodes } = (await request.json()) as {
      conversationId: string
      confirmedCodes: string[]
    }

    if (!conversationId || !Array.isArray(confirmedCodes) || confirmedCodes.length === 0) {
      return NextResponse.json({ error: "Missing conversationId or confirmedCodes." }, { status: 400 })
    }

    const { data: conversation, error: convError } = await supabaseAdmin
      .from("solly_conversations")
      .select("*")
      .eq("id", conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 })
    }

    // Only allow confirming codes Solly actually recommended.
    const recommended = new Set(conversation.recommended_form_codes ?? [])
    const invalid = confirmedCodes.filter((c) => !recommended.has(c))
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `These codes weren't recommended in this conversation: ${invalid.join(", ")}` },
        { status: 400 },
      )
    }

    // Create a form_sessions row per confirmed template (skip if one
    // already exists for this conversation+code, e.g. on retry).
    const sessions = []
    for (const code of confirmedCodes) {
      const { data: existing } = await supabaseAdmin
        .from("form_sessions")
        .select("id")
        .eq("conversation_id", conversationId)
        .eq("form_code", code)
        .maybeSingle()

      if (existing) {
        sessions.push(existing.id)
        continue
      }

      const { data: created, error: createError } = await supabaseAdmin
        .from("form_sessions")
        .insert({
          conversation_id: conversationId,
          form_code: code,
          client_email: conversation.client_email,
          jurisdiction: conversation.jurisdiction,
          status: "in_progress",
        })
        .select("id")
        .single()

      if (createError || !created) {
        console.log("[solly] Failed to create form_session for", code, createError?.message)
        continue
      }
      sessions.push(created.id)
    }

    const { error: updateError } = await supabaseAdmin
      .from("solly_conversations")
      .update({ confirmed_form_codes: confirmedCodes, status: "confirmed", updated_at: new Date().toISOString() })
      .eq("id", conversationId)

    if (updateError) {
      console.log("[solly] Failed to update conversation status:", updateError.message)
    }

    return NextResponse.json({ conversationId, formSessionIds: sessions, confirmedCodes })
  } catch (err) {
    console.log("[solly] Confirm error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Could not confirm templates." }, { status: 500 })
  }
}
