import Image from "next/image"
import { platformTags } from "@/lib/site"
import { WaitlistCTA } from "@/components/waitlist-cta"

export function PlatformSection() {
  return (
    <section id="platform" className="bg-primary-gradient-glow py-20 text-primary-foreground md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-accent" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              Coming Soon
            </span>
          </div>
          <h2 className="mt-4 text-balance font-heading text-3xl font-black leading-tight sm:text-4xl">
            The SolumPM Platform
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-primary-foreground/85">
            SolumPM brings WHS, stakeholders, projects, business and finance together in one place, so
            you can see what is happening across the operation without switching between systems.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {platformTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary-foreground/20 px-4 py-1.5 text-sm font-medium text-primary-foreground/85"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-3 shadow-2xl">
          <Image
            src="/platform-modules.png"
            alt="SolumPM platform dashboard showing its integrated modules"
            width={1600}
            height={900}
            className="w-full rounded-xl"
          />
        </div>

        <div className="mt-10">
          <WaitlistCTA />
        </div>
      </div>
    </section>
  )
}
