"use client"

import { useState } from "react"
import { Check, Loader2, ShoppingCart, Tag, Trash2, X } from "lucide-react"

import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/products"
import { startCartCheckout, checkPromoCode } from "@/app/actions/stripe"

export function CartDrawer() {
  const { items, count, subtotalInCents, remove, clear, open, setOpen } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [promo, setPromo] = useState("")
  const [promoApplied, setPromoApplied] = useState<{ code: string; label: string } | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoChecking, setPromoChecking] = useState(false)

  async function handleApplyPromo() {
    const code = promo.trim()
    if (!code) return
    setPromoChecking(true)
    setPromoError(null)
    try {
      const result = await checkPromoCode(code)
      if (result.valid) {
        setPromoApplied({ code, label: result.label })
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

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const result = await startCartCheckout(
        items.map((i) => i.code),
        promoApplied?.code,
      )
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
    <>
      {/* Overlay */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-foreground/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-[70] flex h-dvh w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
            <ShoppingCart className="h-5 w-5 text-terracotta" aria-hidden="true" />
            Your cart
            {count > 0 && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                {count}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <ShoppingCart className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="font-semibold text-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Browse the catalogue and add the templates you need. Each purchase includes every
              available format.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Continue browsing
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.code} className="flex items-start justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{item.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{item.code}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatPrice(item.priceInCents)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.code)}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-terracotta"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="border-t border-border px-5 py-4">
              {/* Promo code */}
              <div className="mb-4">
                {promoApplied ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-2.5">
                    <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
                      <Check className="h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                      <span className="truncate">
                        Code <span className="font-semibold uppercase">{promoApplied.code}</span> applied
                        <span className="text-muted-foreground"> ({promoApplied.label})</span>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={clearPromo}
                      className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-terracotta"
                      aria-label="Remove promo code"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <label htmlFor="promo-code" className="sr-only">
                      Promo code
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <input
                          id="promo-code"
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
                          className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={promoChecking || !promo.trim()}
                        className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {promoChecking ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                    {promoError && (
                      <p className="mt-2 text-xs font-medium text-terracotta">{promoError}</p>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal (incl. GST)</span>
                <span className="font-heading text-xl font-black text-foreground">
                  {formatPrice(subtotalInCents)}
                </span>
              </div>
              {promoApplied && (
                <p className="mt-1 text-right text-xs font-medium text-terracotta">
                  {promoApplied.label} applied at checkout
                </p>
              )}
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Pay securely with card. Every template you buy is delivered in all available formats
                on the download page immediately after payment.
              </p>
              {error && <p className="mt-3 text-sm font-medium text-terracotta">{error}</p>}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-terracotta px-5 py-3 text-sm font-semibold text-terracotta-foreground transition-colors hover:bg-terracotta/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                )}
                {loading ? "Starting checkout…" : "Checkout securely"}
              </button>
              <button
                type="button"
                onClick={clear}
                className="mt-2 w-full rounded-lg px-5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-terracotta"
              >
                Clear cart
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
