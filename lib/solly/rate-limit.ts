import "server-only"
import type { NextRequest } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterMinutes: number }

/**
 * Identify the caller for rate-limiting purposes. Vercel sets
 * x-forwarded-for reliably on all traffic reaching these routes.
 */
export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim()
  return ip || "unknown"
}

/**
 * Checks and increments the rate limit for this identifier+route in one
 * atomic DB call. Fails OPEN (allows the request) if Supabase is
 * unreachable — a rate limiter outage should degrade gracefully, not take
 * down Solly entirely. Errors are logged so an outage is still visible.
 */
export async function checkRateLimit(params: {
  identifier: string
  route: string
  maxRequests: number
  windowMinutes: number
}): Promise<RateLimitResult> {
  const { identifier, route, maxRequests, windowMinutes } = params
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.log("[solly] Rate limiter: Supabase unavailable, failing open for", identifier, route)
    return { allowed: true }
  }

  const { data, error } = await supabaseAdmin.rpc("solly_increment_rate_limit", {
    p_identifier: identifier,
    p_route: route,
    p_window_minutes: windowMinutes,
  })

  if (error) {
    console.log("[solly] Rate limiter error, failing open:", error.message)
    return { allowed: true }
  }

  const count = typeof data === "number" ? data : 0
  if (count > maxRequests) {
    return { allowed: false, retryAfterMinutes: windowMinutes }
  }
  return { allowed: true }
}
