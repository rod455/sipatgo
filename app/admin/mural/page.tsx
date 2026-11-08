import { requireAdminCampaign } from "@/lib/auth";
import { sql } from "@/lib/db";
import { signedUrls } from "@/lib/storage";
import { formatDateTimeBR } from "@/lib/dates";
import { Card, PageTitle, Pill, Empty } from "@/components/ui";
import { ActionButton } from "@/components/admin/ActionForm";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { electWinner, moderate } from "./actions";

export default async function WallAdmin() {
  const { campaign, adminCompany } = await requireAdminCampaign();
  const posts = await sql<{ id: string; image_path: string; caption: string; status: string; day_index: number; created_at: Date; name: string; sector: string; votes: number; points_awarded: number }[]>`
    select w.id, w.image_path, w.caption, w.status, w.day_index, w.created_at, w.points_awarded, p.name, p.sector,
           (select count(*)::int from sipatgo.wall_votes v where v.post_id = w.id) as votes
      from sipatgo.wall_posts w join sipatgo.participants p on p.id = w.participant_id
     where w.campaign_id = ${campaign.id} and w.status <> 'rejected' order by w.status = 'pending' desc, w.created_at desc limit 300`;
  const winners = await sql<{ day_index: number; name: string; caption: string }[]>`
    select dw.day_index, p.name, w.caption from sipatgo.wall_daily_winners dw join sipatgo.wall_posts w on w.id = dw.post_id
      join sipatgo.participants p on p.id = w.participant_id where dw.campaign_id = ${campaign.id} order by dw.day_index`;
  const urls = await signedUrls(posts.map((p) => p.image_path));
  const pending = posts.filter((p) => p.status === "pending");
  const approved = posts.filter((p) => p.status === "approved");
  return (
    <div className="space-y-6">
      <PageTitle title="Mural — moderação" subtitle={campaign.wall_challenge ?? undefined} action={<AutoRefresh campaignId={campaign.id} />} />
      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Pendentes ({pending.length})</h2>
        {!pending.length ? <Empty>Nenhum post aguardando.</Empty> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((p) => (
              <Card key={p.id} className="space-y-2 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {urls[p.image_path] ? <img src={urls[p.image_path]} alt="" className="aspect-square w-full rounded-lg object-cover" /> : <div className="aspect-square rounded-lg bg-slate-100" />}
                <p className="text-sm font-semibold">{p.name} <span className="font-normal text-slate-500">· {p.sector} · dia {p.day_index}</span></p>
                {p.caption && <p className="text-sm text-slate-700">{p.caption}</p>}
                <p className="text-xs text-slate-400">{formatDateTimeBR(p.created_at, adminCompany.timezone)}</p>
                <div className="flex gap-2">
                  <ActionButton action={moderate} label="Aprovar" variant="primary" fields={{ id: p.id, approve: "1" }} />
                  <ActionButton action={moderate} label="Rejeitar" variant="danger" fields={{ id: p.id, approve: "0" }} confirm="Rejeitar este post?" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Vencedores do dia</h2>
        <Card className="space-y-2">
          {[1, 2, 3, 4].map((d) => {
            const w = winners.find((x) => x.day_index === d);
            return (
              <div key={d} className="flex items-center justify-between gap-2 text-sm">
                <span>Dia {d}: {w ? <strong>{w.name}</strong> : <span className="text-slate-400">a definir (automático às 00h)</span>}</span>
                {!w && <ActionButton action={electWinner} label="Apurar agora" fields={{ day: String(d) }} />}
              </div>
            );
          })}
        </Card>
      </section>
      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Aprovados ({approved.length})</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {approved.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {urls[p.image_path] ? <img src={urls[p.image_path]} alt="" className="aspect-square w-full object-cover" /> : <div className="aspect-square bg-slate-100" />}
              <div className="flex items-center justify-between p-2 text-xs"><span className="truncate">{p.name}</span><Pill>❤ {p.votes}</Pill></div>
              <div className="px-2 pb-2"><ActionButton action={moderate} label="Remover" variant="ghost" fields={{ id: p.id, approve: "0" }} confirm="Remover do mural?" /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
