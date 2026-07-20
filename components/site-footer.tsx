import Link from "next/link"
import { Mail } from "lucide-react"
import { site, footerColumns, footerLegal, ASSESSMENT_LOGIN_HREF } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="bg-primary-gradient text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-foreground/15 text-lg font-black">
                S
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-sm font-extrabold tracking-wide">SOLUM SAFETY</span>
                <span className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/70">
                  CONSULTING
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-primary-foreground/75">
              Building Safety from the Ground Up. Practical WHS consulting for Australian organisations.
            </p>
            <a
              href={site.emailHref}
              className="mt-5 inline-flex items-center gap-2 text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {site.email}
            </a>
            <a
              href={ASSESSMENT_LOGIN_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-sm text-primary-foreground/60 underline-offset-4 transition-colors hover:text-primary-foreground hover:underline"
            >
              Access my assessment
            </a>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/60">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-primary-foreground/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-primary-foreground/60">
            &copy; {new Date().getFullYear()} {site.name} <span className="mx-1">·</span> ABN 5493 2321 683
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {footerLegal.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-xs text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
