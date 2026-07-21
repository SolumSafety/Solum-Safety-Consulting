"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Send, FileCheck2, Lock, Unlock, Loader2, ShieldCheck, ShoppingBag, Camera, Mic, MicOff, AlertTriangle, ArrowLeft } from "lucide-react"

// ---------------------------------------------------------------------------
// Solly — the WHS Agent chat interface.
//
// Design tokens (see design notes at bottom of file for rationale):
//   navy    #16294D   primary / Solly's voice
//   teal    #18707F   accent / active states
//   gold    #C9A84C   calls to action, stamps
//   cream   #F6F4EF   background
//   charcoal#22262B   body text
//   border  #E4DFD3
// ---------------------------------------------------------------------------

type ChatMessage = { role: "user" | "assistant"; content: string }

type Phase =
  | "intake" // free conversation, Solly asking questions
  | "recommended" // Solly proposed templates, awaiting client confirmation
  | "drafting" // draft in progress
  | "ready_for_purchase" // watermarked previews ready
  | "unlocked" // entitlement or purchase completed, final docs available
  | "checkout" // sent to Stripe for one-off purchase

type DraftResult = { formCode: string; sessionId: string; previewHtml: string }
type UnlockedDoc = { formCode: string; sessionId: string; finalHtml?: string }

const STAMP_LABEL: Record<Phase, string> = {
  intake: "GATHERING DETAILS",
  recommended: "TEMPLATES PROPOSED",
  drafting: "DRAFTING",
  ready_for_purchase: "DRAFT — LOCKED",
  unlocked: "UNLOCKED",
  checkout: "AWAITING PAYMENT",
}

