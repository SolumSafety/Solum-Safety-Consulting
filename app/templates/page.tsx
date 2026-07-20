import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { TemplatesCatalogue } from "@/components/templates-catalogue"
import { whsTemplates, projectDocs, industryBundles, leadershipGuides } from "@/lib/catalogue"

export const metadata: Metadata = {
  title: "WHS Templates & Resources Catalogue | Solum Safety Consulting",
  description:
    "A professionally built library of licensed WHS templates, project documents and leadership guides, available as interactive digital forms and editable Word documents, branded to your business.",
  alternates: { canonical: "/templates" },
  openGraph: {
    title: "WHS Templates & Resources Catalogue | Solum Safety Consulting",
    description:
      "Licensed WHS templates, project documents and leadership guides. Interactive digital forms and editable Word documents, branded to your business.",
    url: "/templates",
    type: "website",
  },
}

export default function TemplatesPage() {
  return (
    <>
      <SiteHeader />
      <main>
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
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                Templates &amp; Forms
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl text-pretty font-heading text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
              Catalogue of WHS Templates &amp; Resources
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/85">
              A professionally built library of WHS resources. Each template is a licensed product,
              available as an interactive digital form and an editable Word document, branded to your
              business, practical and compliant.
            </p>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-6">
              {[
                { count: whsTemplates.length, label: "WHS templates & forms" },
                { count: projectDocs.length, label: "Project management documents" },
                { count: 68, label: "Generic toolbox talks" },
                { count: industryBundles.length, label: "Industry-specific toolbox sets" },
                { count: leadershipGuides.length, label: "Leadership guides" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2">
                  <span className="font-heading text-4xl font-black text-accent">{stat.count}</span>
                  <span className="max-w-[8rem] text-sm leading-tight text-primary-foreground/80">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TemplatesCatalogue />
      </main>
      <SiteFooter />
    </>
  )
}
