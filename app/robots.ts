import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/content/site/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app", "/admin", "/super", "/api", "/c/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
