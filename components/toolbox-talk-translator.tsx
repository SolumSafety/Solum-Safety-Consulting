"use client"

import { useState } from "react"

const LANGUAGES = [
  "Mandarin Chinese",
  "Vietnamese",
  "Punjabi",
  "Arabic",
  "Spanish",
  "Tagalog (Filipino)",
  "Hindi",
  "Korean",
  "Nepali",
  "Samoan",
]

export function ToolboxTalkTranslator({
  sessionId,
  talks,
}: {
  sessionId: string
  talks: { code: string; title: string }[]
}) {
  const [talkCode, setTalkCode] = useState(talks[0]?.code ?? "")
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [translating, setTranslating] = useState(false)
  const [result, setResult] = useState<{ title: string; html: string; targetLanguage: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function translate() {
    setTranslating(true)
    setErrorMsg(null)
    setResult(null)
    try {
      const res = await fetch("/api/toolbox-talks/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, talkCode, targetLanguage: language }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not translate this talk.")
      setResult({ title: data.title, html: data.html, targetLanguage: data.targetLanguage })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setTranslating(false)
    }
  }

  function downloadTranslated() {
    if (!result) return
    const blob = new Blob([result.html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${result.title.replace(/[^a-z0-9]+/gi, "-")}-${result.targetLanguage.replace(/[^a-z0-9]+/gi, "-")}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-6 rounded-xl border border-[#18707F]/30 bg-[#18707F]/5 p-5">
      <p className="font-heading text-sm font-bold text-[#16294D]">Translate a toolbox talk</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        Free with your bundle — get any toolbox talk in another language for your team.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <select
          value={talkCode}
          onChange={(e) => setTalkCode(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          {talks.map((t) => (
            <option key={t.code} value={t.code}>
              {t.title}
            </option>
          ))}
        </select>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <button
          onClick={translate}
          disabled={translating || !talkCode}
          className="rounded-lg bg-[#16294D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#18707F] disabled:opacity-40"
        >
          {translating ? "Translating…" : "Translate"}
        </button>
      </div>

      {errorMsg && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">
              {result.title} — {result.targetLanguage}
            </p>
            <button
              onClick={downloadTranslated}
              className="rounded-full bg-[#16294D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#18707F]"
            >
              Download
            </button>
          </div>
          <div
            className="prose prose-sm mt-3 max-h-72 max-w-none overflow-y-auto rounded border border-border p-3"
            dangerouslySetInnerHTML={{ __html: result.html }}
          />
        </div>
      )}
    </div>
  )
}
