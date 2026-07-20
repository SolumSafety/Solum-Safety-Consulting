import { AlertCircle, FileWarning, TrendingDown, X, Check } from "lucide-react"
import { whyWeStarted } from "@/lib/site"
import { StoryVideo } from "@/components/story-video"

const accentChip: Record<"olive" | "gold" | "terracotta", string> = {
  olive: "bg-olive text-primary-foreground",
  gold: "bg-gold text-accent-foreground",
  terracotta: "bg-terracotta text-terracotta-foreground",
}

const atSameTimeIcons = [AlertCircle, FileWarning, TrendingDown]

export function WhyWeStartedSection() {
  return (
    <section id="why-we-started" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Intro + image */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-terracotta" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
                Our Story
              </span>
            </div>
            <h2 className="mt-4 text-balance font-heading text-3xl font-black leading-tight text-foreground sm:text-4xl">
              Why we started Solum Safety Consulting.
            </h2>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              {whyWeStarted.intro}
            </p>
          </div>

          <StoryVideo />
        </div>

        {/* At the same time */}
        <div className="mt-16 md:mt-20">
          <h3 className="font-heading text-2xl font-bold text-foreground">At the same time…</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {whyWeStarted.atSameTime.map((item, i) => {
              const Icon = atSameTimeIcons[i]
              return (
                <article key={item.text} className="rounded-2xl border border-border bg-card p-6">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentChip[item.accent]}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{item.text}</p>
                </article>
              )
            })}
          </div>
          <div className="mt-4 rounded-2xl bg-primary p-6 text-center text-primary-foreground md:p-7">
            <p className="mx-auto max-w-3xl text-pretty leading-relaxed">
              {whyWeStarted.atSameTimeSummary}
            </p>
          </div>
        </div>

        {/* What we found */}
        <div className="mt-16 grid gap-10 md:mt-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-gold">
              What We Found
            </span>
            <h3 className="mt-4 text-balance font-heading text-2xl font-bold leading-snug text-foreground sm:text-3xl">
              WHS was too complex, too unclear, or simply not embedded.
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Time and again we found WHS due diligence was not being done properly, risk maturity was
              not improving, and many businesses had no idea what level they were operating at, let alone
              how to lift it.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {whyWeStarted.whatWeFoundTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-terracotta/25 bg-terracotta/10 px-4 py-2 font-heading text-sm font-bold text-terracotta"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            {whyWeStarted.whatWeFound.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-terracotta text-terracotta-foreground">
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="leading-relaxed text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Why Solum was built */}
        <div className="mt-12 overflow-hidden rounded-2xl bg-primary-gradient-glow p-8 text-primary-foreground md:mt-16 md:p-10">
          <div className="max-w-2xl">
            <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-accent">
              Why Solum Was Built
            </span>
            <h3 className="mt-4 text-balance font-heading text-2xl font-black leading-tight sm:text-3xl">
              We started Solum Safety Consulting to fix this.
            </h3>
            <p className="mt-3 leading-relaxed text-primary-foreground/85">
              To give businesses the clear systems, practical tools and measurable assessments they were
              missing, along with a real path to improve.
            </p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyWeStarted.builtToDeliver.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="mt-3 font-heading text-sm font-bold leading-snug text-primary-foreground">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
