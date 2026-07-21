import Link from "next/link"
import { Home } from "lucide-react"
import SollyChat from "@/components/solly/solly-chat"

export const metadata = {
  title: "Solly — WHS Agent | Solum Safety Consulting",
  description: "Chat with Solly to identify and complete the WHS templates and forms your site needs.",
}

export default function SollyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F6F4EF] px-4 py-10">
      <div className="mb-4 w-full max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5A6472] transition hover:text-[#18707F]"
        >
          <Home className="h-4 w-4" />
          Back to website
        </Link>
      </div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-[#16294D]">Talk to Solly</h1>
        <p className="mt-1 text-sm text-[#5A6472]">Your WHS Agent — find the right form, draft it, done.</p>
      </div>
      <SollyChat />
    </main>
  )
}

