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
          <Link href="/blog" className="text-sm font-medium text-primary underline underline-offset-4">
            ← Back to guides
          </Link>
          <h1 className="mt-4 font-heading text-3xl font-bold text-foreground md:text-4xl">{post.title}</h1>
          {post.published_at && (
            <p className="mt-3 text-sm text-muted-foreground">
              {new Date(post.published_at).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          <div
            className="prose prose-lg mt-8 max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground prose-p:leading-relaxed prose-p:text-muted-foreground prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />

          <div className="mt-12 rounded-2xl border border-border bg-card p-6">
            <p className="font-heading text-lg font-bold text-foreground">Need this sorted properly?</p>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Solum Safety Consulting has ready-to-use WHS templates, and Solly — our AI WHS Agent — can help you
              draft one in minutes.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/templates"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Browse templates
              </Link>
              <Link
                href="/solly"
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary"
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
