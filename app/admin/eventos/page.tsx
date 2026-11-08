import Link from "next/link";
import { requireAdminCampaign } from "@/lib/auth";
import { sql } from "@/lib/db";
import { formatDateTimeBR, weekdayName } from "@/lib/dates";
import { Card, Field, Input, PageTitle, Select, buttonClass } from "@/components/ui";
import { ActionButton, ActionForm } from "@/components/admin/ActionForm";
import { createEvent, deleteEvent } from "./actions";

export default async function EventsPage() {
  const { campaign, adminCompany } = await requireAdminCampaign();
  const days = await sql<{ id: string; day_index: number; date: string }[]>`select id, day_index, date from sipatgo.campaign_days where campaign_id = ${campaign.id} order by day_index`;
  const events = await sql<{ id: string; name: string; starts_at: Date; ends_at: Date; points: number; code: string; checkins: number }[]>`
    select e.*, (select count(*)::int from sipatgo.checkins c where c.event_id = e.id) as checkins
      from sipatgo.events e where campaign_id = ${campaign.id} order by starts_at`;
  return (
    <div className="max-w-4xl space-y-5">
      <PageTitle title="Eventos presenciais" subtitle="Palestras, blitz, ginástica laboral... Check-in por QR code ou código de 6 letras vale pontos." />
      <Card>
        <h2 className="mb-3 font-display font-bold">Novo evento</h2>
        <ActionForm action={createEvent} submitLabel="Criar evento" resetOnSuccess>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Nome" className="sm:col-span-3"><Input name="name" required placeholder="Palestra de abertura" /></Field>
            <Field label="Dia"><Select name="date" defaultValue={days[1]?.date}>{days.map((d) => <option key={d.id} value={d.date}>{weekdayName(d.date)} (dia {d.day_index})</option>)}</Select></Field>
            <Field label="Check-in abre"><Input name="start" type="time" defaultValue="09:00" /></Field>
            <Field label="Check-in fecha"><Input name="end" type="time" defaultValue="11:00" /></Field>
            <Field label="Pontos"><Input name="points" type="number" min={0} defaultValue={100} /></Field>
          </div>
        </ActionForm>
      </Card>
      <div className="space-y-2">
        {events.map((e) => (
          <Card key={e.id} className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{e.name}</p>
              <p className="text-sm text-slate-500">{formatDateTimeBR(e.starts_at, adminCompany.timezone)} – {formatDateTimeBR(e.ends_at, adminCompany.timezone).slice(-5)} · {e.points} pts · {e.checkins} check-in(s)</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-3 py-1 font-display text-lg font-bold tracking-[.3em]">{e.code}</span>
            <Link href={`/admin/eventos/${e.id}/qr`} className={buttonClass("primary", "sm")}>QR / imprimir</Link>
            <ActionButton action={deleteEvent} label="Excluir" variant="ghost" fields={{ id: e.id }} confirm="Excluir evento?" />
          </Card>
        ))}
        {!events.length && <p className="text-sm text-slate-500">Nenhum evento cadastrado.</p>}
      </div>
    </div>
  );
}
