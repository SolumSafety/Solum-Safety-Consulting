import "server-only"
import { getSupabaseAdmin } from "./supabase-admin"

export const SOLLY_PACKAGE_SKU = "SLMPKG-WHS-Bundle-001"

/**
 * Grants (or re-confirms) Solly WHS Agent access for a buyer who has paid
 * for the SolumWHS package. No-ops if the SLMPKG code isn't part of this
 * purchase.
 *
 * Safe to call more than once for the same Stripe session — upserts on
 * stripe_session_id, so a buyer revisiting the download page within the
 * 7-day window won't create duplicate entitlement rows.
 */
export async function grantSollyEntitlementIfPurchased(params: {
  codes: string[]
  email: string | null | undefined
  stripeSessionId: string
  stripePaymentIntent?: string | null
}): Promise<void> {
  const { codes, email, stripeSessionId, stripePaymentIntent } = params

  if (!codes.includes(SOLLY_PACKAGE_SKU)) return

  if (!email) {
    console.log(
      "[v0] Solly entitlement: no buyer email on session",
      stripeSessionId,
      "— skipping grant. Check that Stripe Checkout is collecting customer email.",
    )
    return
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.log(
      "[v0] Solly entitlement: Supabase not configured — skipping grant for",
      email,
      "on session",
      stripeSessionId,
      ". Backfill this entitlement once env vars are set.",
    )
    return
  }

  const { error } = await supabaseAdmin.from("solly_entitlements").upsert(
    {
      email,
      product_sku: SOLLY_PACKAGE_SKU,
      status: "paid",
      stripe_session_id: stripeSessionId,
      stripe_payment_intent: stripePaymentIntent ?? null,
    },
    { onConflict: "stripe_session_id" },
  )

  if (error) {
    // Don't fail the download response over this — the buyer already paid
    // and is owed their files. Log loudly so it's visible in Vercel logs.
    console.log("[v0] Failed to grant Solly entitlement:", error.message)
  }
}
