import type { MetadataRoute } from "next"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

const baseUrl = "https://www.solumsafetyconsulting.com.au"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] =
    [
      { path: "/", priority: 1, changeFrequency: "monthly" },
      { path: "/our-story", priority: 0.8, changeFrequency: "monthly" },
      { path: "/services", priority: 0.9, changeFrequency: "monthly" },
      { path: "/templates", priority: 0.9, changeFrequency: "weekly" },
      { path: "/reports", priority: 0.7, changeFrequency: "monthly" },
      { path: "/policies", priority: 0.3, changeFrequency: "yearly" },
      { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    ]

  const staticEntries = routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const supabaseAdmin = getSupabaseAdmin()
  const { data: posts } = supabaseAdmin
    ? await supabaseAdmin.from("blog_posts").select("slug, published_at").eq("status", "published")
    : { data: [] }

  const postEntries = (posts ?? []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticEntries, ...postEntries]
}
