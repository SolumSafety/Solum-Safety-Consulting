import type Stripe from "stripe"

// Stripe metadata allows up to 50 keys, each value max 500 chars. We carry the
// list of purchased product codes across chunked keys so a large cart still
// round-trips safely from checkout to the download page.
const CHUNK_PREFIX = "codes_"
const MAX_VALUE_LEN = 480

export function encodeCodesToMetadata(codes: string[]): Record<string, string> {
  const joined = codes.join(",")
  const chunks: string[] = []
  let current = ""
  for (const code of codes) {
    const next = current ? `${current},${code}` : code
    if (next.length > MAX_VALUE_LEN) {
      if (current) chunks.push(current)
      current = code
    } else {
      current = next
    }
  }
  if (current) chunks.push(current)

  const meta: Record<string, string> = {}
  chunks.forEach((chunk, idx) => {
    meta[`${CHUNK_PREFIX}${idx}`] = chunk
  })
  // Keep a single-code field too for backward-compatible tooling.
  if (codes.length === 1) meta.productCode = codes[0]
  void joined
  return meta
}

export function decodeCodesFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
): string[] {
  if (!metadata) return []
  const chunkKeys = Object.keys(metadata)
    .filter((k) => k.startsWith(CHUNK_PREFIX))
    .sort((a, b) => {
      const ai = Number.parseInt(a.slice(CHUNK_PREFIX.length), 10)
      const bi = Number.parseInt(b.slice(CHUNK_PREFIX.length), 10)
      return ai - bi
    })

  const codes: string[] = []
  if (chunkKeys.length > 0) {
    for (const key of chunkKeys) {
      const value = metadata[key]
      if (value) codes.push(...value.split(",").filter(Boolean))
    }
  } else if (metadata.productCode) {
    // Legacy single-product sessions.
    codes.push(metadata.productCode)
  }

  // De-dupe while preserving order.
  return [...new Set(codes)]
}
