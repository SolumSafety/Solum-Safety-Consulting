"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Lock, Package, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BuyButton } from "@/components/buy-button"
import { AddToCartButton } from "@/components/add-to-cart-button"
import {
  bundles,
  industryBundles,
  whsTemplates,
  projectDocs,
  leadershipGuides,
  whsSubcategories,
  getWhsSubcategory,
  type TemplateItem,
  type WhsSubcategoryId,
} from "@/lib/catalogue"
import { getProduct, isPurchasable, formatPrice } from "@/lib/products"

function PurchaseCTA({
  code,
  name,
  tone = "terracotta",
}: {
  code: string
  name: string
  tone?: "terracotta" | "accent"
}) {
  const product = getProduct(code)
  if (isPurchasable(code) && product?.priceInCents != null) {
    // Service products (redirect after payment) can't be batched in a cart —
    // they keep the single Buy-now flow. Everything else gets both options.
    if (product.category === "service") {
      return <BuyButton code={code} price={formatPrice(product.priceInCents)} tone={tone} />
    }
    return (
      <div className="flex flex-col gap-2">
        <AddToCartButton
          code={code}
          name={name}
          priceInCents={product.priceInCents}
          tone={tone}
        />
        <BuyButton code={code} price={formatPrice(product.priceInCents)} tone="ghost" />
      </div>
    )
  }
  return (
    <Button
      className={
        tone === "accent"
          ? "w-full bg-accent text-accent-foreground hover:bg-accent/90"
          : "w-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
      }
      nativeButton={false}
      render={<Link href={enquiryHref(name, code)} />}
    >
      Enquire to Purchase
    </Button>
  )
}

type Category = "all" | "whs" | "bundles" | "project" | "leadership"

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "whs", label: "WHS" },
  { id: "bundles", label: "Bundles" },
  { id: "project", label: "Project WHS" },
  { id: "leadership", label: "Leadership" },
]

function enquiryHref(name: string, code: string) {
  const params = new URLSearchParams({ enquiry: name, code })
  return `/?${params.toString()}#contact`
}

function TemplateCard({ item }: { item: TemplateItem }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      {/* Live preview of the digital form */}
      <div className="relative aspect-[860/560] w-full overflow-hidden border-b border-border bg-muted">
        <img
          src={`/thumbnails/${item.code}.png`}
          alt={`Preview of the ${item.name} digital form`}
          loading="lazy"
          className="h-full w-full object-cover object-top"
        />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
          <Lock className="h-3 w-3" aria-hidden="true" />
          Licensed
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-base font-bold leading-snug text-card-foreground">{item.name}</h3>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{item.code}</p>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.formats.map((f) => (
          <span
            key={f}
            className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
          >
            {f}
          </span>
        ))}
      </div>

        <PriceLine code={item.code} />

        <div className="mt-4">
          <PurchaseCTA code={item.code} name={item.name} />
        </div>
      </div>
    </article>
  )
}

function PriceLine({ code, invert = false }: { code: string; invert?: boolean }) {
  const product = getProduct(code)
  if (!isPurchasable(code) || product?.priceInCents == null) return null
  return (
    <p
      className={`mt-4 font-heading text-2xl font-black ${
        invert ? "text-primary-foreground" : "text-foreground"
      }`}
    >
      {formatPrice(product.priceInCents)}{" "}
      <span
        className={`text-xs font-medium ${invert ? "text-primary-foreground/70" : "text-muted-foreground"}`}
      >
        incl. GST
      </span>
    </p>
  )
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">{eyebrow}</span>
      )}
      <h2 className="mt-2 font-heading text-2xl font-black tracking-tight text-foreground md:text-3xl">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

