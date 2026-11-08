import { requireAdmin } from "@/lib/auth";
import { makeupDeadline } from "@/lib/calendar";
import { votingDeadline } from "@/lib/wall";
import { loadDays } from "@/lib/game";
import { TZDate } from "@date-fns/tz";
import { Card, Field, Input, PageTitle, Select, Textarea, Alert } from "@/components/ui";
import { ActionButton, ActionForm } from "@/components/admin/ActionForm";
import { closeNow, createCampaign, reissueCertificates, saveCampaign } from "./actions";
import { selectCompany } from "../context-actions";
import { sql } from "@/lib/db";

function toLocalInput(d: Date, tz: string) {
  const z = new TZDate(d.getTime(), tz);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${z.getFullYear()}-${p(z.getMonth() + 1)}-${p(z.getDate())}T${p(z.getHours())}:${p(z.getMinutes())}`;
}

export default async function CampaignPage({ searchParams }: { searchParams: Promise<{ nova?: string }> }) {
  const ctx = await requireAdmin();
  const nova = (await searchParams).nova === "1" || !ctx.campaign;
  const c = ctx.campaign;
  const tz = ctx.adminCompany.timezone;
  const days = c ? await loadDays(c.id) : [];
  const others = !c && ctx.participant.role === "superadmin"
    ? await sql<{ id: string; name: string }[]>`
        select co.id, co.name from sipatgo.companies co
         where co.id <> ${ctx.adminCompany.id} and exists(select 1 from sipatgo.campaigns ca where ca.company_id = co.id)
         order by co.name`
    : [];

  return (
    <div className="max-w-3xl space-y-6">
      <PageTitle title="Campanha" subtitle="Datas, horários, regras e textos da semana." />
      {c && !nova && (() => {
        const clock = { ...c, timezone: tz };
        return (
          <Card>
            <ActionForm action={saveCampaign} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome da campanha"><Input name="name" defaultValue={c.name} required /></Field>
                <Field label="Tema do ano"><Input name="theme" defaultValue={c.theme} /></Field>
                <Field label="Início (segunda-feira)" hint="Os 5 dias seguem de segunda a sexta."><Input type="date" name="start_date" defaultValue={c.start_date} required /></Field>
                <Field label="Horário de liberação diária"><Input type="time" name="release_time" defaultValue={c.release_time.slice(0, 5)} required /></Field>
                <Field label="Prazo da recuperação" hint="Vazio = sexta 18:00."><Input type="datetime-local" name="makeup_deadline" defaultValue={c.makeup_deadline ? toLocalInput(new Date(c.makeup_deadline), tz) : ""} placeholder={toLocalInput(makeupDeadline(clock), tz)} /></Field>
                <Field label="Fim da votação do mural" hint="Vazio = quinta 23:59."><Input type="datetime-local" name="wall_voting_deadline" defaultValue={c.wall_voting_deadline ? toLocalInput(new Date(c.wall_voting_deadline), tz) : ""} /></Field>
                <Field label="Fator da recuperação" hint="0,5 = 50% dos pontos."><Input type="number" step="0.05" min="0" max="1" name="makeup_factor" defaultValue={c.makeup_factor} /></Field>
                <Field label="Mínimo de dias para certificado"><Input type="number" min="1" max="5" name="min_days_for_certificate" defaultValue={c.min_days_for_certificate} /></Field>
                <Field label="Status">
                  <Select name="status" defaultValue={c.status}>
                    <option value="draft">Rascunho (invisível)</option>
                    <option value="scheduled">Agendada (ativa sozinha no 1º dia)</option>
                    <option value="active">Ativa</option>
                    <option value="closed" disabled={c.status !== "closed"}>Encerrada</option>
                  </Select>
                </Field>
              </div>
              <Field label="Mensagem da liderança (exibida na segunda antes do conteúdo)"><Textarea name="opening_message" rows={3} defaultValue={c.opening_message ?? ""} /></Field>
              <Field label="Vídeo da liderança (YouTube, opcional)"><Input name="opening_video_url" defaultValue={c.opening_video_url ?? ""} placeholder="https://youtu.be/..." /></Field>
              <Field label="Desafio do mural"><Input name="wall_challenge" defaultValue={c.wall_challenge ?? ""} /></Field>
            </ActionForm>
            <p className="mt-3 text-xs text-slate-500">Mural: votação até {new Intl.DateTimeFormat("pt-BR", { timeZone: tz, dateStyle: "short", timeStyle: "short" }).format(votingDeadline(clock, days))}.</p>
          </Card>
        );
      })()}

      {c && !nova && (
        <Card className="space-y-3">
          <h2 className="font-display font-bold">Encerramento</h2>
          <p className="text-sm text-slate-600">O encerramento acontece sozinho no prazo da recuperação: congela o ranking, calcula pódio e setor campeão e emite os certificados.</p>
          <div className="flex flex-wrap gap-2">
            {c.status !== "closed" && <ActionButton action={closeNow} label="Encerrar campanha agora" variant="danger" confirm="Encerrar agora? Nada mais pontua depois disso." />}
            {c.status === "closed" && <ActionButton action={reissueCertificates} label="Reemitir certificados pendentes" />}
          </div>
        </Card>
      )}

      {!c && others.length > 0 && (
        <Card className="space-y-3 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">Quer gerenciar outra empresa? Estas já têm campanha:</p>
          <div className="flex flex-wrap gap-2">
            {others.map((o) => (
              <form key={o.id} action={selectCompany.bind(null, o.id)}>
                <button className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-amber-200 hover:bg-amber-100">{o.name} →</button>
              </form>
            ))}
          </div>
        </Card>
      )}

      <Card className="space-y-3">
        <h2 className="font-display font-bold">Nova campanha</h2>
        <p className="text-sm text-slate-600">Cria a semana completa (5 dias, dinâmicas e games de exemplo) para você só ajustar.</p>
        {!c && <Alert tone="blue">A empresa <strong>{ctx.adminCompany.name}</strong> ainda não tem campanha. Crie a primeira abaixo.</Alert>}
        <ActionForm action={createCampaign} submitLabel="Criar campanha" className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Nome"><Input name="name" placeholder="SIPAT 2026" required /></Field>
            <Field label="Tema"><Input name="theme" placeholder="Prevenção começa em mim" /></Field>
            <Field label="Segunda-feira de início"><Input type="date" name="start_date" required /></Field>
            <Field label="Conteúdo inicial" className="sm:col-span-3">
              <Select name="template" defaultValue="industria">
                <option value="industria">Indústria / geral (EPI, CIPA, saúde mental)</option>
                <option value="transporte">Transporte de passageiros (direção defensiva, fadiga, checklist)</option>
              </Select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="with_prizes" defaultChecked /> Incluir brindes de exemplo</label>
        </ActionForm>
      </Card>
    </div>
  );
}
