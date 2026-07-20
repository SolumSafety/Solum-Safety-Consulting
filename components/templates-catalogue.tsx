"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  Lock,
  Package,
  ChevronRight,
  Folder,
  FolderOpen,
  ClipboardCheck,
  HardHat,
  MessagesSquare,
  Factory,
  HeartHandshake,
  Sparkles,
} from "lucide-react"
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
} from "@/lib/catalogue"
import { getProduct, isPurchasable, formatPrice } from "@/lib/products"

/** Number of generic toolbox talks included in the generic bundle. */
const GENERIC_TOOLBOX_COUNT = 68
/** Leadership guides shown in full before the "additional" list. */
const LEADERSHIP_FEATURED = 5

function enquiryHref(name: string, code: string) {
  const params = new URLSearchParams({ enquiry: name, code })
  return `/?${params.toString()}#contact`
}

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
        <AddToCartButton code={code} name={name} priceInCents={product.priceInCents} tone={tone} />
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
        <h4 className="font-heading text-base font-bold leading-snug text-card-foreground">{item.name}</h4>
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

/** A compact list row used for the "additional" leadership guides. */
function CompactRow({ item }: { item: TemplateItem }) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h4 className="font-heading text-sm font-bold text-card-foreground">{item.name}</h4>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
      <div className="shrink-0 sm:w-44">
        <PriceLine code={item.code} />
        <div className="mt-2">
          <PurchaseCTA code={item.code} name={item.name} />
        </div>
      </div>
    </article>
  )
}

type FolderId = "bundles" | "whs" | "project" | "generic" | "industry" | "leadership"

const folderMeta: {
  id: FolderId
  label: string
  icon: typeof Folder
  blurb: string
}[] = [
  {
    id: "bundles",
    label: "Bundles & Packages",
    icon: Package,
    blurb: "Value-priced collections and complete libraries — the fastest way to a full system.",
  },
  {
    id: "whs",
    label: "WHS Templates & Forms",
    icon: ClipboardCheck,
    blurb: "Core WHS documents grouped by type. Every form comes with a matching editable Word template.",
  },
  {
    id: "project",
    label: "Project Management WHS",
    icon: HardHat,
    blurb: "Documents for planning and delivering projects safely, from mobilisation to close-out.",
  },
  {
    id: "generic",
    label: "Generic Toolbox Talks",
    icon: MessagesSquare,
    blurb: "Ready-to-run pre-start briefings covering hazards, PPE, wellbeing and site safety.",
  },
  {
    id: "industry",
    label: "Industry-Specific Toolbox Talks",
    icon: Factory,
    blurb: "Toolbox-talk sets tailored to your trade or sector.",
  },
  {
    id: "leadership",
    label: "Leadership Support Series",
    icon: HeartHandshake,
    blurb: "Guides that build the leadership habits driving WHS performance, framed on the biopsychosocial model.",
  },
]

function FolderShell({
  id,
  label,
  icon: Icon,
  blurb,
  count,
  countLabel,
  isOpen,
  onToggle,
  children,
}: {
  id: FolderId
  label: string
  icon: typeof Folder
  blurb: string
  count: number
  countLabel: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 overflow-hidden rounded-2xl border border-border bg-card">
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`${id}-body`}
          className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-muted/60 md:p-6"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            {isOpen ? (
              <FolderOpen className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Icon className="h-6 w-6" aria-hidden="true" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-heading text-lg font-black tracking-tight text-foreground md:text-xl">
                {label}
              </span>
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
                {count} {countLabel}
              </span>
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{blurb}</span>
          </span>
          <ChevronRight
            className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
              isOpen ? "rotate-90 text-terracotta" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </h2>
      {isOpen && (
        <div id={`${id}-body`} className="border-t border-border p-5 md:p-6">
          {children}
        </div>
      )}
    </section>
  )
}

