/**
 * Ranking ao vivo: o servidor publica um "ping" num canal Broadcast do
 * Supabase Realtime e os clientes refazem a busca pela API do SipatGo.
 * Nenhum dado pessoal trafega pelo Realtime.
 */
export function rankingTopic(campaignId: string) {
  return `sipatgo-ranking-${campaignId}`;
}

export function adminTopic(campaignId: string) {
  return `sipatgo-admin-${campaignId}`;
}

export async function broadcast(topic: string, event = "refresh", payload: Record<string, unknown> = {}) {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY);
  if (!url || !key) return;
  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ topic, event, payload, private: false }] }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    /* polling cobre */
  }
}

export function pingScores(campaignId: string) {
  void broadcast(rankingTopic(campaignId));
  void broadcast(adminTopic(campaignId));
}
