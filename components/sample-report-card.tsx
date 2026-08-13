"use client"

/**
 * components/sample-report-card.tsx
 * Solum Safety Consulting — Sample Report Card v1
 *
 * Extracted from the reports page specifically to add error handling —
 * if Next's built-in image optimizer fails on a given file (a known
 * category of bug: some PNGs pass a plain browser check but break the
 * server-side Sharp processing pipeline, or a bad cached optimized
 * copy sticks around from an earlier deploy), this falls back to the
 * raw, unoptimized file directly rather than silently rendering blank.
 */
import { useState } from "react"
import Image from "next/image"

export function SampleReportCard({
  cover,
  tier,
  title,
  description,
}: {
  cover: string
  tier: string
  title: string
  description: string
}) {
  const [optimizedFailed, setOptimizedFailed] = useState(false)

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[907/540] w-full border-b border-border bg-muted">
        {optimizedFailed ? (
          // Fallback: raw file, bypassing Next's image optimizer entirely.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover || "/placeholder.svg"}
            alt={`${title} sample report cover`}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <Image
            src={cover || "/placeholder.svg"}
            alt={`${title} sample report cover`}
            fill
            className="object-cover object-top"
            onError={() => setOptimizedFailed(true)}
          />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-terracotta px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-terracotta-foreground">
          {tier}
        </span>
      </div>
      <div className="p-7">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Sample report
        </span>
        <h3 className="mt-2 font-heading text-xl font-bold text-card-foreground">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </article>
  )
}
