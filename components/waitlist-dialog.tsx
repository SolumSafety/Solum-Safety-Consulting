"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { createPortal } from "react-dom"
import { X, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Status = "idle" | "submitting" | "success" | "error"

export function WaitlistDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => setMounted(true), [])

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    // Focus the first field when the dialog opens.
    const t = setTimeout(() => nameRef.current?.focus(), 50)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
      clearTimeout(t)
    }
  }, [open, onClose])

  // Reset back to the form when fully closed so re-opening is clean.
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStatus("idle")
        setError("")
      }, 200)
      return () => clearTimeout(t)
    }
  }, [open])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")
    setError("")

    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "waitlist" }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Something went wrong. Please try again.")
      }
      setStatus("success")
      form.reset()
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  if (!mounted || !open) return null

  const labelClass = "mb-1.5 block text-sm font-medium text-foreground"
  const fieldClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-foreground/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden="true" />
            <h3 className="mt-4 font-heading text-xl font-bold text-card-foreground">
              Thank you for joining!
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You&apos;re on the SolumPM wait list. We&apos;ll be in touch as soon as early access opens.
            </p>
            <Button className="mt-6" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
              SolumPM Platform
            </span>
            <h3 id="waitlist-title" className="mt-2 font-heading text-2xl font-black text-card-foreground">
              Join the Waitlist
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Be first to know when SolumPM launches. Enter your details and we&apos;ll keep you posted.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="wl-name" className={labelClass}>
                  Name
                </label>
                <input
                  ref={nameRef}
                  id="wl-name"
                  name="name"
                  required
                  autoComplete="name"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="wl-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="wl-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="wl-org" className={labelClass}>
                  Organisation
                </label>
                <input
                  id="wl-org"
                  name="organisation"
                  required
                  autoComplete="organization"
                  className={fieldClass}
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Submitting…
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
