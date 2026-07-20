"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { navLinks, site, ASSESSMENT_LOGIN_HREF } from "@/lib/site"
import { useCart } from "@/lib/cart-context"

function CartButton({ className = "" }: { className?: string }) {
  const { count, openCart } = useCart()
  return (
    <button
      type="button"
      onClick={openCart}
      className={`relative inline-flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-muted ${className}`}
      aria-label={`Open cart${count > 0 ? ` (${count} item${count === 1 ? "" : "s"})` : ""}`}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[0.7rem] font-bold leading-none text-terracotta-foreground">
          {count}
        </span>
      )}
    </button>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} home`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-lg font-black text-primary-foreground">
            S
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-extrabold tracking-wide text-foreground">SOLUM SAFETY</span>
            <span className="text-[0.65rem] font-semibold tracking-[0.3em] text-muted-foreground">CONSULTING</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={ASSESSMENT_LOGIN_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Access my assessment
          </a>
          <Button
            className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
            nativeButton={false}
            render={<Link href="/#contact" />}
          >
            Make an Enquiry
          </Button>
          <CartButton />
        </nav>

        <div className="flex items-center gap-1 xl:hidden">
          <CartButton />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background xl:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={ASSESSMENT_LOGIN_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted"
            >
              Access my assessment
            </a>
            <Button
              className="mt-2 bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
              nativeButton={false}
              render={<Link href="/#contact" onClick={() => setOpen(false)} />}
            >
              Make an Enquiry
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
