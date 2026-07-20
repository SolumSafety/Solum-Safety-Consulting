import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { serviceTiers, sampleReports } from "@/lib/site"

export const metadata: Metadata = {
  title: "Example Reports | Solum Safety Consulting",
  description:
    "See the standard of our WHS Gap Analysis reporting. Board-ready reports with evidence-based scoring, prioritised actions and a defensible audit trail across every tier.",
  alternates: { canonical: "/reports" },
  openGraph: {
    title: "Example Reports | Solum Safety Consulting",
    description:
      "Board-ready WHS Gap Analysis reports with evidence-based scoring, prioritised actions and a defensible audit trail across every tier.",
    url: "/reports",
    type: "website",
  },
}

export default function ReportsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary-gradient-glow text-primary-foreground">
          <div className="absolute inset-0">
            <Image src="/hero-landscape.png" alt="Australian worksite" fill priority className="object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-10 bg-accent" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Example Reports</span>
            </div>
            <h1 className="mt-5 max-w-3xl text-pretty font-heading text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
              See the quality of our assessment reporting
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/85">
              Every WHS Gap Analysis is delivered as a clear, board-ready report, with evidence-based
              scoring, prioritised actions and a defensible audit trail. Below are representative samples
              showing the first pages of each tier.
            </p>
          </div>
        </section>

        {/* Tier summary */}
        <section className="bg-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-3">
              {serviceTiers.map((tier) => (
                <article key={tier.tier} className="rounded-2xl border border-border bg-card p-7">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">{tier.tier}</span>
                  <h2 className="mt-2 font-heading text-xl font-bold text-card-foreground">{tier.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tier.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Sample reports */}
        <section className="bg-muted py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">Sample Reports</span>
              <h2 className="mt-3 text-balance font-heading text-3xl font-black tracking-tight text-foreground md:text-4xl">
                A preview of each report
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                These use illustrative client data for demonstration.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {sampleReports.map((report) => (
                <article
                  key={report.title}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="relative aspect-[907/540] w-full border-b border-border bg-muted">
                    <Image
                      src={report.cover || "/placeholder.svg"}
                      alt={`${report.title} sample report cover`}
                      fill
                      className="object-cover object-top"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-terracotta px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-terracotta-foreground">
                      {report.tier}
                    </span>
                  </div>
                  <div className="p-7">
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Sample report
                    </span>
                    <h3 className="mt-2 font-heading text-xl font-bold text-card-foreground">{report.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{report.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-gradient-glow text-primary-foreground">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-20 lg:px-8">
            <h2 className="text-balance font-heading text-3xl font-black tracking-tight md:text-4xl">
              Want a report like this for your business?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-primary-foreground/85">
              Tell us about your worksite and we&apos;ll recommend the right tier and scope.
            </p>
            <Link
              href="/#contact"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-95"
            >
              Make an Enquiry
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
