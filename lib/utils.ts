import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function firstName(name: string): string {
  return (name ?? "").trim().split(/\s+/)[0] ?? "";
}

export function initials(name: string): string {
  const parts = (name ?? "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function pct(n: number, d: number): number {
  return d > 0 ? Math.round((1000 * n) / d) / 10 : 0;
}

export function appBaseUrl(): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return (process.env.APP_BASE_URL || (vercel ? `https://${vercel}` : "http://localhost:3000")).replace(/\/$/, "");
}

export function campaignUrl(slug: string): string {
  const root = process.env.ROOT_DOMAIN;
  const base = appBaseUrl();
  if (root && base.includes(root)) return `https://${slug}.${root}`;
  return `${base}/c/${slug}`;
}
