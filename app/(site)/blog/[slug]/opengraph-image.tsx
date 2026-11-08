import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/components/site/og";
import { getPost, POSTS } from "@/content/site/blog";

export const alt = "Artigo do blog SipatGo";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

// Next 15 entrega params como objeto; Next 16, como Promise. `await` funciona nos dois casos.
export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const { slug } = await params;
  const post = getPost(slug);
  return renderOgImage({ title: post?.title ?? "Blog SipatGo", eyebrow: post ? `Blog · ${post.category}` : "Blog" });
}
