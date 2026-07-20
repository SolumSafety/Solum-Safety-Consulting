import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

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

  // The one gate that actually matters: only a delivered session releases
  // the clean (unwatermarked) final_html. Everything else — entitlement
  // checks, payment verification — has already happened by this point in
  // the flow; this route just enforces the final state.
  if (session.status !== "delivered" || !session.final_html) {
    return NextResponse.json({ error: "This document hasn't been unlocked yet." }, { status: 403 })
  }

  const filename = `${session.form_code}.html`
  return new NextResponse(session.final_html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
