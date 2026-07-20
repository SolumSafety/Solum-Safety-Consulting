import { cookies } from "next/headers"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { BlogAdminPanel } from "./blog-admin-panel"

export const metadata = { title: "Blog Admin | Solum Safety Consulting" }
export const dynamic = "force-dynamic"

export default async function BlogAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const cookieStore = await cookies()
  const key = cookieStore.get("solly_admin_key")?.value
  const expected = process.env.ADMIN_REVIEW_KEY
  const authed = !!expected && key === expected

  if (!authed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#F6F4EF] px-4">
        <form
          action="/api/solly/admin-login"
          method="POST"
          className="w-full max-w-sm rounded-2xl border border-[#E4DFD3] bg-white p-8"
        >
          <h1 className="text-lg font-semibold text-[#16294D]">Blog Admin</h1>
          <p className="mt-1 text-sm text-[#5A6472]">Enter the access key to continue.</p>
          {error === "wrong_key" && <p className="mt-3 text-sm text-red-600">Incorrect key.</p>}
          <input
            type="password"
            name="key"
            placeholder="Access key"
            className="mt-4 w-full rounded-lg border border-[#E4DFD3] px-4 py-2.5 text-sm outline-none focus:border-[#18707F]"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-[#16294D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#18707F]"
          >
            Enter
          </button>
        </form>
      </main>
    )
  }

  const supabaseAdmin = getSupabaseAdmin()
  const { data: posts } = supabaseAdmin
    ? await supabaseAdmin.from("blog_posts").select("*").order("created_at", { ascending: false })
    : { data: [] }

  return (
    <main className="min-h-screen bg-[#F6F4EF] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-[#16294D]">Blog Admin</h1>
        <p className="mt-1 text-sm text-[#5A6472]">Generate SEO articles, review, and publish.</p>
        <BlogAdminPanel initialPosts={posts ?? []} bypassKey={key ?? ""} />
      </div>
    </main>
  )
}
