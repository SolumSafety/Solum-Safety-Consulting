import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
// @ts-expect-error — html-to-docx has no bundled type definitions
import HTMLtoDOCX from "html-to-docx"

export async function GET(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Solly is temporarily unavailable. Please try again shortly." }, { status: 503 })
  }

  const { data: session, error } = await supabaseAdmin
    .from("form_sessions")
    .select("form_code, final_html, status")
    .eq("id", sessionId)
    .single()

  if (error || !session) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 })
  }

  // Same gate as the HTML download route — only a delivered session
  // releases the clean (unwatermarked) content, in any format.
  if (session.status !== "delivered" || !session.final_html) {
    return NextResponse.json({ error: "This document hasn't been unlocked yet." }, { status: 403 })
  }

  try {
    const buffer = await HTMLtoDOCX(session.final_html, undefined, {
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber: false,
    })

    const filename = `${session.form_code}.docx`
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (err) {
    console.log("[solly] docx conversion error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Could not generate the Word version. The HTML version is still available." }, { status: 500 })
  }
}
