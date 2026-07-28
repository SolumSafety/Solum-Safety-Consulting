import { notFound } from "next/navigation"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
export const revalidate = 3600
async function getPost(slug: string) {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return null
  const { data } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()
  return data
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Article not found | Solum Safety Consulting" }
  const url = `https://www.solumsafetyconsulting.com.au/blog/${slug}`
  return {
    title: `${post.title} | Solum Safety Consulting`,
    description: post.meta_description ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.meta_description ?? undefined,
      url,
      type: "article",
    },
  }
}
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <article className="flex-1 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="text-sm font-medium text-[#18707F] underline underline-offset-4">
            ← Back to guides
          </Link>
          <h1 className="mt-4 font-heading text-3xl font-bold text-[#16294D] md:text-4xl">{post.title}</h1>
          {post.published_at && (
            <p className="mt-3 text-sm font-medium text-[#8B95A7]">
              {new Date(post.published_at).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          <div
            className="prose prose-lg mt-8 max-w-none
              prose-headings:font-heading prose-headings:font-bold prose-headings:text-[#16294D]
              prose-h2:mt-12 prose-h2:border-l-4 prose-h2:border-[#18707F] prose-h2:pl-4 prose-h2:text-2xl prose-h2:leading-tight
              prose-h3:mt-8 prose-h3:text-[#18707F] prose-h3:text-lg
              prose-p:leading-relaxed prose-p:text-[#3C4759]
              prose-a:text-[#18707F] prose-a:font-medium prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[#16294D] prose-strong:font-semibold
              prose-li:text-[#3C4759] prose-li:leading-relaxed
              prose-ul:my-5 prose-li:my-1.5
              marker:text-[#C9A84C]
              prose-blockquote:border-l-4 prose-blockquote:border-[#C9A84C] prose-blockquote:bg-[#FFF8EC] prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-[#3C4759] prose-blockquote:rounded-r-lg
              first:prose-p:text-lg first:prose-p:text-[#16294D] first:prose-p:font-medium"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />
          <div className="mt-12 rounded-2xl border border-[#B4D9DE] bg-[#EAF4F5] p-6">
            <p className="font-heading text-lg font-bold text-[#16294D]">Need this sorted properly?</p>
            <p className="mt-2 leading-relaxed text-[#3C4759]">
              Solum Safety Consulting has ready-to-use WHS templates, and Solly — our AI WHS Agent — can help you
              draft one in minutes.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/templates"
                className="rounded-lg bg-[#16294D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16294D]/90"
              >
                Browse templates
              </Link>
              <Link
                href="/solly"
                className="rounded-lg border border-[#16294D] px-5 py-2.5 text-sm font-semibold text-[#16294D] transition-colors hover:bg-[#16294D] hover:text-white"
              >
                Talk to Solly
              </Link>
            </div>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  )
}