export function TemplatesCatalogue() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<Category>("all")

  const q = query.trim().toLowerCase()

  const filterItems = (items: TemplateItem[]) =>
    !q
      ? items
      : items.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.code.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q),
        )

  const filteredWhs = useMemo(() => filterItems(whsTemplates), [q])
  const filteredProject = useMemo(() => filterItems(projectDocs), [q])
  const filteredLeadership = useMemo(() => filterItems(leadershipGuides), [q])

  // Group the filtered WHS templates into their sub-categories, preserving the
  // ordered list defined in the catalogue so the index and sections align.
  const whsGroups = useMemo(() => {
    return whsSubcategories
      .map((sub) => ({
        ...sub,
        items: filteredWhs.filter((i) => getWhsSubcategory(i.code) === sub.id),
      }))
      .filter((g) => g.items.length > 0)
  }, [filteredWhs])
  const filteredBundles = useMemo(
    () =>
      !q
        ? bundles
        : bundles.filter(
            (b) =>
              b.name.toLowerCase().includes(q) ||
              b.code.toLowerCase().includes(q) ||
              b.description.toLowerCase().includes(q),
          ),
    [q],
  )
  const filteredIndustry = useMemo(
    () =>
      !q
        ? industryBundles
        : industryBundles.filter(
            (b) => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q),
          ),
    [q],
  )

  const show = (cat: Category) => category === "all" || category === cat

  const showBundles = show("bundles") && (filteredBundles.length > 0 || filteredIndustry.length > 0)
  const showWhs = show("whs") && filteredWhs.length > 0
  const showProject = show("project") && filteredProject.length > 0
  const showLeadership = show("leadership") && filteredLeadership.length > 0
  const nothing = !showBundles && !showWhs && !showProject && !showLeadership

  return (
    <div>
      {/* Licensing notice */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex gap-3 rounded-xl border-l-4 border-accent bg-muted p-5">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">These templates are licensed products.</span>{" "}
            Purchase securely online and download your files instantly. You&apos;ll receive the digital and
            editable Word versions, ready to brand to your business. Licensed for use within your own
            organisation only, not for resale or redistribution.
          </p>
        </div>
      </div>

      {/* Catalogue index / table of contents */}
      {!q && (
        <nav
          aria-label="Catalogue index"
          className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="font-heading text-lg font-black tracking-tight text-foreground">
              Browse the catalogue
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Jump straight to the section you need.
            </p>
            <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* WHS forms with sub-categories */}
              <div>
                <a
                  href="#whs"
                  className="group inline-flex items-center gap-1 font-heading text-sm font-bold text-foreground hover:text-terracotta"
                >
                  WHS Templates &amp; Forms
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta"
                    aria-hidden="true"
                  />
                </a>
                <ul className="mt-3 space-y-1.5">
                  {whsSubcategories.map((sub) => {
                    const count = whsTemplates.filter(
                      (i) => getWhsSubcategory(i.code) === sub.id,
                    ).length
                    if (count === 0) return null
                    return (
                      <li key={sub.id}>
                        <a
                          href={`#whs-${sub.id}`}
                          className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <span>{sub.label}</span>
                          <span className="font-mono text-xs text-muted-foreground/70">{count}</span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Project Management WHS */}
              <div>
                <a
                  href="#project"
                  className="group inline-flex items-center gap-1 font-heading text-sm font-bold text-foreground hover:text-terracotta"
                >
                  Project Management WHS
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta"
                    aria-hidden="true"
                  />
                </a>
                <p className="mt-3 text-sm text-muted-foreground">
                  {projectDocs.length} documents for planning and delivering projects safely.
                </p>
              </div>

              {/* Toolbox Talks */}
              <div>
                <span className="font-heading text-sm font-bold text-foreground">Toolbox Talks</span>
                <ul className="mt-3 space-y-1.5">
                  <li>
                    <a
                      href="#bundles"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Generic toolbox talks
                    </a>
                  </li>
                  <li>
                    <a
                      href="#industry"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Industry-specific
                    </a>
                  </li>
                  <li>
                    <a
                      href="#leadership"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Leadership support series
                    </a>
                  </li>
                </ul>
              </div>

              {/* Bundles */}
              <div>
                <a
                  href="#bundles"
                  className="group inline-flex items-center gap-1 font-heading text-sm font-bold text-foreground hover:text-terracotta"
                >
                  Bundles &amp; Packages
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta"
                    aria-hidden="true"
                  />
                </a>
                <p className="mt-3 text-sm text-muted-foreground">
                  Value-priced collections and complete libraries.
                </p>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Search + filters */}
      <div className="sticky top-[65px] z-30 mt-8 border-y border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates by name or code…"
              aria-label="Search templates"
              className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  category === c.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                }`}
                aria-pressed={category === c.id}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {nothing && (
          <p className="py-20 text-center text-muted-foreground">
            No templates match &ldquo;{query}&rdquo;. Try a different search.
          </p>
        )}

        {/* Bundles */}
        {showBundles && (
          <section id="bundles" className="scroll-mt-28">
            <div className="mb-8 flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-terracotta text-terracotta-foreground">
                <Package className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-2xl font-black tracking-tight text-foreground md:text-3xl">
                  Bundles &amp; Packages
                </h2>
                <p className="mt-1 text-sm font-medium text-terracotta">
                  Value-priced collections · best-value complete libraries
                </p>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Buy a complete, ready-to-brand collection instead of individual templates. Each bundle
                  is licensed for use within your own organisation.
                </p>
              </div>
            </div>

            {filteredBundles.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredBundles.map((b) => (
                  <article
                    key={b.code}
                    className={`relative flex flex-col rounded-xl border p-6 ${
                      b.bestValue
                        ? "border-accent bg-primary text-primary-foreground"
                        : "border-border bg-card"
                    }`}
                  >
                    {b.bestValue && (
                      <span className="mb-3 inline-flex w-fit items-center rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">
                        Best Value
                      </span>
                    )}
                    <h3
                      className={`font-heading text-lg font-bold ${
                        b.bestValue ? "text-primary-foreground" : "text-card-foreground"
                      }`}
                    >
                      {b.name}
                    </h3>
                    <p
                      className={`mt-1 font-mono text-xs ${
                        b.bestValue ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {b.code}
                    </p>
                    <p
                      className={`mt-3 flex-1 text-sm leading-relaxed ${
                        b.bestValue ? "text-primary-foreground/85" : "text-muted-foreground"
                      }`}
                    >
                      {b.description}
                    </p>
                    <PriceLine code={b.code} invert={b.bestValue} />
                    <div className="mt-5">
                      <PurchaseCTA
                        code={b.code}
                        name={b.name}
                        tone={b.bestValue ? "accent" : "terracotta"}
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}

            {filteredIndustry.length > 0 && (
              <div id="industry" className="mt-10 scroll-mt-28">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Industry-Specific Toolbox Talk Bundles
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tailored toolbox-talk sets for your trade or sector.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredIndustry.map((b) => (
                    <article
                      key={b.code}
                      className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-4"
                    >
                      <div>
                        <span className="block text-sm font-semibold text-card-foreground">{b.name}</span>
                        <span className="block font-mono text-xs text-muted-foreground">{b.code}</span>
                      </div>
                      <PriceLine code={b.code} />
                      <PurchaseCTA code={b.code} name={b.name} />
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* WHS templates, grouped by sub-category */}
        {showWhs && (
          <section id="whs" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Core WHS"
              title="WHS Templates & Forms"
              subtitle={`${whsTemplates.length} licensed documents · digital + Word`}
            />
            <div className="space-y-14">
              {whsGroups.map((group) => (
                <div key={group.id} id={`whs-${group.id}`} className="scroll-mt-28">
                  <div className="mb-6 flex items-center gap-3 border-b border-border pb-3">
                    <h3 className="font-heading text-xl font-black tracking-tight text-foreground">
                      {group.label}
                    </h3>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
                      {group.items.length}
                    </span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((item) => (
                      <TemplateCard key={item.code} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Project WHS */}
        {showProject && (
          <section id="project" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Project Delivery"
              title="Project Management WHS"
              subtitle={`${projectDocs.length} licensed documents · digital + Word · for project managers`}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProject.map((item) => (
                <TemplateCard key={item.code} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Leadership */}
        {showLeadership && (
          <section id="leadership" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Leadership Support Series"
              title="Leadership Support Series"
              subtitle={`${leadershipGuides.length} licensed guides · for managers & leaders · framed on the biopsychosocial model`}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLeadership.map((item) => (
                <TemplateCard key={item.code} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
