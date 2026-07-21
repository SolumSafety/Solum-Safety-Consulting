import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { checkRateLimit, getClientIdentifier } from "@/lib/solly/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Solly is temporarily unavailable." }, { status: 503 })
    }

    const identifier = getClientIdentifier(request)
    const rateLimit = await checkRateLimit({
      identifier,
      route: "logo-upload",
      maxRequests: 10,
      windowMinutes: 60,
      bypassKey: request.headers.get("x-solly-bypass"),
    })
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Please wait a bit before uploading another logo." }, { status: 429 })
    }

    const { conversationId, imageBase64, mediaType } = (await request.json()) as {
      conversationId?: string
      imageBase64: string
      mediaType: string
    }

    if (!conversationId || !imageBase64 || !mediaType) {
      return NextResponse.json({ error: "Missing conversationId or image." }, { status: 400 })
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(mediaType)) {
      return NextResponse.json({ error: "Unsupported image type. Please use PNG, JPG, WEBP, or SVG." }, { status: 400 })
    }
    if (imageBase64.length > 5_000_000) {
      return NextResponse.json({ error: "Logo file is too large. Please use a smaller image." }, { status: 400 })
    }

    const { data: conversation } = await supabaseAdmin
      .from("solly_conversations")
      .select("id")
      .eq("id", conversationId)
      .maybeSingle()
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 })
    }

    const buffer = Buffer.from(imageBase64, "base64")
    const ext = mediaType.split("/")[1].replace("svg+xml", "svg")
    const blob = await put(`solly-logos/${conversationId}-${Date.now()}.${ext}`, buffer, {
      access: "public",
      contentType: mediaType,
    })

    await supabaseAdmin
      .from("solly_conversations")
      .update({ client_logo_url: blob.url, updated_at: new Date().toISOString() })
      .eq("id", conversationId)

    return NextResponse.json({ logoUrl: blob.url })
  } catch (err) {
    console.log("[solly] Logo upload error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Could not upload logo. Please try again." }, { status: 500 })
  }
}
