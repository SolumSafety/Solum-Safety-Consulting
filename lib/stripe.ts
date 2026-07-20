import "server-only"

import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  console.log("[v0] STRIPE_SECRET_KEY is not set — checkout will not work until it is configured.")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "")