export function TemplatesCatalogue() {
  const [query, setQuery] = useState("")
  const [manualOpen, setManualOpen] = useState<Set<FolderId>>(new Set(["bundles"]))

  const q = query.trim().toLowerCase()

  const matchItem = (i: TemplateItem) =>
    !q ||
    i.name.toLowerCase().includes(q) ||
    i.code.toLowerCase().includes(q) ||
    i.description.toLowerCase().includes(q)

  const filteredWhs = useMemo(() => whsTemplates.filter(matchItem), [q])
  const filteredProject = useMemo(() => projectDocs.filter(matchItem), [q])
  const filteredLeadership = useMemo(() => leadershipGuides.filter(matchItem), [q])
  const filteredBundles = useMemo(
    () =>
      bundles.filter(
        (b) =>
          !q ||
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q),
      ),
    [q],
  )
  const filteredIndustry = useMemo(
    () =>
      industryBundles.filter(
        (b) => !q || b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q),
      ),
    [q],
  )
  const genericMatches = !q || "generic toolbox talks".includes(q) || "gtbt".includes(q)

  const whsGroups = useMemo(
    () =>
      whsSubcategories
        .map((sub) => ({
          ...sub,
          items: filteredWhs.filter((i) => getWhsSubcategory(i.code) === sub.id),
        }))
        .filter((g) => g.items.length > 0),
    [filteredWhs],
  )

  // Which folders have results for the current query.
  const hasResults: Record<FolderId, boolean> = {
    bundles: filteredBundles.length > 0,
    whs: filteredWhs.length > 0,
    project: filteredProject.length > 0,
    generic: genericMatches,
    industry: filteredIndustry.length > 0,
    leadership: filteredLeadership.length > 0,
  }

  const counts: Record<FolderId, number> = {
    bundles: bundles.length,
    whs: whsTemplates.length,
    project: projectDocs.length,
    generic: GENERIC_TOOLBOX_COUNT,
    industry: industryBundles.length,
    leadership: leadershipGuides.length,
  }
  const countLabels: Record<FolderId, string> = {
    bundles: "packages",
    whs: "forms",
    project: "documents",
    generic: "talks",
    industry: "sets",
    leadership: "guides",
  }

  const toggle = (id: FolderId) =>
    setManualOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // When searching, force-open every folder that has a match. Otherwise use
  // the manual open/closed state the visitor has clicked into.
  const isOpen = (id: FolderId) => (q ? hasResults[id] : manualOpen.has(id))

  const visibleFolders = folderMeta.filter((f) => (q ? hasResults[f.id] : true))
  const nothing = q && visibleFolders.length === 0

  return (
    <div>
      {/* Licensing notice */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex gap-3 rounded-xl border-l-4 border-accent bg-muted p-5">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">These templates are licensed products.</span>{" "}
            Purchase securely online and download your files instantly. You&apos;ll receive the digital form
            and a matching editable Word version, ready to brand to your business. Licensed for use within
            your own organisation only, not for resale or redistribution.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="sticky top-[65px] z-30 mt-8 border-y border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all folders by name or code…"
              aria-label="Search templates"
              className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          {q && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/70"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm text-muted-foreground">
          {q ? (
            <>Showing folders with matches for &ldquo;{query}&rdquo;.</>
          ) : (
            <>Click a folder to open it and browse the forms and templates inside.</>
          )}
        </p>

        {nothing && (
          <p className="py-20 text-center text-muted-foreground">
            No templates match &ldquo;{query}&rdquo;. Try a different search.
          </p>
        )}

        <div className="space-y-4">
          {visibleFolders.map((f) => (
            <FolderShell
              key={f.id}
              id={f.id}
              label={f.label}
              icon={f.icon}
              blurb={f.blurb}
              count={counts[f.id]}
              countLabel={countLabels[f.id]}
              isOpen={isOpen(f.id)}
              onToggle={() => toggle(f.id)}
            >
              {/* Bundles */}
              {f.id === "bundles" && (
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
                        <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          Best Value · Includes Solly AI
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
                        <PurchaseCTA code={b.code} name={b.name} tone={b.bestValue ? "accent" : "terracotta"} />
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* WHS — grouped by sub-category */}
              {f.id === "whs" && (
                <div className="space-y-12">
                  {whsGroups.map((group) => (
                    <div key={group.id} id={`whs-${group.id}`} className="scroll-mt-28">
                      <div className="mb-5 flex items-center gap-3 border-b border-border pb-3">
                        <h3 className="font-heading text-lg font-black tracking-tight text-foreground">
                          {group.label}
                        </h3>
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
                          {group.items.length} forms
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
              )}

              {/* Project WHS */}
              {f.id === "project" && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProject.map((item) => (
                    <TemplateCard key={item.code} item={item} />
                  ))}
                </div>
              )}

              {/* Generic Toolbox Talks */}
              {f.id === "generic" && (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {bundles
                    .filter((b) => b.code === "GTBT-SSC-Bundle-001")
                    .map((b) => (
                      <article
                        key={b.code}
                        className="flex flex-col rounded-xl border border-border bg-card p-6"
                      >
                        <h3 className="font-heading text-lg font-bold text-card-foreground">{b.name}</h3>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">{b.code}</p>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                          {b.description}
                        </p>
                        <PriceLine code={b.code} />
                        <div className="mt-5">
                          <PurchaseCTA code={b.code} name={b.name} />
                        </div>
                      </article>
                    ))}
                  <div className="flex flex-col justify-center rounded-xl border border-dashed border-border bg-muted/40 p-6 text-sm leading-relaxed text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground">{GENERIC_TOOLBOX_COUNT} talks</span>{" "}
                      delivered as slides and documents for quick pre-start briefings. Included in the Solum
                      WHS Package.
                    </p>
                  </div>
                </div>
              )}

              {/* Industry-Specific Toolbox Talks */}
              {f.id === "industry" && (
                <>
                  <p className="mb-5 rounded-lg border-l-4 border-accent bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">Note:</span> Industry-specific toolbox
                    talks are the one thing not included in the Solum WHS Package — purchase the sets you need
                    below.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                </>
              )}

              {/* Leadership — 5 featured + additional */}
              {f.id === "leadership" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="mb-5 font-heading text-lg font-black tracking-tight text-foreground">
                      Featured leadership toolboxes
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredLeadership.slice(0, LEADERSHIP_FEATURED).map((item) => (
                        <TemplateCard key={item.code} item={item} />
                      ))}
                    </div>
                  </div>

                  {filteredLeadership.length > LEADERSHIP_FEATURED && (
                    <div>
                      <h3 className="mb-4 font-heading text-lg font-black tracking-tight text-foreground">
                        Additional leadership toolboxes
                        <span className="ml-2 inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
                          {filteredLeadership.length - LEADERSHIP_FEATURED} more
                        </span>
                      </h3>
                      <div className="grid gap-3">
                        {filteredLeadership.slice(LEADERSHIP_FEATURED).map((item) => (
                          <CompactRow key={item.code} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </FolderShell>
          ))}
        </div>
      </div>
    </div>
  )
}
