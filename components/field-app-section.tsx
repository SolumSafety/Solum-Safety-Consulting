/**
 * components/field-app-section.tsx
 * Solum Safety Consulting — Field App Promo Section v1
 *
 * A dedicated section describing the SolumWHS Field App and linking out
 * to sscfieldapp.com, replacing the earlier simple header link with a
 * fuller marketing treatment: heading, mockup image, and content.
 */
import Image from "next/image"

const FIELD_APP_URL = "https://sscfieldapp.com"

const HIGHLIGHTS = [
  "Every WHS and Project Management template, ready to fill in on-site",
  "Solly AI drafts a genuine first version with your team, not a blank form",
  "Full visibility for the WHS manager — see what your team has completed, remotely",
]

export function FieldAppSection() {
  return (
    <section className="border-t border-border bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              For your whole team
            </span>
            <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-foreground md:text-4xl">
              The SolumWHS Field App
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The same practical WHS system you already trust from Solum Safety Consulting, now as a
              standalone tool your whole team can use on-site — with full visibility for the person who
              has to answer for it.
            </p>
            <ul className="mt-6 space-y-3">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/90">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a
                href={FIELD_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-terracotta px-6 py-3 text-sm font-semibold text-terracotta-foreground transition-colors hover:bg-terracotta/90"
              >
                Explore the Field App
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <Image
              src="/field-app-mockup.svg"
              alt="Preview of the SolumWHS Field App showing the template library and team history"
              width={800}
              height={560}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
