import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Server-only client using the service role key — bypasses RLS, so this
// must never be imported into client components or exposed to the browser.
//
// The client is created lazily: if the env vars aren't set yet, this module
// must NOT throw at import time (that would break the download route for every
// buyer). Instead getSupabaseAdmin() returns null and callers no-op.
let cached: SupabaseClient | null | undefined

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    console.log(
      "[v0] Supabase admin env vars are not set — Solly entitlement grants will not work until NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured.",
    )
    cached = null
    return cached
  }

  // Guard against a misconfigured URL (e.g. a JWT/anon key pasted into the URL
  // field). createClient() throws on an invalid URL, which must never bubble
  // up and break the download route for a paying buyer.
  const isValidUrl = /^https?:\/\//i.test(url) && (() => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  })()

  if (!isValidUrl) {
    console.log(
      "[v0] NEXT_PUBLIC_SUPABASE_URL is not a valid URL (expected e.g. https://<project>.supabase.co). Solly entitlement grants are disabled until it is fixed.",
    )
    cached = null
    return cached
  }

  try {
    cached = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    })
  } catch (err) {
    console.log(
      "[v0] Failed to initialise Supabase admin client — Solly entitlement grants disabled:",
      err instanceof Error ? err.message : String(err),
    )
    cached = null
  }
  return cached
}
