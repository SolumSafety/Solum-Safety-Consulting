import { NextRequest, NextResponse } from "next/server"
import { anthropic, SOLLY_MODEL } from "@/lib/solly/anthropic-client"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

const BLOG_SYSTEM_PROMPT = `You write SEO-focused blog articles for Solum Safety Consulting, an Australian
WHS (Work Health and Safety) consultancy that sells WHS templates, forms, and offers an AI
assistant (Solly) that helps clients complete them.

RULES:
- Write for a practical, time-poor Australian small-to-medium business audience — plain
  language, short paragraphs, real-world examples. Not academic, not legalistic.
- NEVER invent, guess, or state a specific legislative citation (Act section number, WHS
  Regulation clause number, specific Code of Practice title, AS/NZS standard number) unless
  it is extremely well-established and general (e.g. "the Work Health and Safety Act" as a
  concept is fine; a specific section number like "s.19" is NOT fine unless you are certain).
  When in doubt, describe the obligation in plain language rather than citing a specific
  clause. An article with a wrong citation is worse than one with no citation.
- Never claim something is legally required without qualifying language ("generally
  required," "in most jurisdictions," "for high-risk work") since WHS obligations vary by
  state/territory and by the specific work involved.
- Naturally mention relevant Solum Safety Consulting templates/services where genuinely
  helpful to the reader (not forced) — e.g. if the article is about JSAs, it's natural to
  mention that Solum has a JSA template and that Solly (the AI WHS Agent) can help draft one.
  Don't be salesy or add a hard sell at the end — one natural mention in the body is enough.
- Structure: a clear H1 (as the article title, handled separately), an engaging intro
  paragraph, 3-6 H2 sections with practical content, and a short concluding paragraph. Use
  H3s sparingly if a section needs subpoints. Use bullet lists or numbered lists where they
  genuinely aid scanability.
- Length: 600-1000 words. Long enough to be genuinely useful and rank well, not padded.
- Output ONLY the article body as clean HTML using semantic tags (<p>, <h2>, <h3>, <ul>,
  <li>, <strong>). No <html>/<head>/<body> wrapper, no inline styles, no commentary before
  or after, no markdown code fences.`

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

  const { topic, targetKeyword } = (await request.json()) as { topic: string; targetKeyword?: string }
  if (!topic) {
    return NextResponse.json({ error: "Missing topic." }, { status: 400 })
  }

  try {
    const response = await anthropic.messages.create({
      model: SOLLY_MODEL,
      max_tokens: 4000,
      system: BLOG_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Write a blog article on this topic: "${topic}"${
            targetKeyword ? `\n\nTarget SEO keyword to naturally include a few times: "${targetKeyword}"` : ""
          }\n\nAlso provide, before the article HTML, on separate lines:\nTITLE: <article title, under 60 characters>\nMETA: <meta description, under 155 characters, includes the target keyword if given>\nSLUG: <url-safe-slug-with-hyphens>\n\nThen a line with just ---, then the article HTML.`,
        },
      ],
    })

    const rawText = response.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim()

    const titleMatch = rawText.match(/TITLE:\s*(.+)/)
    const metaMatch = rawText.match(/META:\s*(.+)/)
    const slugMatch = rawText.match(/SLUG:\s*(.+)/)
    const bodyStart = rawText.indexOf("---")
    const contentHtml = bodyStart !== -1 ? rawText.slice(bodyStart + 3).trim() : rawText

    const title = titleMatch?.[1]?.trim() ?? topic
    const metaDescription = metaMatch?.[1]?.trim() ?? ""
    let slug = slugMatch?.[1]?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? ""
    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    }

    // Avoid slug collisions.
    const { data: existing } = await supabaseAdmin.from("blog_posts").select("slug").eq("slug", slug).maybeSingle()
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const { data: post, error: insertError } = await supabaseAdmin
      .from("blog_posts")
      .insert({
        slug,
        title,
        meta_description: metaDescription,
        target_keyword: targetKeyword ?? null,
        content_html: contentHtml,
        status: "draft",
      })
      .select("*")
      .single()

    if (insertError || !post) {
      return NextResponse.json({ error: "Could not save draft." }, { status: 500 })
    }

    return NextResponse.json({ post })
  } catch (err) {
    console.log("[blog] Generate error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Could not generate article. Please try again." }, { status: 500 })
  }
}
