import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { Container } from "@/components/site/Section";
import { articleJsonLd, pageMetadata } from "@/components/site/seo";
import { formatDate, getPost, POSTS } from "@/content/site/blog";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
    type: "article",
    publishedTime: post.datePublished,
    modifiedTime: post.dateModified,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.description,
          path: `/blog/${post.slug}`,
          datePublished: post.datePublished,
          dateModified: post.dateModified,
          author: post.author,
          section: post.category,
        })}
      />
      <PageHero
        crumbs={[
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
        eyebrow={post.category}
        title={post.title}
        lead={post.excerpt}
      />
      <section className="bg-white py-12 md:py-16">
        <Container>
          <article className="mx-auto max-w-3xl">
            <p className="mb-8 flex flex-wrap items-center gap-3 text-sm text-sg-gray-600">
              <span>{post.author}</span>
              <span aria-hidden>·</span>
              <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock aria-hidden className="size-4" /> {post.readingMinutes} min de leitura
              </span>
            </p>
            <Prose blocks={post.blocks} />
          </article>

          {related.length ? (
            <aside className="mx-auto mt-16 max-w-3xl border-t border-sg-navy-900/10 pt-10" aria-labelledby="h-relacionados">
              <h2 id="h-relacionados" className="font-display text-xl font-bold text-sg-navy-900">
                Leia também
              </h2>
              <ul className="mt-4 space-y-3">
                {related.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="font-medium text-sg-navy-500 underline-offset-4 hover:underline">
                      {p.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/sipat" className="font-medium text-sg-navy-500 underline-offset-4 hover:underline">
                    Guia completo: o que é SIPAT e como organizar
                  </Link>
                </li>
              </ul>
            </aside>
          ) : null}
        </Container>
      </section>
      <FinalCta origem={`blog-${post.slug}`} />
    </>
  );
}
