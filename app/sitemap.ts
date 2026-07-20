import type { MetadataRoute } from "next"

const baseUrl = "https://www.solumsafetyconsulting.com.au"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] =
    [
      { path: "/", priority: 1, changeFrequency: "monthly" },
      { path: "/our-story", priority: 0.8, changeFrequency: "monthly" },
      { path: "/services", priority: 0.9, changeFrequency: "monthly" },
      { path: "/templates", priority: 0.9, changeFrequency: "weekly" },
      { path: "/reports", priority: 0.7, changeFrequency: "monthly" },
      { path: "/policies", priority: 0.3, changeFrequency: "yearly" },
    ]

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
