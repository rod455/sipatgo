import { permanentRedirect } from "next/navigation";

/** Endereço antigo (/c/empresa): mantém QR codes e links já divulgados funcionando. */
export default async function OldCompanyPath({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ next?: string }> }) {
  const { slug } = await params;
  const { next } = await searchParams;
  permanentRedirect(`/${encodeURIComponent(slug.toLowerCase())}${next ? `?next=${encodeURIComponent(next)}` : ""}`);
}
