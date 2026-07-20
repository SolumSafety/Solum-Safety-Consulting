import Link from "next/link"
import { CheckCircle2, Download, AlertCircle } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { stripe } from "@/lib/stripe"
import { getProduct } from "@/lib/products"
import { decodeCodesFromMetadata } from "@/lib/checkout"
import { SOLLY_PACKAGE_SKU } from "@/lib/solly-entitlement"

export const dynamic = "force-dynamic"

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <section className="flex-1 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl">{children}</div>
      </section>
      <SiteFooter />
    </main>
  )
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <AlertCircle className="h-6 w-6 text-terracotta" aria-hidden="true" />
      </div>
      <h1 className="mt-5 font-heading text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">{message}</p>
      <Link
        href="/templates"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Back to catalogue
      </Link>
    </div>
  )
}

export default async function DownloadPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams

  if (!sessionId) {
    return (
      <Shell>
        <ErrorState
          title="No purchase found"
          message="We couldn't find a checkout session. If you've just paid and are seeing this, please contact us and we'll sort it out."
        />
      </Shell>
    )
  }

  let paid = false
  let codes: string[] = []
  let customerEmail: string | null = null
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    paid = session.payment_status === "paid"
    codes = decodeCodesFromMetadata(session.metadata)
    customerEmail = session.customer_details?.email ?? null
  } catch (err) {
    console.log("[v0] Download page session error:", err instanceof Error ? err.message : err)
  }

  if (!paid) {
    return (
      <Shell>
        <ErrorState
          title="Payment not confirmed"
          message="This purchase hasn't been confirmed yet. If you completed payment, wait a moment and refresh, or contact us for help."
        />
      </Shell>
    )
  }

  const products = codes.map((c) => getProduct(c)).filter((p) => p && p.files.length > 0)

  if (products.length === 0) {
    return (
      <Shell>
        <ErrorState
          title="Thanks for your purchase!"
          message="Your payment was successful, but we couldn't attach the files automatically. Please contact us and we'll send them straight through."
        />
      </Shell>
    )
  }

  const totalFiles = products.reduce((n, p) => n + (p?.files.length ?? 0), 0)
  const isSingle = products.length === 1

  return (
    <Shell>
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
            <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
              Payment successful
            </span>
            <h1 className="font-heading text-2xl font-bold text-foreground">Your downloads are ready</h1>
          </div>
        </div>

        <p className="mt-5 leading-relaxed text-muted-foreground">
          Thanks for your purchase of{" "}
          <span className="font-semibold text-foreground">
            {isSingle ? products[0]!.name : `${products.length} templates`}
          </span>
          {` (${totalFiles} file${totalFiles === 1 ? "" : "s"})`}.
          {customerEmail ? ` A receipt has been sent to ${customerEmail}.` : ""} Every format for each template
          is available below for the next 7 days.
        </p>

        {codes.includes(SOLLY_PACKAGE_SKU) && (
          <div className="mt-6 rounded-xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 p-5">
            <p className="font-heading text-sm font-bold text-[#16294D]">Your SolumWHS package includes Solly</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              You now have free, unlimited access to Solly, our AI WHS Agent. Tell Solly about your site and
              it will help identify and draft any of your WHS forms, at no extra cost.
            </p>
            <Link
              href="/solly"
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-[#16294D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#18707F]"
            >
              Talk to Solly
            </Link>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {products.map((p) => (
            <div key={p!.code}>
              {!isSingle && (
                <h2 className="mb-2 font-heading text-sm font-bold text-foreground">{p!.name}</h2>
              )}
              <ul className="space-y-3">
                {p!.files.map((file) => {
                  const filename = file.split("/").pop() || "Download"
                  return (
                    <li key={file}>
                      <a
                        href={`/api/download?session_id=${encodeURIComponent(sessionId)}&file=${encodeURIComponent(file)}`}
                        className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-5 py-4 transition-colors hover:border-primary hover:bg-secondary/50"
                      >
                        <span className="font-medium text-foreground">{filename}</span>
                        <Download className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Having trouble? Email{" "}
          <a href="mailto:info@solumsafetyconsulting.com.au" className="font-semibold text-primary underline">
            info@solumsafetyconsulting.com.au
          </a>{" "}
          and we&apos;ll help.
        </p>
      </div>
    </Shell>
  )
}
