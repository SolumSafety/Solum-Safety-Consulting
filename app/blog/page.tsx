import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const metadata = {
  title: "WHS Resources & Guides | Solum Safety Consulting",
  description:
    "Practical work health and safety guides, templates advice, and compliance tips for Australian businesses.",
}

export const revalidate = 3600

export default async function BlogIndexPage() {
  const supabaseAdmin = getSupabaseAdmin()
  const { data: posts } = supabaseAdmin
    ? await supabaseAdmin
        .from("blog_posts")
        .select("slug, title, meta_description, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
    : { data: [] }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <section className="flex-1 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Resources</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl">WHS Guides & Insights</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Practical work health and safety guidance for Australian businesses.
          </p>

          <div className="mt-10 space-y-6">
            {(!posts || posts.length === 0) && (
              <p className="text-sm text-muted-foreground">No articles published yet — check back soon.</p>
            )}
            {posts?.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <h2 className="font-heading text-xl font-bold text-foreground">{post.title}</h2>
                {post.meta_description && (
                  <p className="mt-2 leading-relaxed text-muted-foreground">{post.meta_description}</p>
                )}
                {post.published_at && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {new Date(post.published_at).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
