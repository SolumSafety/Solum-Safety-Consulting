"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { WaitlistDialog } from "@/components/waitlist-dialog"

export function WaitlistCTA() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-accent-gradient px-6 py-3 font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
      >
        Join the Waitlist
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
      <WaitlistDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
