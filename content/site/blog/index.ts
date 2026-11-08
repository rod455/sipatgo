import { comoComprovarSipat } from "./como-comprovar-a-sipat-nr-5";
import { comoEngajarChaoDeFabrica } from "./como-engajar-o-chao-de-fabrica";
import { frasesParaSipat } from "./frases-para-sipat";
import { sipatOnlineFunciona } from "./sipat-online-funciona";
import type { BlogPost } from "./types";

export type { BlogPost, BlogCategory } from "./types";
export { BLOG_CATEGORIES } from "./types";

export const POSTS: BlogPost[] = [frasesParaSipat, comoEngajarChaoDeFabrica, sipatOnlineFunciona, comoComprovarSipat].sort(
  (a, b) => b.datePublished.localeCompare(a.datePublished),
);

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}
