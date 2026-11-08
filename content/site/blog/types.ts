import type { Block } from "../blocks";

export const BLOG_CATEGORIES = ["SIPAT", "Engajamento", "NR-5", "Cases"] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  keywords: string[];
  datePublished: string;
  dateModified?: string;
  readingMinutes: number;
  author: string;
  excerpt: string;
  blocks: Block[];
};
