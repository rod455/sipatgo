"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/components/ui/fetcher";
import { Avatar } from "@/components/avatar/Avatar";
import { cn } from "@/lib/utils";
import { useLive } from "./useLive";
import type { RankRow, SectorRow } from "@/lib/ranking";

type Tab = "general" | "today" | "sector";
const TABS: { key: Tab; label: string }[] = [{ key: "general", label: "Geral" }, { key: "today", label: "Hoje" }, { key: "sector", label: "Por setor" }];

export function RankingBoard({ campaignId, badgeIcons, days }: { campaignId: string; badgeIcons: Record<string, string>; days: number[] }) {
  const [tab, setTab] = useState<Tab>("general");
  const [day, setDay] = useState<number | undefined>(undefined);
  const [rows, setRows] = useState<RankRow[] | SectorRow[] | null>(null);
  const [dayShown, setDayShown] = useState<number | undefined>();

  const load = useCallback(async () => {
    const q = new URLSearchParams({ tab });
    if (tab === "today" && day) q.set("day", String(day));
    const r = await api<{ rows: RankRow[] | SectorRow[]; day?: number }>(`/api/ranking?${q}`);
    setRows(r.rows);
    setDayShown(r.day);
  }, [tab, day]);

  useEffect(() => { setRows(null); void load(); }, [load]);
  useLive(`sipatgo-ranking-${campaignId}`, load);

  const me = tab !== "sector" ? (rows as RankRow[] | null)?.find((r) => r.me) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 rounded-xl bg-slate-200 p-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn("rounded-lg py-2 text-sm font-semibold", tab === t.key ? "bg-white shadow" : "text-slate-600")}>{t.label}</button>
        ))}
      </div>
      {tab === "today" && (
        <div className="flex gap-2">
          {days.map((d) => (
            <button key={d} onClick={() => setDay(d)} className={cn("h-9 flex-1 rounded-lg text-sm font-semibold", (dayShown ?? day) === d ? "bg-brand text-brand-fg" : "bg-white ring-1 ring-slate-200")}>Dia {d}</button>
          ))}
        </div>
      )}
      <p className="flex items-center gap-1.5 text-xs text-slate-500"><span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> Ao vivo</p>

      {!rows ? <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-200" />)}</div> : tab === "sector" ? (
        <ol className="space-y-2">
          {(rows as SectorRow[]).map((s) => (
            <li key={s.sector} className={cn("flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1", s.mine ? "ring-2 ring-brand" : "ring-slate-200")}>
              <Pos n={s.position} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{s.sector}</p>
                <p className="text-xs text-slate-500">{s.members} pessoas · adesão {s.adhesion_pct}%</p>
              </div>
              <div className="text-right"><p className="font-display font-extrabold tabular">{s.avg_points}</p><p className="text-[10px] text-slate-500">média</p></div>
            </li>
          ))}
        </ol>
      ) : (
        <>
          {me && me.position > 5 && (
            <div className="sticky top-16 z-20">
              <Row r={me} badgeIcons={badgeIcons} highlight />
            </div>
          )}
          <ol className="space-y-2">
            {(rows as RankRow[]).map((r) => <li key={r.participant_id}><Row r={r} badgeIcons={badgeIcons} highlight={r.me} /></li>)}
          </ol>
        </>
      )}
    </div>
  );
}

function Pos({ n }: { n: number }) {
  const medal = n === 1 ? "🥇" : n === 2 ? "🥈" : n === 3 ? "🥉" : null;
  return <span className="w-8 shrink-0 text-center font-display text-lg font-extrabold tabular text-slate-700">{medal ?? `${n}º`}</span>;
}

function Row({ r, badgeIcons, highlight }: { r: RankRow; badgeIcons: Record<string, string>; highlight?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl p-2.5 shadow-sm ring-1", highlight ? "bg-brand text-brand-fg ring-brand" : "bg-white ring-slate-200")}>
      <Pos n={r.position} />
      <Avatar config={r.avatar_config} seed={r.participant_id} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{r.name}{highlight ? " (você)" : ""}</p>
        <p className={cn("truncate text-xs", highlight ? "opacity-80" : "text-slate-500")}>
          {r.sector} {r.badges?.length ? <span className="ml-1">{r.badges.slice(0, 5).map((b) => badgeIcons[b] ?? "").join("")}</span> : null}
        </p>
      </div>
      <span className="font-display text-lg font-extrabold tabular">{r.points}</span>
    </div>
  );
}
