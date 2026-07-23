import {
  bundles,
  industryBundles,
  whsTemplates,
  projectDocs,
  leadershipGuides,
} from "./catalogue"
import { PRODUCT_FILES } from "./product-files"
import { PRODUCT_PRICES } from "./product-prices"
import { TIER2_CODE, ASSESSMENT_SITE_URL } from "./site"
export type ProductCategory = "bundle" | "industry" | "whs" | "project" | "leadership" | "service"

export type PurchasableProduct = {
  code: string
  name: string
  description: string
  category: ProductCategory
  formats: string[]
  /** Price in cents (AUD). null = not yet configured (awaiting pricing). */
  priceInCents: number | null
  /** Blob pathnames of the files delivered on purchase. */
  files: string[]
  /**
   * For service products (e.g. the Tier 2 assessment): after payment the buyer
   * is sent here instead of a file-download page. The Stripe session id is
   * appended so the destination app can verify the purchase.
   */
  redirectTo?: string
  /**
   * If set, checkout uses this real, pre-registered Stripe Price object
   * instead of building a fresh price_data price on the fly. Required for
   * any product that needs to be recognised by ID after the fact (e.g. the
   * assessor app's tierForStripeIds lookup) — a dynamically generated price
   * gets a brand-new ID on every checkout and can never be matched later.
   */
  stripePriceId?: string
}
/**
 * FILES — Blob pathnames of the deliverables for each product code.
 * Populated from the uploaded product archives. Auto-generated; see
 * scripts note in the commit. A product needs both FILES and a PRICE to
 * become purchasable.
 */
export const FILES: Record<string, string[]> = {
  // Populated by the product-upload step (see PRODUCT_FILES below).
  ...PRODUCT_FILES,
}
/**
 * PRICES — price in cents (AUD) per product code, from the pricing
 * spreadsheet. Codes without a price (or without files) show an Enquire
 * button instead of Buy Now.
 *
 * Example: "WHS-SSC-Bundle-001": 29900,  // $299
 */
export const PRICES: Record<string, number> = {
  // Auto-generated from the pricing spreadsheet (GST-inclusive, in cents).
  ...PRODUCT_PRICES,
  // Tier 2 - Internal Desktop WHS Gap Analysis — paid service (redirects to assessment app).
  [TIER2_CODE]: 132000, // $1,320 AUD incl. GST
}
// Real Stripe Price ID for the Tier 2 assessment Payment Link — must stay in
// sync with lib/assessment-products.ts on the assessor app. If this product
// is ever recreated in Stripe (which generates a new Price/Product ID),
// update it here too or purchases will silently fail entitlement matching.
const TIER2_STRIPE_PRICE_ID = "price_1Tu0ad3a72jjBENAXjIqRIeO"
const INDUSTRY_FORMATS = ["Toolbox talk set"]
const BUNDLE_FORMATS = ["Full bundle (ZIP)"]
function build(): PurchasableProduct[] {
  const all: PurchasableProduct[] = []
  // Tier 2 Desktop Gap Analysis — a paid service that sends the buyer straight
  // to the live client assessment app once payment is confirmed. No
  // downloadable files. Uses a real Stripe price (not price_data) so the
  // assessor app can match it back to a tier after payment.
  all.push({
    code: TIER2_CODE,
    name: "Tier 2 — WHS Desktop Gap Analysis",
    description:
      "Online WHS maturity self-assessment completed by your team and submitted to Solum Safety Consulting for independent desktop review, maturity rating and corrective action plan.",
    category: "service",
    formats: ["Online assessment"],
    priceInCents: PRICES[TIER2_CODE] ?? null,
    files: [],
    redirectTo: `${ASSESSMENT_SITE_URL}/api/auth/client/from-session`,
    stripePriceId: TIER2_STRIPE_PRICE_ID,
  })
  for (const b of bundles) {
    all.push({
      code: b.code,
      name: b.name,
      description: b.description,
      category: "bundle",
      formats: BUNDLE_FORMATS,
      priceInCents: PRICES[b.code] ?? null,
      files: FILES[b.code] ?? [],
    })
  }
  for (const i of industryBundles) {
    all.push({
      code: i.code,
      name: i.name,
      description: `Industry-specific toolbox talk set tailored for ${i.name.toLowerCase()} work.`,
      category: "industry",
      formats: INDUSTRY_FORMATS,
      priceInCents: PRICES[i.code] ?? null,
      files: FILES[i.code] ?? [],
    })
  }
  const map: [typeof whsTemplates, ProductCategory][] = [
    [whsTemplates, "whs"],
    [projectDocs, "project"],
    [leadershipGuides, "leadership"],
  ]
  for (const [list, category] of map) {
    for (const t of list) {
      all.push({
        code: t.code,
        name: t.name,
        description: t.description,
        category,
        formats: t.formats,
        priceInCents: PRICES[t.code] ?? null,
        files: FILES[t.code] ?? [],
      })
    }
  }
  return all
}
export const PRODUCTS: PurchasableProduct[] = build()
const BY_CODE = new Map(PRODUCTS.map((p) => [p.code, p]))
export function getProduct(code: string): PurchasableProduct | undefined {
  return BY_CODE.get(code)
}
export function isPurchasable(code: string): boolean {
  const p = BY_CODE.get(code)
  if (!p || p.priceInCents == null || p.priceInCents <= 0) return false
  // Service products deliver via redirect; everything else via file download.
  if (p.category === "service") return !!p.redirectTo
  return p.files.length > 0
}
export function formatPrice(priceInCents: number | null): string {
  if (priceInCents == null) return ""
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: priceInCents % 100 === 0 ? 0 : 2,
  }).format(priceInCents / 100)
}
