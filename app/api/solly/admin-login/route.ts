import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const key = formData.get("key")?.toString() ?? ""
  const redirectTo = formData.get("redirect")?.toString() || "/"
  const expected = process.env.ADMIN_REVIEW_KEY

  const origin = request.nextUrl.origin

  if (!expected) {
    return NextResponse.redirect(`${origin}${redirectTo}?error=not_configured`)
  }

  if (key !== expected) {
    return NextResponse.redirect(`${origin}${redirectTo}?error=wrong_key`)
  }

  const response = NextResponse.redirect(`${origin}${redirectTo}`)
  response.cookies.set("solly_admin_key", key, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12, // 12 hours
    path: "/",
  })
  return response
}
