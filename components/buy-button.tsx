"use client"

import { useState } from "react"
import { Check, Loader2, ShoppingCart, Tag, X } from "lucide-react"

import { startCheckout, checkPromoCode } from "@/app/actions/stripe"

const TONES = {
  terracotta: "bg-terracotta text-terracotta-foreground hover:bg-terracotta/90",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
  ghost: "border border-border bg-transparent text-foreground hover:bg-muted",
  // Outlined style for use on dark cards (e.g. the "best value" package),
  // where the standard ghost button would be invisible.
  "ghost-invert":
    "border border-primary-foreground/50 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20",
} as const

export function BuyButton({
  code,
  price,
  tone = "terracotta",
  label,
}: {
  code: string
  price: string
  tone?: keyof typeof TONES
  label?: string
}) {
  // On dark cards the promo toggle / messages need light colours to stay legible.
  const invert = tone === "ghost-invert"

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showPromo, setShowPromo] = useState(false)
  const [promo, setPromo] = useState("")
  const [promoApplied, setPromoApplied] = useState<{ code: string; label: string } | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoChecking, setPromoChecking] = useState(false)

  async function handleApplyPromo() {
    const value = promo.trim()
    if (!value) return
    setPromoChecking(true)
    setPromoError(null)
    try {
      const result = await checkPromoCode(value)
      if (result.valid) {
        setPromoApplied({ code: value, label: result.label })
        setPromoError(null)
      } else {
        setPromoApplied(null)
        setPromoError(result.error)
      }
    } catch {
      setPromoError("Couldn't check that code. Please try again.")
    }
    setPromoChecking(false)
  }

  function clearPromo() {
    setPromoApplied(null)
    setPromo("")
    setPromoError(null)
  }

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const result = await startCheckout(code, promoApplied?.code)
      if ("url" in result) {
        window.location.href = result.url
        return
      }
      setError(result.error)
    } catch {
      setError("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${TONES[tone]}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        )}
        {loading ? "Starting checkout…" : label ? label : `Buy now — ${price}`}
      </button>

      {/* Promo code */}
      {promoApplied ? (
        <div
          className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
            invert
              ? "border-primary-foreground/25 bg-primary-foreground/10"
              : "border-terracotta/30 bg-terracotta/10"
          }`}
        >
          <span
            className={`flex min-w-0 items-center gap-2 text-xs font-medium ${
              invert ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            <Check
              className={`h-3.5 w-3.5 shrink-0 ${invert ? "text-accent" : "text-terracotta"}`}
              aria-hidden="true"
            />
            <span className="truncate">
              Code <span className="font-semibold uppercase">{promoApplied.code}</span> applied
              <span className={invert ? "text-primary-foreground/70" : "text-muted-foreground"}>
                {" "}
                ({promoApplied.label})
              </span>
            </span>
          </span>
          <button
            type="button"
            onClick={clearPromo}
            className={`shrink-0 rounded-md p-1 transition-colors ${
              invert
                ? "text-primary-foreground/70 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-terracotta"
            }`}
            aria-label="Remove promo code"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : showPromo ? (
        <div>
          <label htmlFor={`promo-${code}`} className="sr-only">
            Promo code
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id={`promo-${code}`}
                type="text"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                    e.preventDefault()
                    handleApplyPromo()
                  }
                }}
                placeholder="Promo code"
                autoComplete="off"
                className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={promoChecking || !promo.trim()}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary px-3.5 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {promoChecking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Apply"}
            </button>
          </div>
          {promoError && (
            <p className={`mt-1.5 text-xs font-medium ${invert ? "text-accent" : "text-terracotta"}`}>
              {promoError}
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPromo(true)}
          className={`self-start text-xs font-medium underline-offset-4 transition-colors hover:underline ${
            invert
              ? "text-primary-foreground/80 hover:text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Have a promo code?
        </button>
      )}

      {error ? (
        <p className={`text-xs font-medium ${invert ? "text-accent" : "text-terracotta"}`}>{error}</p>
      ) : null}
    </div>
  )
}
