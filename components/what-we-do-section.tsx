import Link from "next/link"
import { Check, Settings, FileText, HardHat, Compass, ArrowRight, type LucideIcon } from "lucide-react"
import { gapChecklist, tiers, whatWeDo, type WhatWeDoIcon } from "@/lib/site"

const iconMap: Record<WhatWeDoIcon, LucideIcon> = {
  settings: Settings,
  "file-text": FileText,
  "hard-hat": HardHat,
  compass: Compass,
}

export function WhatWeDoSection() {
  return (
    <section id="services" className="bg-secondary py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-terracotta" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
              What We Do
            </span>
          </div>
          <h2 className="mt-4 text-balance font-heading text-3xl font-black leading-tight text-foreground sm:text-4xl">
            End-to-End WHS Support
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            We help businesses understand, build, implement and maintain practical WHS systems that
            reduce risk and support safe, compliant operations.
          </p>
        </div>

        {/* Gap analysis feature */}
        <div id="gap-analysis" className="mt-14 grid gap-8 rounded-2xl border border-border bg-card p-8 md:p-10 lg:grid-cols-2">
          <div>
            <h3 className="font-heading text-2xl font-black leading-tight text-foreground">
              WHS Gap Analysis &amp; Risk Maturity Assessments
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Understand where your organisation stands today and where it needs to improve. Our Tier 2
              and Tier 3 WHS Gap Analysis assessments help you:
            </p>
            <ul className="mt-6 space-y-3">
              {gapChecklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-olive/15 text-olive">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl bg-secondary p-4 text-sm leading-relaxed text-muted-foreground">
              Our aim is not simply to point out problems. We help you build a stronger safety culture
              and improve WHS performance over time, with a clear path towards higher levels of
              maturity.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {tiers.map((tier, index) => {
              // Each tier gets a distinct tinted background so they stand out.
              const tierStyles = [
                {
                  card: "border-olive/30 bg-olive/10",
                  eyebrow: "text-olive",
                },
                {
                  card: "border-terracotta/30 bg-terracotta/10",
                  eyebrow: "text-terracotta",
                },
              ]
              const style = tierStyles[index % tierStyles.length]
              return (
                <div key={tier.tier} className={`rounded-xl border p-6 ${style.card}`}>
                  <span
                    className={`font-heading text-xs font-bold uppercase tracking-[0.2em] ${style.eyebrow}`}
                  >
                    {tier.tier}
                  </span>
                  <h4 className="mt-2 font-heading text-lg font-bold text-foreground">{tier.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tier.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Service cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {whatWeDo.map((service) => {
            const Icon = iconMap[service.icon]
            return (
              <article key={service.title} className="flex flex-col rounded-2xl border border-border bg-card p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-foreground">{service.title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{service.description}</p>
                {service.href && (
                  <Link
                    href={service.href}
                    className="mt-4 inline-flex items-center gap-2 font-semibold text-terracotta transition-colors hover:text-primary"
                  >
                    {service.linkLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
