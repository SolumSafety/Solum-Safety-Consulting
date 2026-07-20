import { type NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"

import { stripe } from "@/lib/stripe"
import { getProduct } from "@/lib/products"
import { decodeCodesFromMetadata } from "@/lib/checkout"
import { grantSollyEntitlementIfPurchased } from "@/lib/solly-entitlement"

// Downloads remain available for 7 days after purchase.
const DOWNLOAD_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")
  const file = request.nextUrl.searchParams.get("file")

  if (!sessionId || !file) {
    return NextResponse.json({ error: "Missing session or file." }, { status: 400 })
  }

  try {
    let session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch {
      // An unknown/invalid session id is an access failure, not a server error.
      return NextResponse.json({ error: "Invalid or unknown purchase session." }, { status: 403 })
    }

    // Only a genuinely paid session unlocks the files.
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not verified." }, { status: 403 })
    }

    // Enforce the download window.
    const createdMs = (session.created ?? 0) * 1000
    if (createdMs && Date.now() - createdMs > DOWNLOAD_WINDOW_MS) {
      return NextResponse.json(
        { error: "This download link has expired. Please contact us to re-issue it." },
        { status: 410 },
      )
    }

    const codes = decodeCodesFromMetadata(session.metadata)
    if (codes.length === 0) {
      return NextResponse.json({ error: "Purchase could not be matched to a product." }, { status: 404 })
    }

    // If this purchase included the SolumWHS package, grant the buyer
    // access to Solly (the AI WHS Agent) in the assessment platform.
    // Fully non-blocking for the download itself — the buyer has paid and is
    // owed their files, so a failure here must never surface as an error.
    try {
      await grantSollyEntitlementIfPurchased({
        codes,
        email: session.customer_details?.email ?? session.customer_email ?? null,
        stripeSessionId: session.id,
        stripePaymentIntent:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
      })
    } catch (grantError) {
      console.log(
        "[v0] Solly entitlement grant threw (download continues):",
        grantError instanceof Error ? grantError.message : String(grantError),
      )
    }

    // The requested file MUST belong to one of the purchased products.
    const unlockedFiles = new Set(codes.flatMap((c) => getProduct(c)?.files ?? []))
    if (!unlockedFiles.has(file)) {
      return NextResponse.json({ error: "File is not part of this purchase." }, { status: 403 })
    }

    const result = await get(file, { access: "private" })
    if (!result) {
      return NextResponse.json({ error: "File not found." }, { status: 404 })
    }

    const filename = file.split("/").pop() || "download"
    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (err) {
    console.log("[v0] Download error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Could not process download." }, { status: 500 })
  }
}
