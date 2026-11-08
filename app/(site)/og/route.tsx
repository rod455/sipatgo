import { renderOgImage } from "@/components/site/og";

/** Imagem OG por página: /og?title=...&eyebrow=... (usada pelo pageMetadata). */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "SIPAT online gamificada em 5 dias").slice(0, 110);
  const eyebrow = (searchParams.get("eyebrow") || "sipatgo.com.br").slice(0, 60);
  const res = renderOgImage({ title, eyebrow });
  res.headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
  return res;
}
