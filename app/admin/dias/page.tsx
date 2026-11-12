import Link from "next/link";
import { requireAdminCampaign } from "@/lib/auth";
import { sql } from "@/lib/db";
import { weekdayName, formatDateBR } from "@/lib/dates";
import { ACTIVITY_LABELS, type ActivityType } from "@/lib/activities";
import { Card, Field, Input, PageTitle } from "@/components/ui";
import { ActionButton, ActionForm } from "@/components/admin/ActionForm";
import { YoutubeField } from "@/components/admin/YoutubeField";
import { ActivityEditor } from "@/components/admin/ActivityEditor";
import { FamilyEditor } from "@/components/admin/FamilyEditor";
import { addMaterial, deleteMaterial, saveDay } from "./actions";
import { cn } from "@/lib/utils";
import type { CampaignDay } from "@/lib/types";

export default async function DaysPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { campaign } = await requireAdminCampaign();
  const days = await sql<(CampaignDay & { act_type: ActivityType | null })[]>`
    select d.*, a.type as act_type from sipatgo.campaign_days d left join sipatgo.activities a on a.campaign_day_id = d.id
     where d.campaign_id = ${campaign.id} order by d.day_index`;
  const dParam = Number((await searchParams).d);
  const sel = days.find((d) => d.day_index === dParam) ?? days[0];
  if (!sel) return <PageTitle title="Dias" subtitle="Esta campanha não tem dias." />;
  const [act] = await sql<{ type: ActivityType; config: unknown; attempts: number }[]>`
    select type, config, (select count(*)::int from sipatgo.attempts t where t.activity_id = a.id) as attempts
      from sipatgo.activities a where campaign_day_id = ${sel.id}`;
  const [fam] = await sql<{ type: string; config: Record<string, unknown> }[]>`select type, config from sipatgo.family_games where campaign_day_id = ${sel.id}`;
  const materials = await sql<{ id: string; title: string; url: string; kind: string }[]>`select id, title, url, kind from sipatgo.materials where campaign_day_id = ${sel.id} order by sort`;

  return (
    <div className="max-w-4xl space-y-5">
      <PageTitle title="Dias e dinâmicas" subtitle="Mesma estrutura todo dia: vídeo → dinâmica (5 itens) → roleta (se houver)." />
      <div className="flex gap-2 overflow-x-auto">
        {days.map((d) => (
          <Link key={d.id} href={`/admin/dias?d=${d.day_index}`}
            className={cn("shrink-0 rounded-xl px-4 py-2 text-left", d.id === sel.id ? "bg-brand text-brand-fg" : "bg-white ring-1 ring-slate-200")}>
            <p className="text-xs font-semibold opacity-80">{weekdayName(d.date)} · {formatDateBR(d.date).slice(0, 5)}</p>
            <p className="text-sm font-bold">{d.act_type ? ACTIVITY_LABELS[d.act_type] : "Sem dinâmica"}{d.has_wheel ? " 🎡" : ""}</p>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 font-display font-bold">Conteúdo do dia {sel.day_index}</h2>
        <ActionForm action={saveDay} className="space-y-4" key={sel.id}>
          <input type="hidden" name="day_id" value={sel.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Título"><Input name="title" defaultValue={sel.title} /></Field>
            <Field label="Tema"><Input name="theme" defaultValue={sel.theme} /></Field>
          </div>
          <YoutubeField key={sel.id} initialId={sel.youtube_video_id} initialDuration={sel.video_duration_s} initialSegments={sel.video_segments?.length ? sel.video_segments : sel.video_start_s || sel.video_end_s ? [{ start: sel.video_start_s ?? 0, end: sel.video_end_s }] : null} />
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="has_wheel" defaultChecked={sel.has_wheel} className="h-4 w-4" /> Roleta de brindes neste dia 🎡</label>
        </ActionForm>
      </Card>

      <Card>
        <h2 className="mb-3 font-display font-bold">Dinâmica</h2>
        <ActivityEditor key={sel.id} dayId={sel.id} initialType={act?.type ?? null} initialConfig={act?.config ?? null} hasAttempts={(act?.attempts ?? 0) > 0} />
      </Card>

      <Card>
        <h2 className="mb-3 font-display font-bold">Game da família</h2>
        <FamilyEditor key={sel.id} dayId={sel.id} initial={fam ?? null} />
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display font-bold">Materiais de apoio</h2>
        <ul className="space-y-2">
          {materials.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <a href={m.url} target="_blank" className="truncate font-medium text-brand underline">{m.kind === "pdf" ? "📄" : "🔗"} {m.title}</a>
              <ActionButton action={deleteMaterial} label="Remover" variant="ghost" fields={{ id: m.id }} />
            </li>
          ))}
        </ul>
        <ActionForm action={addMaterial} submitLabel="Adicionar material" resetOnSuccess className="space-y-2">
          <input type="hidden" name="day_id" value={sel.id} />
          <div className="grid gap-2 sm:grid-cols-3">
            <Input name="title" placeholder="Título" />
            <Input name="url" placeholder="https://... (ou envie PDF)" />
            <Input name="file" type="file" accept="application/pdf" className="pt-2" />
          </div>
        </ActionForm>
      </Card>
    </div>
  );
}
