import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"

const CREDITS_PER_PACK = 10
const PACK_PRICE_CENTS = 1000 // $10 AUD

async function getOrigin() {
  const headersList = await headers()
  return (
    headersList.get("origin") ??
    (headersList.get("host") ? `https://${headersList.get("host")}` : "")
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email: string }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required to purchase extra drafts." }, { status: 400 })
    }

    const origin = await getOrigin()

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: `${CREDITS_PER_PACK} extra Solly drafts`,
              description: "Top-up pack for the Solly WHS Agent draft limit.",
            },
            unit_amount: PACK_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: { type: "solly_credits", email, credits: String(CREDITS_PER_PACK) },
      success_url: `${origin}/api/solly/credits/verify?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/solly`,
    })

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 500 })
    }
    return NextResponse.json({ checkoutUrl: session.url })
  } catch (err) {
    console.log("[solly] Credits checkout error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 })
  }
}
