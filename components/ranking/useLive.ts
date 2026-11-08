"use client";

import { useEffect, useRef } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
function supa() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

/** Chama `refresh` quando chega um ping do Realtime e, por segurança, a cada `pollMs`. */
export function useLive(topic: string, refresh: () => void, pollMs = 20000) {
  const ref = useRef(refresh);
  ref.current = refresh;
  useEffect(() => {
    let last = 0;
    const throttled = () => {
      const t = Date.now();
      if (t - last < 1500) return;
      last = t;
      ref.current();
    };
    const s = supa();
    const ch = s?.channel(topic).on("broadcast", { event: "refresh" }, throttled).subscribe();
    const poll = setInterval(() => { if (document.visibilityState === "visible") throttled(); }, pollMs);
    const vis = () => { if (document.visibilityState === "visible") throttled(); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(poll); document.removeEventListener("visibilitychange", vis); if (ch) void s?.removeChannel(ch); };
  }, [topic, pollMs]);
}
