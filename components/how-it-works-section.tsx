import Link from "next/link"
import { ShieldCheck, BarChart3, FileText, CheckCircle2, ArrowRight, type LucideIcon } from "lucide-react"
import { steps, lifecycleStages, type StepIcon } from "@/lib/site"

const iconMap: Record<StepIcon, LucideIcon> = {
  shield: ShieldCheck,
  chart: BarChart3,
  file: FileText,
  check: CheckCircle2,
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-secondary py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-terracotta" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
              How It Works
            </span>
          </div>
          <h2 className="mt-4 text-balance font-heading text-3xl font-black leading-tight text-foreground sm:text-4xl">
            From assessment to a lasting safety culture.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            A clear pathway that turns a point-in-time maturity snapshot into steady improvement your
            whole organisation can keep up.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = iconMap[step.icon]
            return (
              <li
                key={step.step}
                className="relative flex flex-col rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            )
          })}
        </ol>

        <div className="mt-12 rounded-2xl bg-primary-gradient-glow p-8 text-primary-foreground md:p-10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">
            {lifecycleStages.map((stage, i) => (
              <span key={stage} className="flex items-center gap-3">
                {stage}
                {i < lifecycleStages.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 text-primary-foreground/40" aria-hidden="true" />
                )}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h3 className="font-heading text-2xl font-black leading-tight sm:text-3xl">
                Support across the full lifecycle.
              </h3>
              <p className="mt-3 leading-relaxed text-primary-foreground/85">
                Our work does not stop at the assessment. We help you build, implement, verify and
                maintain WHS systems that hold up in practice.
              </p>
            </div>
            <Link
              href="#what-we-do"
              className="inline-flex items-center gap-2 font-semibold text-accent transition-colors hover:text-primary-foreground"
            >
              See how we work
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
