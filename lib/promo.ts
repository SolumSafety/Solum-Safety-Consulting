import "server-only"

import type Stripe from "stripe"

/**
 * Promo codes accepted at checkout.
 *
 * `couponId` is the preferred Stripe coupon ID (used as-is if it exists in the
 * connected account). `couponName` is a fallback: if no coupon with that ID
 * exists (e.g. after switching from the sandbox to the live account, where the
 * coupon has a different auto-generated ID), we look one up by name instead.
 * This keeps codes working across environments without a code change.
 *
 * Codes are matched case-insensitively. Add new codes here as needed.
 */
const PROMO_CODES: Record<string, { couponId: string; couponName: string; label: string }> = {
  pepper58ssc: { couponId: "PEPPER58SSC-100", couponName: "Pepper58SSC", label: "100% off" },
}

export type PromoValidation =
  | { valid: true; code: string; couponId: string; couponName: string; label: string }
  | { valid: false; error: string }

/**
 * Validates a customer-entered promo code against the accepted list.
 * Returns the Stripe coupon details to apply when valid.
 */
export function validatePromo(input: string | null | undefined): PromoValidation {
  const normalised = (input ?? "").trim().toLowerCase()
  if (!normalised) {
    return { valid: false, error: "Enter a promo code." }
  }
  const match = PROMO_CODES[normalised]
  if (!match) {
    return { valid: false, error: "That promo code isn't valid." }
  }
  return {
    valid: true,
    code: normalised,
    couponId: match.couponId,
    couponName: match.couponName,
    label: match.label,
  }
}

// Cache resolved coupon IDs per account so we don't hit Stripe on every checkout.
const resolvedCouponCache = new Map<string, string>()

/**
 * Resolves the actual Stripe coupon ID to apply for a validated promo.
 * Tries the configured ID first; if that coupon doesn't exist in the connected
 * account, falls back to finding a valid coupon by name. Returns null if none
 * can be found (caller should then reject the code).
 */
export async function resolveCouponId(
  stripe: Stripe,
  promo: { couponId: string; couponName: string },
): Promise<string | null> {
  const cacheKey = `${promo.couponId}:${promo.couponName}`.toLowerCase()
  const cached = resolvedCouponCache.get(cacheKey)
  if (cached) return cached

  // 1. Preferred: use the configured coupon ID directly if it exists and is valid.
  try {
    const coupon = await stripe.coupons.retrieve(promo.couponId)
    if (coupon && !coupon.deleted && coupon.valid) {
      resolvedCouponCache.set(cacheKey, coupon.id)
      return coupon.id
    }
  } catch {
    // Coupon ID not found in this account — fall through to name lookup.
  }

  // 2. Fallback: find a valid coupon whose name matches (case-insensitive).
  try {
    const wanted = promo.couponName.trim().toLowerCase()
    for await (const coupon of stripe.coupons.list({ limit: 100 })) {
      if (coupon.valid && (coupon.name ?? "").trim().toLowerCase() === wanted) {
        resolvedCouponCache.set(cacheKey, coupon.id)
        return coupon.id
      }
    }
  } catch {
    // Ignore and fall through to null.
  }

  return null
}
