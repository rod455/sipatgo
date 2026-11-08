/** Extrai o ID de um link/ID do YouTube. */
export function parseYoutubeId(input: string): string | null {
  const s = (input ?? "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.endsWith("youtu.be")) return u.pathname.slice(1, 12) || null;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v.slice(0, 11);
      const m = /\/(embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/.exec(u.pathname);
      if (m) return m[2];
    }
  } catch {
    /* não é URL */
  }
  return null;
}

/** ISO 8601 (PT1M30S) → segundos */
export function parseIsoDuration(iso: string): number {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return 0;
  return Number(m[1] || 0) * 86400 + Number(m[2] || 0) * 3600 + Number(m[3] || 0) * 60 + Number(m[4] || 0);
}

export async function fetchYoutubeMeta(id: string): Promise<{ title: string | null; duration_s: number | null }> {
  let title: string | null = null;
  let duration_s: number | null = null;
  try {
    const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`, { cache: "no-store" });
    if (r.ok) title = (await r.json()).title ?? null;
  } catch { /* offline */ }
  const key = process.env.YOUTUBE_API_KEY;
  if (key) {
    try {
      const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${key}`, { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        const iso = j.items?.[0]?.contentDetails?.duration;
        if (iso) duration_s = parseIsoDuration(iso);
      }
    } catch { /* sem API */ }
  }
  return { title, duration_s };
}
