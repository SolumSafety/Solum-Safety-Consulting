"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

export type CartItem = {
  code: string
  name: string
  priceInCents: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotalInCents: number
  has: (code: string) => boolean
  add: (item: CartItem) => void
  remove: (code: string) => void
  clear: () => void
  open: boolean
  setOpen: (open: boolean) => void
  openCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "solum-cart-v1"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (i) => i && typeof i.code === "string" && typeof i.priceInCents === "number",
            ),
          )
        }
      }
    } catch {
      // Ignore corrupt storage.
    }
    setHydrated(true)
  }, [])

  // Persist whenever items change (after hydration, so we don't clobber storage).
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage full / unavailable — non-fatal.
    }
  }, [items, hydrated])

  const has = useCallback((code: string) => items.some((i) => i.code === code), [items])

  const add = useCallback((item: CartItem) => {
    setItems((prev) => (prev.some((i) => i.code === item.code) ? prev : [...prev, item]))
    setOpen(true)
  }, [])

  const remove = useCallback((code: string) => {
    setItems((prev) => prev.filter((i) => i.code !== code))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const openCart = useCallback(() => setOpen(true), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.length,
      subtotalInCents: items.reduce((sum, i) => sum + i.priceInCents, 0),
      has,
      add,
      remove,
      clear,
      open,
      setOpen,
      openCart,
    }),
    [items, has, add, remove, clear, open, openCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}
