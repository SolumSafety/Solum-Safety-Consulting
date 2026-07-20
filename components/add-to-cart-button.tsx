"use client"

import { Check, Plus } from "lucide-react"

import { useCart } from "@/lib/cart-context"

const TONES = {
  terracotta: "bg-terracotta text-terracotta-foreground hover:bg-terracotta/90",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
} as const

export function AddToCartButton({
  code,
  name,
  priceInCents,
  tone = "terracotta",
}: {
  code: string
  name: string
  priceInCents: number
  tone?: keyof typeof TONES
}) {
  const { add, has, openCart } = useCart()
  const inCart = has(code)

  return (
    <button
      type="button"
      onClick={() => (inCart ? openCart() : add({ code, name, priceInCents }))}
      aria-pressed={inCart}
      className={
        inCart
          ? "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/70"
          : `inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${TONES[tone]}`
      }
    >
      {inCart ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          In cart — view
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add to cart
        </>
      )}
    </button>
  )
}
