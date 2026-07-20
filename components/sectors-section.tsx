import { Building2, Leaf, Landmark, ClipboardList, type LucideIcon } from "lucide-react"
import { sectors, type SectorIcon } from "@/lib/site"

const iconMap: Record<SectorIcon, LucideIcon> = {
  building: Building2,
  leaf: Leaf,
  landmark: Landmark,
  clipboard: ClipboardList,
}

const accentClasses: Record<string, string> = {
  olive: "bg-olive/10 text-olive",
  gold: "bg-accent/15 text-accent-foreground",
  terracotta: "bg-terracotta/10 text-terracotta",
}

export function SectorsSection() {
  return (
    <section id="sectors" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-terracotta" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
              Assess → Improve → Sustain
            </span>
          </div>
          <h2 className="mt-4 text-balance font-heading text-3xl font-black leading-tight text-foreground sm:text-4xl">
            Know where you stand, and how to get better.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            We benchmark your current WHS maturity, work out where improvement will make the biggest
            difference, and give your people the forms, templates and guides to keep building on solid
            foundations, sector by sector.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map((sector) => {
            const Icon = iconMap[sector.icon]
            return (
              <article
                key={sector.title}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${accentClasses[sector.accent]}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-foreground">{sector.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{sector.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
