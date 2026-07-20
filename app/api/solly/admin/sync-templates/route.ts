import { NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { whsTemplates, projectDocs } from "@/lib/catalogue"
import { FILES, PRICES } from "@/lib/products"

// Only these two categories are individually fillable forms Solly can
// draft. Toolbox talks, leadership guides, and industry-specific sets are
// sold and used as complete packages, not drafted per-document.
const SYNC_SETS: { items: typeof whsTemplates; category: string }[] = [
  { items: whsTemplates, category: "WHS" },
  { items: projectDocs, category: "Project Management" },
]

export async function POST(request: NextRequest) {
  const bypassKey = request.headers.get("x-solly-bypass")
  const expected = process.env.SOLLY_ADMIN_BYPASS_KEY
  if (!expected || bypassKey !== expected) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 })
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Solly is temporarily unavailable." }, { status: 503 })
  }

  const { data: existing, error: existingError } = await supabaseAdmin.from("forms_library").select("code")
  if (existingError) {
    return NextResponse.json({ error: "Could not load existing templates." }, { status: 500 })
  }
  const existingCodes = new Set((existing ?? []).map((r) => r.code))

  const results: { code: string; status: string; detail?: string }[] = []

  for (const { items, category } of SYNC_SETS) {
    for (const item of items) {
      if (existingCodes.has(item.code)) {
        results.push({ code: item.code, status: "skipped_exists" })
        continue
      }

      const files = FILES[item.code] ?? []
      const htmlPath = files.find((f) => f.toLowerCase().endsWith(".html"))
      if (!htmlPath) {
        results.push({ code: item.code, status: "skipped_no_html_file" })
        continue
      }

      let htmlContent: string
      try {
        const blob = await get(htmlPath, { access: "private" } as any)
        if (!blob) {
          results.push({ code: item.code, status: "error_blob_not_found", detail: htmlPath })
          continue
        }
        const res = await fetch(blob.url)
        htmlContent = await res.text()
      } catch (err) {
        results.push({
          code: item.code,
          status: "error_fetching_blob",
          detail: err instanceof Error ? err.message : String(err),
        })
        continue
      }

      const priceCents = PRICES[item.code] ?? null

      const { error: insertError } = await supabaseAdmin.from("forms_library").insert({
        code: item.code,
        title: item.name,
        category,
        html_content: htmlContent,
        standalone_price_cents: priceCents,
        is_active: true,
      })

      if (insertError) {
        results.push({ code: item.code, status: "error_insert", detail: insertError.message })
        continue
      }

      results.push({ code: item.code, status: "inserted" })
    }
  }

  const summary = {
    inserted: results.filter((r) => r.status === "inserted").length,
    skipped_exists: results.filter((r) => r.status === "skipped_exists").length,
    errors: results.filter((r) => r.status.startsWith("error")).length,
  }

  return NextResponse.json({ summary, results })
}
