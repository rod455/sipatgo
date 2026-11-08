import { requireAdmin } from "@/lib/auth";
import { Card, Field, Input, PageTitle, Select, Textarea } from "@/components/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { saveIdentity } from "./actions";
import { campaignUrl } from "@/lib/utils";

const TZ = [["America/Sao_Paulo", "Brasília (SP, RJ, MG, Sul, GO, DF)"], ["America/Bahia", "Bahia"], ["America/Fortaleza", "Fortaleza (CE, RN, PB, MA, PI)"], ["America/Recife", "Recife (PE, AL, SE)"], ["America/Belem", "Belém (PA, AP, TO)"], ["America/Cuiaba", "Cuiabá (MT, MS)"], ["America/Manaus", "Manaus (AM, RR)"], ["America/Porto_Velho", "Porto Velho (RO)"], ["America/Rio_Branco", "Rio Branco (AC)"], ["America/Noronha", "Fernando de Noronha"]];

export default async function IdentityPage() {
  const { adminCompany: c } = await requireAdmin();
  return (
    <div className="max-w-3xl space-y-5">
      <PageTitle title="Identidade" subtitle="Logo, cores e textos que aparecem para os participantes." />
      <Card>
        <ActionForm action={saveIdentity} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da empresa"><Input name="name" defaultValue={c.name} required /></Field>
            <Field label="Endereço da campanha" hint="Definido pelo superadmin."><Input readOnly value={campaignUrl(c.slug)} /></Field>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {c.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.logo_url} alt="Logo" className="h-16 w-auto rounded-lg bg-slate-100 p-2" />
            )}
            <Field label="Logo (PNG/SVG, fundo transparente, até 2 MB)"><Input type="file" name="logo" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="pt-2" /></Field>
            {c.logo_url && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="remove_logo" /> Remover logo</label>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {([["primary_color", "Primária", c.primary_color], ["secondary_color", "Secundária", c.secondary_color], ["accent_color", "Destaque", c.accent_color]] as const).map(([k, l, v]) => (
              <Field key={k} label={l}><input type="color" name={k} defaultValue={v} className="h-11 w-full cursor-pointer rounded-xl border border-slate-300" /></Field>
            ))}
          </div>
          <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm">
            <input type="checkbox" name="allow_photo_avatar" defaultChecked={c.allow_photo_avatar} className="mt-0.5 h-4 w-4" />
            <span><strong>Permitir foto como avatar.</strong> A foto aparece no ranking e no mural para todos os colegas. Desligado, só personagens (o “Criar pela foto” continua disponível, pois a foto não sai do celular). O RH pode remover fotos em Participantes.</span>
          </label>
          <Field label="Fuso horário"><Select name="timezone" defaultValue={c.timezone}>{TZ.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
          <Field label="Texto de consentimento LGPD" hint={`Versão atual: ${c.consent_version}. Alterar o texto gera nova versão (participantes que já aceitaram não precisam aceitar de novo).`}>
            <Textarea name="consent_text" rows={6} defaultValue={c.consent_text} />
          </Field>
          <Field label="Webhook de notificações (n8n)" hint="Recebe prize.awarded, day.released, reminder.pending, leader.nudge, wall.post_pending, campaign.closed e daily.summary. Vazio = webhook global.">
            <Input name="notifications_webhook_url" defaultValue={c.notifications_webhook_url ?? ""} placeholder="https://n8n.suaempresa.com/webhook/..." />
          </Field>
        </ActionForm>
      </Card>
    </div>
  );
}
