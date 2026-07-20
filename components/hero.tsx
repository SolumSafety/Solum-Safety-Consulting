import Link from "next/link"
import { ShieldCheck, CircleCheck, Award, MessageCircle, ArrowRight, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trustBadges } from "@/lib/site"

const badgeIcons: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  check: CircleCheck,
  award: Award,
  message: MessageCircle,
}

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      {/* Full-bleed cinematic backdrop: slow panning office-building scene */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/hero-office.mp4"
        poster="/hero-office-poster.png"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8 lg:py-40">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-accent" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              WHS &amp; Safety Advisory · Australia
            </span>
          </div>
          <h1 className="mt-6 text-balance font-heading text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Building Safety From The Ground Up.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/85">
            We assess your WHS maturity, show where your team and organisation need to improve, then
            give you the tools and guidance to build a safety culture that lasts.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-terracotta-gradient text-terracotta-foreground hover:opacity-95"
              nativeButton={false}
              render={<Link href="#contact" />}
            >
              Make an Enquiry
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              nativeButton={false}
              render={<Link href="#services" />}
            >
              Explore Our Services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <ul className="mt-16 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-6 border-t border-primary-foreground/15 pt-8 sm:grid-cols-4 md:mt-20">
          {trustBadges.map((badge) => {
            const Icon = badgeIcons[badge.icon] ?? CircleCheck
            return (
              <li key={badge.label} className="flex flex-col gap-2 text-sm">
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                <span className="font-medium leading-snug text-primary-foreground/85">{badge.label}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
