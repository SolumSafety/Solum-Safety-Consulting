import Link from "next/link"
import { CircleCheck, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { stripe } from "@/lib/stripe"

export const metadata = {
  title: "Assessment Access | Solum Safety Consulting",
  robots: { index: false },
}

export default async function AssessmentAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  let paid = false
  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id)
      // 'paid' covers normal charges. 'no_payment_required' covers no-cost
      // orders — e.g. a 100%-off discount code — which Stripe reports
      // separately from 'paid' even though checkout genuinely completed.
      // See: https://docs.stripe.com/api/checkout/sessions/object
      paid = session.payment_status === "paid" || session.payment_status === "no_payment_required"
    } catch {
      paid = false
    }
  }
  return (
    <>
      <SiteHeader />
      <main className="bg-surface-gradient">
        <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
          {paid ? (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <CircleCheck className="h-8 w-8" aria-hidden="true" />
              </span>
              <h1 className="mt-6 text-balance font-heading text-3xl font-black tracking-tight text-foreground md:text-4xl">
                Payment confirmed. Thank you.
              </h1>
              <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                Your Tier 2 Desktop Gap Analysis is purchased. We&apos;re finalising access to the online
                client assessment app and will email your secure login and next steps to the address you
                used at checkout shortly.
              </p>
              <p className="mt-6 rounded-lg border border-border bg-card px-4 py-3 font-mono text-xs text-muted-foreground">
                Reference: {session_id?.slice(-12)}
              </p>
              <Link
                href="/"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-terracotta-gradient px-6 py-3 text-sm font-semibold text-terracotta-foreground transition-opacity hover:opacity-95"
              >
                Return home
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-balance font-heading text-3xl font-black tracking-tight text-foreground md:text-4xl">
                We couldn&apos;t verify this purchase
              </h1>
              <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                This page is only available after completing payment for the Tier 2 assessment. If you
                believe this is an error, please get in touch and we&apos;ll help you get access.
              </p>
              <Link
                href="/#contact"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-terracotta-gradient px-6 py-3 text-sm font-semibold text-terracotta-foreground transition-opacity hover:opacity-95"
              >
                Contact us
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
