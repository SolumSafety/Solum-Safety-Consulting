import "server-only"

/**
 * Promo codes accepted at checkout, mapped to the Stripe coupon they apply.
 * Codes are matched case-insensitively. Add new codes here as needed.
 */
const PROMO_CODES: Record<string, { couponId: string; label: string }> = {
  pepper58ssc: { couponId: "PEPPER58SSC-100", label: "100% off" },
}

export type PromoValidation =
  | { valid: true; code: string; couponId: string; label: string }
  | { valid: false; error: string }

/**
 * Validates a customer-entered promo code against the accepted list.
 * Returns the Stripe coupon to apply when valid.
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
  return { valid: true, code: normalised, couponId: match.couponId, label: match.label }
}
