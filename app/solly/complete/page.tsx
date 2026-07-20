import { getSupabaseAdmin } from "@/lib/supabase-admin"
import Link from "next/link"

export const metadata = {
  title: "Documents unlocked | Solly — Solum Safety Consulting",
}

export default async function SollyCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>
}) {
  const { conversation: conversationId } = await searchParams

  const supabaseAdmin = getSupabaseAdmin()
  const sessions =
    supabaseAdmin && conversationId
      ? (
          await supabaseAdmin
            .from("form_sessions")
            .select("id, form_code, status")
            .eq("conversation_id", conversationId)
            .eq("status", "delivered")
        ).data ?? []
      : []

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F6F4EF] px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-[#E4DFD3] bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A84C]/15 text-[#C9A84C]">
          ✓
        </div>
        <h1 className="text-xl font-semibold text-[#16294D]">Payment confirmed</h1>
        <p className="mt-2 text-sm text-[#5A6472]">
          Solly's finished documents are unlocked and ready to download.
        </p>

        <div className="mt-6 space-y-2 text-left">
          {sessions.length === 0 && (
            <p className="rounded-lg border border-[#E4DFD3] bg-[#FAFAF7] px-3 py-3 text-sm text-[#5A6472]">
              Documents are still being unlocked. Refresh this page in a moment. If this persists, contact us and we can sort it out.
            </p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-[#E4DFD3] px-3 py-2.5 text-sm"
            >
              <span className="font-mono text-xs text-[#5A6472]">{s.form_code}</span>
              
                href={`/api/solly/document/${s.id}`}
                className="rounded-full bg-[#16294D] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#18707F]"
              >
                Download
              </a>
            </div>
          ))}
        </div>

        <Link
          href="/solly"
          className="mt-6 inline-block text-sm font-medium text-[#18707F] underline underline-offset-4"
        >
          Start another with Solly
        </Link>
      </div>
    </main>
  )
}
