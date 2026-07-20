import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft,
  Check,
  ArrowRight,
  Search,
  Users,
  ShieldCheck,
  FileText,
  CalendarClock,
  ShoppingCart,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BuyButton } from "@/components/buy-button"
import {
  serviceTiers,
  gapChecklist,
  templateInclusions,
  focusAreas,
  TIER2_CODE,
  ASSESSMENT_LOGIN_HREF,
} from "@/lib/site"
import { getProduct, formatPrice } from "@/lib/products"

export const metadata: Metadata = {
  title: "WHS Management & Advice | Solum Safety Consulting",
  description:
    "Practical WHS management, gap analysis and advice to help you stay compliant, reduce risk and run safer operations. Tier 2 online assessment and Tier 3 field verification, templates and system development.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "WHS Management & Advice | Solum Safety Consulting",
    description:
      "Practical WHS management, gap analysis and advice. Tier 2 online assessment, Tier 3 field verification, templates and system development.",
    url: "/services",
    type: "website",
  },
}

export default function ServicesPage() {
  const tier2Product = getProduct(TIER2_CODE)
  const tier2Price = tier2Product?.priceInCents ? formatPrice(tier2Product.priceInCents) : null

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary-gradient-glow text-primary-foreground">
          <div className="absolute inset-0">
            <Image
              src="/hero-landscape.png"
              alt="Australian worksite"
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
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">What We Do</span>
            </div>
            <h1 className="mt-5 max-w-3xl text-pretty font-heading text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
              WHS Management &amp; Advice
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/85">
              Practical WHS management and advice to help you stay compliant, reduce risk and run safer,
              more efficient operations. We focus on what works in practice: clear systems, usable
              processes and guidance that fits your business.
            </p>
          </div>
        </section>

        {/* Gap Analysis */}
        <section id="gap-analysis" className="bg-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
                  WHS Gap Analysis
                </span>
                <h2 className="mt-3 text-balance font-heading text-3xl font-black tracking-tight text-foreground md:text-4xl">
                  Understand your position. Improve your maturity.
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  We carry out structured WHS Gap Analysis assessments to help you understand your current
                  position and improve your risk maturity, which reduces risk to you, your staff and your
                  organisation.
                </p>
                <ul className="mt-6 grid gap-3">
                  {[
                    "Identify gaps across your WHS systems",
                    "Improve your WHS maturity rating",
                    "Prioritise practical corrective actions",
                    "Strengthen compliance and governance",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-olive/15 text-olive">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="text-sm leading-relaxed text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 max-w-sm">
                  {tier2Price ? (
                    <BuyButton
                      code={TIER2_CODE}
                      price={tier2Price}
                      label="Purchase WHS Gap Analysis"
                    />
                  ) : (
                    <Link
                      href="/#contact"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-terracotta-gradient px-6 py-3 text-sm font-semibold text-terracotta-foreground transition-opacity hover:opacity-95"
                    >
                      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                      Enquire about a Gap Analysis
                    </Link>
                  )}
                  <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                    Purchase online and get instant access to your assessment, with no account setup required.
                    Once payment is confirmed you&apos;ll be taken straight to the assessment portal.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Already purchased?{" "}
                    <a
                      href={ASSESSMENT_LOGIN_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-terracotta underline-offset-4 hover:underline"
                    >
                      Access your assessment
                    </a>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-heading text-lg font-bold text-card-foreground">
                    A gap analysis helps you
                  </h3>
                </div>
                <ul className="mt-6 grid gap-3">
                  {gapChecklist.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
                        <Check className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
                      </span>
                      <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Assessment Tiers */}
        <section id="tiers" className="bg-muted py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
                Assessment Tiers
              </span>
              <h2 className="mt-3 text-balance font-heading text-3xl font-black tracking-tight text-foreground md:text-4xl">
                A clear pathway, whatever your starting point.
              </h2>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2 md:items-start">
              {serviceTiers.map((tier) => {
                const product = tier.purchaseCode ? getProduct(tier.purchaseCode) : undefined
                const price = product?.priceInCents ? formatPrice(product.priceInCents) : null
                return (
                  <article
                    key={tier.tier}
                    className={`relative flex h-full flex-col rounded-2xl border p-7 ${
                      tier.popular
                        ? "border-terracotta bg-card shadow-lg md:-mt-3"
                        : "border-border bg-card"
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-3 left-7 rounded-full bg-terracotta px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-terracotta-foreground">
                        Most Popular
                      </span>
                    )}
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {tier.tier}
                    </span>
                    <h3 className="mt-2 font-heading text-xl font-bold text-card-foreground">{tier.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tier.description}</p>
                    <ul className="mt-5 grid flex-1 gap-2.5">
                      {tier.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 flex-none text-olive" aria-hidden="true" />
                          <span className="text-sm leading-relaxed text-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                      {tier.outcome}
                    </p>

                    {/* CTA */}
                    <div className="mt-6">
                      {tier.action === "purchase" ? (
                        <>
                          {price && (
                            <p className="mb-3 text-sm text-muted-foreground">
                              <span className="font-heading text-2xl font-black text-foreground">{price}</span>{" "}
                              incl. GST
                            </p>
                          )}
                          {tier.purchaseCode && price ? (
                            <>
                              <BuyButton
                                code={tier.purchaseCode}
                                price={price}
                                label="Buy Tier 2 Gap Analysis"
                              />
                              <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                                Purchase online and get instant access. Once payment is confirmed you&apos;ll be
                                taken straight to the assessment portal.
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Already purchased?{" "}
                                <a
                                  href={ASSESSMENT_LOGIN_HREF}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-terracotta underline-offset-4 hover:underline"
                                >
                                  Access your assessment
                                </a>
                              </p>
                            </>
                          ) : (
                            <Link
                              href="/#contact"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-terracotta-gradient px-5 py-2.5 text-sm font-semibold text-terracotta-foreground transition-opacity hover:opacity-95"
                            >
                              Enquire
                              <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          )}
                        </>
                      ) : (
                        <>
                          {tier.availabilityNote && (
                            <p className="mb-3 flex items-center gap-2 rounded-lg bg-accent/15 px-3 py-2 text-sm font-medium text-foreground">
                              <CalendarClock className="h-4 w-4 flex-none text-terracotta" aria-hidden="true" />
                              {tier.availabilityNote}
                            </p>
                          )}
                          <Link
                            href="/#contact"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-95"
                          >
                            Click to enquire
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Templates & Forms */}
        <section className="bg-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
                  Templates &amp; Forms
                </span>
                <h2 className="mt-3 text-balance font-heading text-3xl font-black tracking-tight text-foreground md:text-4xl">
                  A comprehensive suite, digital or Word.
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  We provide a full range of WHS and environmental templates and forms to support your
                  operations. Each one comes in digital or Word format, so you can download it, edit it,
                  complete it electronically and fold it into your systems.
                </p>
                <p className="mt-4 text-sm font-medium leading-relaxed text-foreground">
                  Practical, compliant and easy to use, so your systems get used rather than ignored.
                </p>
                <Link
                  href="/templates"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-terracotta-gradient px-5 py-3 text-sm font-semibold text-terracotta-foreground transition-opacity hover:opacity-95"
                >
                  Browse the catalogue
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-olive text-primary-foreground">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-heading text-lg font-bold text-card-foreground">Core inclusions</h3>
                </div>
                <ul className="mt-6 grid gap-3">
                  {templateInclusions.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-olive" aria-hidden="true" />
                      <span className="text-sm leading-relaxed text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Our Focus */}
        <section className="bg-muted py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">Our Focus</span>
              <h2 className="mt-3 text-balance font-heading text-3xl font-black tracking-tight text-foreground md:text-4xl">
                We go beyond assessment to help you build systems that work.
              </h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {focusAreas.map((area, i) => {
                const icons = [Users, ShieldCheck, Check]
                const Icon = icons[i] ?? Check
                return (
                  <article key={area.title} className="rounded-2xl border border-border bg-card p-7">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-heading text-lg font-bold text-card-foreground">{area.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{area.description}</p>
                  </article>
                )
              })}
            </div>
            <p className="mx-auto mt-10 max-w-3xl text-pretty text-center leading-relaxed text-muted-foreground">
              We go beyond assessment to help you build WHS systems that work, lifting your maturity and
              making sure the important things do not get missed.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-gradient-glow text-primary-foreground">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-20 lg:px-8">
            <h2 className="text-balance font-heading text-3xl font-black tracking-tight md:text-4xl">
              Ready to understand where you stand?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-primary-foreground/85">
              Send us an enquiry. Tell us about your worksite, your risks and the tier that suits your
              business, and we&apos;ll get back to you promptly.
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
