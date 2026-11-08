"use client";

import { useRouter } from "next/navigation";
import { useLive } from "@/components/ranking/useLive";

/** Atualiza a página do servidor quando chega um ping (ou a cada 30s). */
export function AutoRefresh({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  useLive(`sipatgo-admin-${campaignId}`, () => router.refresh(), 30000);
  return <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />ao vivo</span>;
}
