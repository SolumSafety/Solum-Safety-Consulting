import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  const bypassKey = request.headers.get("x-solly-bypass")
  const expected = process.env.SOLLY_ADMIN_BYPASS_KEY
  if (!expected || bypassKey !== expected) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 })
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 })
  }

  const { postId, action } = (await request.json()) as { postId: string; action: "publish" | "unpublish" | "delete" }
  if (!postId || !action) {
    return NextResponse.json({ error: "Missing postId or action." }, { status: 400 })
  }

  if (action === "delete") {
    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", postId)
    if (error) return NextResponse.json({ error: "Could not delete." }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabaseAdmin
    .from("blog_posts")
    .update({
      status: action === "publish" ? "published" : "draft",
      published_at: action === "publish" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)

  if (error) {
    return NextResponse.json({ error: "Could not update post." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
