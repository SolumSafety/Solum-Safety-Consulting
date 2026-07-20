import { pillars } from "@/lib/site"

export function ApproachSection() {
  return (
    <section id="approach" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-terracotta" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
              Our Approach
            </span>
          </div>
          <h2 className="mt-4 text-balance font-heading text-3xl font-black leading-tight text-foreground sm:text-4xl">
            The foundations of high-performing organisations.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {pillars.map((pillar) => (
            <article key={pillar.number} className="bg-card p-8">
              <span className="font-heading text-4xl font-black text-accent">{pillar.number}</span>
              <h3 className="mt-4 font-heading text-xl font-bold text-foreground">{pillar.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{pillar.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
