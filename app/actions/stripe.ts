"use server"

import { headers } from "next/headers"
import type Stripe from "stripe"

import { stripe } from "@/lib/stripe"
import { getProduct, isPurchasable } from "@/lib/products"
import { encodeCodesToMetadata } from "@/lib/checkout"
import { validatePromo, resolveCouponId } from "@/lib/promo"

export type CheckoutResult = { url: string } | { error: string }

/**
 * Lightweight check used by the checkout UI to confirm a promo code before the
 * buyer commits, so we can show the applied discount inline.
 */
export async function checkPromoCode(
  code: string,
): Promise<{ valid: true; label: string } | { valid: false; error: string }> {
  const result = validatePromo(code)
  if (result.valid) return { valid: true, label: result.label }
  return { valid: false, error: result.error }
}

async function getOrigin() {
  const headersList = await headers()
  return (
    headersList.get("origin") ??
    (headersList.get("host") ? `https://${headersList.get("host")}` : "")
  )
}

export async function startCheckout(
  code: string,
  promoCode?: string,
): Promise<CheckoutResult> {
  const product = getProduct(code)

  if (!product) {
    return { error: "Product not found." }
  }
  if (!isPurchasable(code) || product.priceInCents == null) {
    return { error: "This product isn't available for purchase yet." }
  }

  // Resolve an optional promo code to a Stripe coupon.
  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined
  if (promoCode && promoCode.trim()) {
    const promo = validatePromo(promoCode)
    if (!promo.valid) return { error: promo.error }
    const couponId = await resolveCouponId(stripe, promo)
    if (!couponId) return { error: "That promo code isn't valid." }
    discounts = [{ coupon: couponId }]
  }

  const origin = await getOrigin()

  // Service products (e.g. Tier 2 assessment) send the buyer to an external
  // app after payment; everything else goes to the secure download page.
  let successUrl = `${origin}/download?session_id={CHECKOUT_SESSION_ID}`
  if (product.category === "service" && product.redirectTo) {
    if (product.redirectTo.startsWith("http")) {
      const sep = product.redirectTo.includes("?") ? "&" : "?"
      successUrl = `${product.redirectTo}${sep}session_id={CHECKOUT_SESSION_ID}`
    } else {
      successUrl = `${origin}${product.redirectTo}?session_id={CHECKOUT_SESSION_ID}`
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: product.name,
              description: product.description.slice(0, 250),
            },
            unit_amount: product.priceInCents,
          },
          quantity: 1,
        },
      ],
      // If a code was applied on our site, pass it as a coupon; otherwise
      // expose Stripe's own promotion-code field so buyers can enter one on
      // the hosted checkout page (works on mobile, tablet and desktop).
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),
      // The product code travels with the session so the download page can
      // look up exactly which files this payment unlocks.
      metadata: encodeCodesToMetadata([product.code]),
      success_url: successUrl,
      cancel_url: `${origin}${product.category === "service" ? "/services" : "/templates"}`,
    })

    if (!session.url) {
      return { error: "Could not start checkout. Please try again." }
    }
    return { url: session.url }
  } catch (err) {
    console.log("[v0] Stripe checkout error:", err instanceof Error ? err.message : err)
    return { error: "Payment could not be started. Please try again shortly." }
  }
}

export async function startCartCheckout(
  codes: string[],
  promoCode?: string,
): Promise<CheckoutResult> {
  const unique = [...new Set(codes)]
  if (unique.length === 0) {
    return { error: "Your cart is empty." }
  }

  // Resolve an optional promo code to a Stripe coupon.
  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined
  if (promoCode && promoCode.trim()) {
    const promo = validatePromo(promoCode)
    if (!promo.valid) return { error: promo.error }
    const couponId = await resolveCouponId(stripe, promo)
    if (!couponId) return { error: "That promo code isn't valid." }
    discounts = [{ coupon: couponId }]
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
  const validCodes: string[] = []

  for (const code of unique) {
    const product = getProduct(code)
    // Only downloadable, purchasable products can be added to a cart.
    if (!product || product.category === "service") continue
    if (!isPurchasable(code) || product.priceInCents == null) continue

    lineItems.push({
      price_data: {
        currency: "aud",
        product_data: {
          name: product.name,
          description: product.description.slice(0, 250),
        },
        unit_amount: product.priceInCents,
      },
      quantity: 1,
    })
    validCodes.push(code)
  }

  if (lineItems.length === 0) {
    return { error: "None of the items in your cart are available for purchase." }
  }

  const origin = await getOrigin()

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      // If a code was applied on our site, pass it as a coupon; otherwise
      // expose Stripe's own promotion-code field on the hosted checkout page.
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),
      // All purchased codes travel with the session so the download page can
      // unlock every file in the order.
      metadata: encodeCodesToMetadata(validCodes),
      success_url: `${origin}/download?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/templates`,
    })

    if (!session.url) {
      return { error: "Could not start checkout. Please try again." }
    }
    return { url: session.url }
  } catch (err) {
    console.log("[v0] Stripe cart checkout error:", err instanceof Error ? err.message : err)
    return { error: "Payment could not be started. Please try again shortly." }
  }
}
