import "server-only"
import Anthropic from "@anthropic-ai/sdk"

if (!process.env.ANTHROPIC_API_KEY) {
  console.log("[solly] ANTHROPIC_API_KEY is not set — Solly will not be able to respond until configured.")
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
})

export const SOLLY_MODEL = "claude-sonnet-4-6"
