import type { MetadataRoute } from "next"

const baseUrl = "https://www.solumsafetyconsulting.com.au"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Post-purchase and internal utility routes shouldn't be indexed.
      disallow: ["/download", "/assessment-access"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
