import { requireViewer } from "@/lib/auth";
import { getToday } from "@/lib/game";
import { familyHistory, getFamilyGame } from "@/lib/family";
import { PageTitle, Empty } from "@/components/ui";
import { FamilyGame } from "./FamilyGame";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { now } from "@/lib/clock";
import { localDate } from "@/lib/dates";

export default async function FamilyPage({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { participant: p, company } = await requireViewer();
  const today = await getToday(p, company);
  const released = today?.days.filter((d) => d.state !== "locked").map((d) => d.day_index) ?? [];
  const wanted = Number((await searchParams).dia);
  // Padrão: o dia de hoje no calendário da campanha; senão o último dia já passado; senão o primeiro liberado.
  const todayStr = localDate(now(), company.timezone || "America/Sao_Paulo");
  const open = (today?.days ?? []).filter((d) => released.includes(d.day_index));
  const current = open.find((d) => d.date === todayStr) ?? [...open].reverse().find((d) => d.date <= todayStr) ?? open[0];
  const day = released.includes(wanted) ? wanted : current?.day_index;
  const game = day ? await getFamilyGame(p, day) : null;
  const history = await familyHistory(p);
  return (
    <div className="space-y-4">
      <PageTitle title="Games da família" subtitle="Jogue com quem você ama no seu celular. Não vale ponto no ranking, mas vale selo! 👨‍👩‍👧" />
      <div className="flex gap-2">
        {history.map((h) => {
          const open = released.includes(h.day_index);
          return (
            <Link key={h.day_index} href={open ? `/app/familia?dia=${h.day_index}` : "#"} aria-disabled={!open}
              className={cn("flex h-10 flex-1 items-center justify-center rounded-lg text-sm font-semibold",
                h.day_index === day ? "bg-brand text-brand-fg" : open ? "bg-white ring-1 ring-brand-100" : "pointer-events-none bg-brand-50 text-brand-muted")}>
              {h.completed_at ? "✓" : `Dia ${h.day_index}`}
            </Link>
          );
        })}
      </div>
      {game ? <FamilyGame key={game.id} game={game} /> : <Empty>{day ? "Sem game neste dia." : "Os games abrem junto com a campanha."}</Empty>}
    </div>
  );
}
