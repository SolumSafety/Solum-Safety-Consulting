import { Quote } from "lucide-react"
import { testimonials } from "@/lib/site"

const accentAvatar: Record<"olive" | "gold" | "terracotta", string> = {
  olive: "bg-olive text-primary-foreground",
  gold: "bg-gold text-accent-foreground",
  terracotta: "bg-terracotta text-terracotta-foreground",
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-secondary py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-terracotta" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
              What Clients Say
            </span>
          </div>
          <h2 className="mt-4 text-balance font-heading text-3xl font-black leading-tight text-foreground sm:text-4xl">
            Trusted to make safety practical.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Organisations across construction, renewables and infrastructure work with Solum to turn WHS
            obligations into systems their teams will use.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm"
            >
              <Quote className="h-8 w-8 text-accent" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-pretty leading-relaxed text-foreground">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold ${accentAvatar[t.accent]}`}
                  aria-hidden="true"
                >
                  {initials(t.name)}
                </span>
                <span className="flex flex-col">
                  <span className="font-heading text-sm font-bold text-foreground">{t.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {t.role} · {t.company}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