export default function SollyChat({ clientEmail: initialEmail }: { clientEmail?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm Solly — the Solum Safety Consulting WHS Agent. Tell me a bit about your site or situation and I'll help work out which forms you need, then draft them with you.\n\nA quick note: I'm an AI assistant, not a WHS professional. My drafts should be reviewed and adapted to your site before use, and they don't replace legal advice. I also don't run full WHS gap analyses — that's a separate service. Just ask if you'd like details on that instead.",
    },
  ])
  const [input, setInput] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>("intake")
  const [recommendedCodes, setRecommendedCodes] = useState<string[]>([])
  const [recommendedForms, setRecommendedForms] = useState<{ code: string; title: string }[]>([])
  const [recommendedPackages, setRecommendedPackages] = useState<{ code: string; name: string }[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set())
  const [drafts, setDrafts] = useState<DraftResult[]>([])
  const [activeDraftCode, setActiveDraftCode] = useState<string | null>(null)
  const [unlockedDocs, setUnlockedDocs] = useState<UnlockedDoc[]>([])
  const [email, setEmail] = useState(initialEmail ?? "")
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [bundleUpsell, setBundleUpsell] = useState<string | null>(null)
  const [bypassKey, setBypassKey] = useState<string | null>(null)
  const [showBuyCredits, setShowBuyCredits] = useState(false)
  const [buyingCredits, setBuyingCredits] = useState(false)
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false)
  const [hazardResults, setHazardResults] = useState<{ description: string; severity: "low" | "medium" | "high" }[] | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Owner-only rate limit bypass: visit /solly?key=YOUR_KEY once, it's
  // remembered locally after that. Never shown or exposed to other clients.
  // Owner-only rate limit bypass: visit /solly?key=YOUR_KEY once, it's
  // remembered locally after that. Never shown or exposed to other clients.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get("key")
    if (fromUrl) {
      localStorage.setItem("solly_bypass_key", fromUrl)
      setBypassKey(fromUrl)
      params.delete("key")
      const cleanUrl = window.location.pathname + (params.toString() ? `?${params}` : "")
      window.history.replaceState({}, "", cleanUrl)
    } else {
      const stored = localStorage.getItem("solly_bypass_key")
      if (stored) setBypassKey(stored)
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const creditsResult = params.get("credits")
    if (creditsResult === "granted") {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Your 10 extra drafts have been added to your account. You're all set to continue." },
      ])
      setShowBuyCredits(false)
      params.delete("credits")
      const cleanUrl = window.location.pathname + (params.toString() ? `?${params}` : "")
      window.history.replaceState({}, "", cleanUrl)
    } else if (creditsResult === "error" || creditsResult === "unpaid") {
      setErrorMsg("We couldn't confirm that payment. If you were charged, contact us and we'll sort it out.")
      params.delete("credits")
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, phase])

  // Web Speech API — Chrome/Edge/most Android browsers support this; Safari
  // has partial support, Firefox doesn't. The mic button only appears if
  // the browser actually supports it, rather than showing a broken button.
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setVoiceSupported(!!SpeechRecognition)
  }, [])

  function toggleVoiceInput() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-AU"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  async function analyzePhoto(file: File) {
    setAnalyzingPhoto(true)
    setErrorMsg(null)
    setHazardResults(null)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const [header, base64] = dataUrl.split(",")
      const mediaType = header.match(/data:(.*);base64/)?.[1] ?? file.type

      const res = await fetch("/api/solly/analyze-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(bypassKey ? { "x-solly-bypass": bypassKey } : {}),
        },
        body: JSON.stringify({ conversationId, imageBase64: base64, mediaType, email: email || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.rateLimited) setShowBuyCredits(true)
        throw new Error(data.error ?? "Could not analyse photo.")
      }

      setConversationId(data.conversationId)
      setMessages((m) => [
        ...m,
        { role: "user", content: "[Uploaded a worksite photo for hazard analysis]" },
        { role: "assistant", content: data.reply },
      ])
      setHazardResults(data.hazards ?? [])
      if (data.recommendedCodes?.length > 0 || data.recommendedPackages?.length > 0) {
        setRecommendedCodes(data.recommendedCodes ?? [])
        setRecommendedForms(data.recommendedForms ?? [])
        setSelectedCodes(new Set(data.recommendedCodes ?? []))
        setRecommendedPackages(data.recommendedPackages ?? [])
        setPhase("recommended")
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not analyse photo.")
    } finally {
      setAnalyzingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function uploadLogo(file: File) {
    if (!conversationId) {
      setErrorMsg("Start chatting with Solly first, then upload your logo.")
      return
    }
    setUploadingLogo(true)
    setErrorMsg(null)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const [header, base64] = dataUrl.split(",")
      const mediaType = header.match(/data:(.*);base64/)?.[1] ?? file.type

      const res = await fetch("/api/solly/upload-logo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(bypassKey ? { "x-solly-bypass": bypassKey } : {}),
        },
        body: JSON.stringify({ conversationId, imageBase64: base64, mediaType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not upload logo.")
      setLogoUrl(data.logoUrl)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not upload logo.")
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ""
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || busy) return
    setInput("")
    setErrorMsg(null)
    setMessages((m) => [...m, { role: "user", content: text }])
    setBusy(true)

    try {
      const res = await fetch("/api/solly/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(bypassKey ? { "x-solly-bypass": bypassKey } : {}),
        },
        body: JSON.stringify({ conversationId, message: text, clientEmail: email || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Solly couldn't respond.")

      setConversationId(data.conversationId)
      setMessages((m) => [...m, { role: "assistant", content: data.reply }])

      if (data.type === "recommendation") {
        setRecommendedCodes(data.recommendedCodes ?? [])
        setRecommendedForms(data.recommendedForms ?? [])
        setSelectedCodes(new Set(data.recommendedCodes ?? []))
        setRecommendedPackages(data.recommendedPackages ?? [])
        setPhase("recommended")
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setBusy(false)
    }
  }

  function toggleCode(code: string) {
    setSelectedCodes((prev) => {
      const next = new Set(prev)
      next.has(code) ? next.delete(code) : next.add(code)
      return next
    })
  }

  async function confirmAndDraft() {
    if (!conversationId || selectedCodes.size === 0) return
    setBusy(true)
    setErrorMsg(null)
    try {
      const confirmRes = await fetch("/api/solly/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, confirmedCodes: Array.from(selectedCodes) }),
      })
      const confirmData = await confirmRes.json()
      if (!confirmRes.ok) throw new Error(confirmData.error ?? "Could not confirm templates.")

      setPhase("drafting")

      const draftRes = await fetch("/api/solly/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(bypassKey ? { "x-solly-bypass": bypassKey } : {}),
        },
        body: JSON.stringify({ conversationId, email: email || undefined }),
      })
      const draftData = await draftRes.json()
      if (!draftRes.ok) {
        if (draftData.rateLimited) setShowBuyCredits(true)
        throw new Error(draftData.error ?? "Solly could not complete the draft.")
      }

      setDrafts(draftData.drafts ?? [])
      setActiveDraftCode(draftData.drafts?.[0]?.formCode ?? null)
      setPhase("ready_for_purchase")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
      setPhase("recommended")
    } finally {
      setBusy(false)
    }
  }

  async function finalize() {
    if (!conversationId) return
    if (!email) {
      setErrorMsg("Enter your email so Solly can check your access first.")
      return
    }
    setBusy(true)
    setErrorMsg(null)
    setBundleUpsell(null)
    try {
      const res = await fetch("/api/solly/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not finalize documents.")

      if (data.unlocked) {
        setUnlockedDocs(data.documents ?? [])
        setPhase("unlocked")
      } else if (data.requiresBundle) {
        setBundleUpsell(data.message ?? "These templates are only available with the full SolumWHS package.")
      } else if (data.checkoutUrl) {
        if (data.bundleUpsellMessage) setBundleUpsell(data.bundleUpsellMessage)
        setPhase("checkout")
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setBusy(false)
    }
  }

  async function buyCredits() {
    if (!email) {
      setErrorMsg("Enter your email above so we know whose account to credit.")
      return
    }
    setBuyingCredits(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/solly/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout.")
      window.location.href = data.checkoutUrl
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setBuyingCredits(false)
    }
  }

  const activeDraft = drafts.find((d) => d.formCode === activeDraftCode)

  function goBack() {
    setErrorMsg(null)
    if (phase === "recommended") {
      setPhase("intake")
      setRecommendedCodes([])
      setRecommendedForms([])
      setRecommendedPackages([])
      setSelectedCodes(new Set())
      setHazardResults(null)
    } else if (phase === "ready_for_purchase" || phase === "checkout") {
      setPhase("recommended")
      setDrafts([])
      setActiveDraftCode(null)
      setBundleUpsell(null)
    }
  }

  return (
    <div className="mx-auto flex h-[720px] max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E4DFD3] bg-[#F6F4EF] shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E4DFD3] bg-[#16294D] px-5 py-4">
        {(phase === "recommended" || phase === "ready_for_purchase" || phase === "checkout") && (
          <button
            onClick={goBack}
            aria-label="Go back"
            title="Go back"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
          <Image src="/solly-icon.svg" alt="Solly" fill sizes="36px" />
          {phase === "drafting" && (
            <span
              className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C9743F] ring-2 ring-[#16294D]"
              title="Solly is drafting"
              aria-label="Solly is drafting"
            >
              <Loader2 className="h-2.5 w-2.5 animate-spin text-white" />
            </span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight text-white">Solly</p>
          <p className="text-xs leading-tight text-[#8FB4BC]">WHS Agent · Solum Safety Consulting</p>
        </div>
        <StatusStamp phase={phase} />
      </div>

      <p className="border-b border-[#E4DFD3] bg-white px-5 py-2 text-center text-[11px] leading-snug text-[#9CA3AF]">
        Solly is an AI assistant. Documents are drafted based on your responses and should be reviewed before use.
        They do not constitute legal advice.
      </p>

      {/* Message list */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}

        {phase === "recommended" && (
          <RecommendationCard
            codes={recommendedCodes}
            forms={recommendedForms}
            packages={recommendedPackages}
            selected={selectedCodes}
            onToggle={toggleCode}
            onConfirm={confirmAndDraft}
            busy={busy}
            logoUrl={logoUrl}
            uploadingLogo={uploadingLogo}
            onLogoButtonClick={() => logoInputRef.current?.click()}
          />
        )}

        {phase === "drafting" && (
          <div className="flex items-center gap-2 text-sm text-[#5A6472]">
            <Loader2 className="h-4 w-4 animate-spin text-[#18707F]" />
            Solly is drafting your document{recommendedCodes.length > 1 ? "s" : ""}…
          </div>
        )}

        {(phase === "ready_for_purchase" || phase === "checkout") && drafts.length > 0 && (
          <DraftPreviewPanel
            drafts={drafts}
            activeCode={activeDraftCode}
            onSelect={setActiveDraftCode}
            email={email}
            onEmailChange={setEmail}
            onFinalize={finalize}
            busy={busy}
            bundleUpsell={bundleUpsell}
          />
        )}

        {phase === "unlocked" && <UnlockedPanel docs={unlockedDocs} />}

        {analyzingPhoto && (
          <div className="flex items-center gap-2 text-sm text-[#5A6472]">
            <Loader2 className="h-4 w-4 animate-spin text-[#18707F]" />
            Solly is checking the photo for hazards…
          </div>
        )}

        {hazardResults && hazardResults.length > 0 && (
          <div className="rounded-xl border border-[#E4DFD3] bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B4451E]">
              <AlertTriangle className="h-3.5 w-3.5" />
              Hazards spotted
            </div>
            <div className="space-y-2">
              {hazardResults.map((h, i) => {
                const tone =
                  h.severity === "high"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : h.severity === "medium"
                      ? "border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#8A6D2B]"
                      : "border-[#E4DFD3] bg-[#FAFAF7] text-[#5A6472]"
                return (
                  <div key={i} className={`rounded-lg border px-3 py-2 text-sm ${tone}`}>
                    <span className="mr-2 rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {h.severity}
                    </span>
                    {h.description}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {errorMsg && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
        )}

        {showBuyCredits && (
          <div className="rounded-xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 p-4">
            <p className="text-sm font-semibold text-[#16294D]">Reached the free draft limit for now</p>
            <p className="mt-1 text-sm text-[#5A6472]">
              You can wait for the limit to reset, or get 10 extra drafts for $10.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com.au"
                className="flex-1 rounded-full border border-[#E4DFD3] px-4 py-2 text-sm outline-none focus:border-[#18707F] focus:ring-2 focus:ring-[#18707F]/20"
              />
              <button
                onClick={buyCredits}
                disabled={buyingCredits || !email}
                className="rounded-full bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#16294D] transition hover:brightness-95 disabled:opacity-40"
              >
                {buyingCredits ? "Starting checkout…" : "Get 10 more drafts — $10"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {(phase === "intake" || phase === "recommended") && (
        <div className="flex items-center gap-2 border-t border-[#E4DFD3] bg-white px-4 py-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) analyzePhoto(file)
            }}
          />
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadLogo(file)
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={busy || analyzingPhoto}
            aria-label="Upload a site photo for hazard analysis"
            title="Upload a site photo for hazard analysis"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E4DFD3] text-[#5A6472] transition hover:border-[#18707F] hover:text-[#18707F] disabled:opacity-40"
          >
            <Camera className="h-4 w-4" />
          </button>
          {voiceSupported && (
            <button
              onClick={toggleVoiceInput}
              disabled={busy}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              title={isListening ? "Stop voice input" : "Speak instead of typing"}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition disabled:opacity-40 ${
                isListening
                  ? "border-[#B4451E] bg-[#B4451E]/10 text-[#B4451E]"
                  : "border-[#E4DFD3] text-[#5A6472] hover:border-[#18707F] hover:text-[#18707F]"
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={isListening ? "Listening…" : "Tell Solly about your site, industry, or the form you need…"}
            disabled={busy}
            className="flex-1 rounded-full border border-[#E4DFD3] bg-[#F6F4EF] px-4 py-2 text-sm text-[#22262B] outline-none placeholder:text-[#9CA3AF] focus:border-[#18707F] focus:ring-2 focus:ring-[#18707F]/20"
          />
          <button
            onClick={sendMessage}
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#16294D] text-white transition hover:bg-[#18707F] disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-[#16294D] text-white"
            : "rounded-bl-sm border border-[#E4DFD3] bg-white text-[#22262B]"
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

function StatusStamp({ phase }: { phase: Phase }) {
  const isDrafting = phase === "drafting"
  const tone = isDrafting
    ? "border-[#C9743F] text-[#C9743F] bg-[#C9743F]/10"
    : phase === "unlocked"
      ? "border-[#C9A84C] text-[#C9A84C]"
      : phase === "ready_for_purchase" || phase === "checkout"
        ? "border-[#8FB4BC] text-[#8FB4BC]"
        : "border-white/30 text-white/70"
  return (
    <span
      className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider sm:inline-flex ${tone}`}
    >
      {isDrafting && <Loader2 className="h-3 w-3 animate-spin" />}
      {STAMP_LABEL[phase]}
    </span>
  )
}

function RecommendationCard({
  codes,
  forms,
  packages,
  selected,
  onToggle,
  onConfirm,
  busy,
  logoUrl,
  uploadingLogo,
  onLogoButtonClick,
}: {
  codes: string[]
  forms: { code: string; title: string }[]
  packages: { code: string; name: string }[]
  selected: Set<string>
  onToggle: (code: string) => void
  onConfirm: () => void
  busy: boolean
  logoUrl: string | null
  uploadingLogo: boolean
  onLogoButtonClick: () => void
}) {
  const titleFor = (code: string) => forms.find((f) => f.code === code)?.title ?? code
  return (
    <div className="space-y-3">
      {codes.length > 0 && (
        <div className="rounded-xl border border-[#E4DFD3] bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#18707F]">
            <FileCheck2 className="h-3.5 w-3.5" />
            Solly can draft these with you
          </div>
          <div className="space-y-2">
            {codes.map((code) => (
              <label
                key={code}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#E4DFD3] px-3 py-2.5 text-sm transition hover:border-[#18707F]"
              >
                <input
                  type="checkbox"
                  checked={selected.has(code)}
                  onChange={() => onToggle(code)}
                  className="h-4 w-4 shrink-0 accent-[#18707F]"
                />
                <span className="text-[#22262B]">{titleFor(code)}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-dashed border-[#E4DFD3] bg-[#FAFAF7] px-3 py-2.5">
            <div className="text-xs text-[#5A6472]">
              {logoUrl ? "✓ Logo added — it'll be included in your document" : "Have a company logo? Add it to your document."}
            </div>
            <button
              onClick={onLogoButtonClick}
              disabled={uploadingLogo}
              className="shrink-0 rounded-full border border-[#E4DFD3] px-3 py-1.5 text-xs font-semibold text-[#5A6472] transition hover:border-[#18707F] hover:text-[#18707F] disabled:opacity-40"
            >
              {uploadingLogo ? "Uploading…" : logoUrl ? "Replace logo" : "Upload logo"}
            </button>
          </div>

          <button
            onClick={onConfirm}
            disabled={busy || selected.size === 0}
            className="mt-4 w-full rounded-full bg-[#16294D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18707F] disabled:opacity-40"
          >
            {busy ? "Confirming…" : `Draft ${selected.size} template${selected.size === 1 ? "" : "s"} with Solly`}
          </button>
        </div>
      )}

      {packages.length > 0 && (
        <div className="rounded-xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8A6D2B]">
            <ShoppingBag className="h-3.5 w-3.5" />
            Purchase directly
          </div>
          <div className="space-y-2">
            {packages.map((p) => (
              <div
                key={p.code}
                className="flex items-center justify-between rounded-lg border border-[#C9A84C]/30 bg-white px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-[#16294D]">{p.name}</p>
                  <p className="font-mono text-[11px] text-[#5A6472]">{p.code}</p>
                </div>
                <a
                  href="https://www.solumsafetyconsulting.com.au/templates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#C9A84C] px-3 py-1.5 text-xs font-semibold text-[#16294D] transition hover:brightness-95"
                >
                  View & buy
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DraftPreviewPanel({
  drafts,
  activeCode,
  onSelect,
  email,
  onEmailChange,
  onFinalize,
  busy,
  bundleUpsell,
}: {
  drafts: DraftResult[]
  activeCode: string | null
  onSelect: (code: string) => void
  email: string
  onEmailChange: (v: string) => void
  onFinalize: () => void
  busy: boolean
  bundleUpsell: string | null
}) {
  const active = drafts.find((d) => d.formCode === activeCode) ?? drafts[0]

  return (
    <div className="rounded-xl border border-[#E4DFD3] bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5A6472]">
        <Lock className="h-3.5 w-3.5" />
        Draft preview — locked until purchased
      </div>

      {drafts.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {drafts.map((d) => (
            <button
              key={d.formCode}
              onClick={() => onSelect(d.formCode)}
              className={`rounded-full border px-2.5 py-1 font-mono text-[11px] transition ${
                d.formCode === active?.formCode
                  ? "border-[#16294D] bg-[#16294D] text-white"
                  : "border-[#E4DFD3] text-[#5A6472] hover:border-[#18707F]"
              }`}
            >
              {d.formCode}
            </button>
          ))}
        </div>
      )}

      <div className="relative max-h-72 overflow-y-auto rounded-lg border border-[#E4DFD3] bg-[#FAFAF7] p-3">
        <div
          className="prose prose-sm max-w-none [&_*]:!text-[13px]"
          dangerouslySetInnerHTML={{ __html: active?.previewHtml ?? "" }}
        />
      </div>

      {bundleUpsell && (
        <p className="mt-3 rounded-lg border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-3 py-2 text-xs text-[#8A6D2B]">
          {bundleUpsell}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@company.com.au"
          className="flex-1 rounded-full border border-[#E4DFD3] px-4 py-2.5 text-sm outline-none focus:border-[#18707F] focus:ring-2 focus:ring-[#18707F]/20"
        />
        <button
          onClick={onFinalize}
          disabled={busy || !email}
          className="flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-5 py-2.5 text-sm font-semibold text-[#16294D] transition hover:brightness-95 disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Unlock final document{drafts.length > 1 ? "s" : ""}
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-[#9CA3AF]">
        Already own the SolumWHS package? Enter the same email — it unlocks free, automatically.
      </p>
    </div>
  )
}

function UnlockedPanel({ docs }: { docs: UnlockedDoc[] }) {
  return (
    <div className="rounded-xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8A6D2B]">
        <Unlock className="h-3.5 w-3.5" />
        Unlocked
      </div>
      <div className="space-y-2">
        {docs.map((d) => (
          <div
            key={d.sessionId}
            className="flex items-center justify-between rounded-lg border border-[#C9A84C]/30 bg-white px-3 py-2.5 text-sm"
          >
            <span className="font-mono text-xs text-[#5A6472]">{d.formCode}</span>
            <div className="flex items-center gap-2">
              <a
                href={`/api/solly/document/${d.sessionId}/docx`}
                className="rounded-full border border-[#16294D]/30 px-3 py-1.5 text-xs font-semibold text-[#16294D] transition hover:border-[#16294D] hover:bg-[#16294D]/5"
              >
                Word
              </a>
              <a
                href={`/api/solly/document/${d.sessionId}`}
                className="rounded-full bg-[#16294D] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#18707F]"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/*
DESIGN NOTES
------------
Palette pulled directly from the live Solly icon (navy #16294D / teal #18707F
/ gold #C9A84C on warm cream #F6F4EF) rather than introducing a new one —
this widget needs to feel like part of the existing brand, not a bolted-on
AI feature.

Signature element: the status "stamp" (top-right pill: GATHERING DETAILS /
DRAFTING / DRAFT — LOCKED / UNLOCKED) and the lock/unlock iconography on the
draft panel are drawn from the WHS domain itself — compliance documents get
stamped, signed off, and version-controlled. That's a more honest signature
for this subject than a generic chat-bubble treatment, and it does real
work: at a glance the client knows exactly what state their document is in.

Restraint: no gradients, no page-load animation, one spinner (Loader2) used
sparingly for actual async waits. The watermark itself (applied server-side
in the draft route) already does visual work signalling "not final" — the
UI doesn't need to compete with it.
*/
