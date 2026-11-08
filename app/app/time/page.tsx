import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/auth";
import { teamOverview } from "@/lib/team";
import { Avatar } from "@/components/avatar/Avatar";
import { Card, PageTitle, Pill } from "@/components/ui";
import { NudgeButton } from "./NudgeButton";

const LABEL = { done: "Feito", makeup: "Recuperado", pending: "Pendente", none: "—" } as const;
const TONE = { done: "green", makeup: "amber", pending: "red", none: "slate" } as const;

export default async function TeamPage() {
  const { participant: p } = await requireViewer();
  if (p.role !== "leader" && p.role !== "admin" && p.role !== "superadmin") redirect("/app");
  const o = await teamOverview(p);
  return (
    <div className="space-y-4">
      <PageTitle title="Meu time" subtitle={`Setor ${o.sector}`} />
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center"><p className="font-display text-2xl font-extrabold tabular">{o.adhesionToday}%</p><p className="text-[11px] text-brand-muted">fizeram hoje</p></Card>
        <Card className="p-3 text-center"><p className="font-display text-2xl font-extrabold tabular">{o.sectorRank?.adhesion_pct ?? 0}%</p><p className="text-[11px] text-brand-muted">adesão total</p></Card>
        <Card className="p-3 text-center"><p className="font-display text-2xl font-extrabold tabular">{o.sectorRank ? `${o.sectorRank.position}º` : "—"}</p><p className="text-[11px] text-brand-muted">de {o.sectorRank?.sectors ?? 0} setores</p></Card>
      </div>
      {o.today && <NudgeButton disabled={o.nudgedToday} pending={o.members.filter((m) => m.today === "pending").length} />}
      <ul className="space-y-2">
        {o.members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-brand-100">
            <Avatar config={m.avatar_config} seed={m.id} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{m.name}</p>
              <p className="text-xs text-brand-muted">{m.total_points} pts · {m.days_completed}/5 dias</p>
            </div>
            <Pill tone={TONE[m.today]}>{LABEL[m.today]}</Pill>
          </li>
        ))}
      </ul>
    </div>
  );
}
