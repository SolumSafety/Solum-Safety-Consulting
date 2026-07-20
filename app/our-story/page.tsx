import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { WhyWeStartedSection } from "@/components/why-we-started-section"
import { WhatWeDoSection } from "@/components/what-we-do-section"
import { ApproachSection } from "@/components/approach-section"

export const metadata: Metadata = {
  title: "Our Story | Solum Safety Consulting",
  description:
    "Why Solum Safety Consulting was built. What we found when organisations outgrew their WHS systems, and how we make safety practical, measurable and easy to use.",
  alternates: { canonical: "/our-story" },
  openGraph: {
    title: "Our Story | Solum Safety Consulting",
    description:
      "Why Solum was built, what we found, why it matters, and how we make WHS practical, measurable and easy to use.",
    url: "/our-story",
    type: "website",
  },
}

export default function OurStoryPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary-gradient-glow text-primary-foreground">
          <div className="absolute inset-0">
            <Image
              src="/why-we-started.png"
              alt="Solum consultants reviewing safety documentation on an Australian worksite"
              fill
              priority
              className="object-cover opacity-25"
            />
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
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Our Story</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-balance font-heading text-4xl font-black leading-tight sm:text-5xl">
              Built because good businesses deserve WHS that keeps up.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/85">
              What we found, why Solum was built, and what we do to turn workplace health and safety
              obligations into systems your teams will use.
            </p>
          </div>
        </section>

        <WhyWeStartedSection />
        <ApproachSection />
        <WhatWeDoSection />

        {/* Closing CTA */}
        <section className="bg-secondary py-20 md:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-balance font-heading text-3xl font-black leading-tight text-foreground sm:text-4xl">
              Ready to see where your WHS system stands?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Start with a gap analysis, or browse our licensed templates, built to fit the way your
              teams already work.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-gradient px-6 py-3 font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
              >
                Explore our services
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 font-semibold text-foreground transition-colors hover:bg-card"
              >
                Browse templates
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
