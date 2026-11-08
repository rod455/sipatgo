import type { MetadataRoute } from "next";
import { CASES } from "@/content/site/cases";
import { POSTS } from "@/content/site/blog";
import { absoluteUrl } from "@/content/site/site";

const LAST_UPDATE = new Date("2026-11-08T12:00:00Z");

const STATIC: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, freq: "weekly" },
  { path: "/como-funciona", priority: 0.9, freq: "monthly" },
  { path: "/funcionalidades", priority: 0.9, freq: "monthly" },
  { path: "/para-quem", priority: 0.8, freq: "monthly" },
  { path: "/precos", priority: 0.9, freq: "monthly" },
  { path: "/demo", priority: 0.8, freq: "monthly" },
  { path: "/contato", priority: 0.8, freq: "yearly" },
  { path: "/sipat", priority: 0.9, freq: "monthly" },
  { path: "/sipat/temas", priority: 0.8, freq: "monthly" },
  { path: "/sipat/dinamicas", priority: 0.8, freq: "monthly" },
  { path: "/sipat/cronograma", priority: 0.8, freq: "monthly" },
  { path: "/sipat/nr-5", priority: 0.8, freq: "monthly" },
  { path: "/cases", priority: 0.6, freq: "monthly" },
  { path: "/blog", priority: 0.7, freq: "weekly" },
  { path: "/materiais", priority: 0.6, freq: "monthly" },
  { path: "/sobre", priority: 0.5, freq: "yearly" },
  { path: "/privacidade", priority: 0.2, freq: "yearly" },
  { path: "/termos", priority: 0.2, freq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC.map((s) => ({ url: absoluteUrl(s.path), lastModified: LAST_UPDATE, changeFrequency: s.freq, priority: s.priority })),
    ...POSTS.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: new Date(`${p.dateModified ?? p.datePublished}T12:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // Cases ilustrativos ficam fora do sitemap (noindex).
    ...CASES.filter((c) => !c.illustrative).map((c) => ({
      url: absoluteUrl(`/cases/${c.slug}`),
      lastModified: LAST_UPDATE,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
