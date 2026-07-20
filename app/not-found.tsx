import Link from "next/link"
import { ArrowRight, Home } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { navLinks } from "@/lib/site"

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="bg-surface-gradient">
        <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-terracotta" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
              Page not found
            </span>
            <span className="h-px w-10 bg-terracotta" aria-hidden="true" />
          </div>

          <p className="mt-6 font-heading text-6xl font-black leading-none text-primary sm:text-7xl">404</p>

          <h1 className="mt-6 text-balance font-heading text-3xl font-bold text-foreground sm:text-4xl">
            We couldn&apos;t find that page.
          </h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            The page you&apos;re looking for may have moved or no longer exists. Let&apos;s get you back on
            solid ground.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-terracotta-gradient text-terracotta-foreground hover:opacity-95"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent"
              nativeButton={false}
              render={<Link href="/#contact" />}
            >
              Contact us
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <nav
            aria-label="Helpful links"
            className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-border pt-8 text-sm"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-muted-foreground transition-colors hover:text-terracotta"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
