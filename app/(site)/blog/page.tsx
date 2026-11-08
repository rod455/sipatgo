import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { pageMetadata } from "@/components/site/seo";
import { BLOG_CATEGORIES, formatDate, POSTS } from "@/content/site/blog";

export const metadata: Metadata = pageMetadata({
  title: "Blog SipatGo — SIPAT, engajamento e NR-5",
  description: "Artigos práticos para quem organiza SIPAT: temas, frases, engajamento do chão de fábrica, SIPAT online e comprovação para a NR-5.",
  path: "/blog",
  keywords: ["blog sipat", "dicas sipat", "segurança do trabalho blog"],
});

export default function BlogPage() {
  const byCategory = BLOG_CATEGORIES.map((cat) => ({ cat, posts: POSTS.filter((p) => p.category === cat) }));
  return (
    <>
      <PageHero
        crumbs={[{ name: "Blog", path: "/blog" }]}
        eyebrow="Blog"
        title="Conteúdo para quem faz a SIPAT acontecer"
        lead="Ideias práticas, sem jargão, para CIPA, SESMT e RH."
      />

      <Section tone="sand">
        <nav aria-label="Categorias" className="flex flex-wrap gap-2">
          {byCategory.map(({ cat, posts }) => (
            <a
              key={cat}
              href={`#cat-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-sg-navy-900 shadow-sm ring-1 ring-sg-navy-900/5 hover:ring-sg-orange-500/50"
            >
              {cat} <span className="text-sg-gray-600">({posts.length})</span>
            </a>
          ))}
        </nav>

        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {POSTS.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sg-navy-900/5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="w-fit rounded-full bg-sg-sand-100 px-3 py-1 text-xs font-bold text-sg-navy-900">{p.category}</span>
                <h2 className="mt-4 font-display text-xl font-bold text-sg-navy-900 group-hover:underline">{p.title}</h2>
                <p className="mt-2 flex-1 text-base text-sg-gray-600">{p.excerpt}</p>
                <p className="mt-4 flex items-center gap-3 text-sm text-sg-gray-600">
                  <time dateTime={p.datePublished}>{formatDate(p.datePublished)}</time>
                  <span className="inline-flex items-center gap-1">
                    <Clock aria-hidden className="size-4" /> {p.readingMinutes} min
                  </span>
                  <ArrowRight aria-hidden className="ml-auto size-5 text-sg-navy-500" />
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-14 space-y-10">
          {byCategory.map(({ cat, posts }) => (
            <section key={cat} id={`cat-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="scroll-mt-24" aria-labelledby={`h-cat-${cat}`}>
              <h2 id={`h-cat-${cat}`} className="font-display text-2xl font-extrabold text-sg-navy-900">
                {cat}
              </h2>
              {posts.length ? (
                <ul className="mt-3 space-y-2">
                  {posts.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}`} className="font-medium text-sg-navy-500 underline-offset-4 hover:underline">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sg-gray-600">
                  Em breve. {cat === "Cases" ? "Os primeiros cases reais serão publicados com autorização dos clientes." : ""}
                </p>
              )}
            </section>
          ))}
        </div>
      </Section>

      <FinalCta origem="blog" />
    </>
  );
}
