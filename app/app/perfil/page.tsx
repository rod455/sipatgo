import { requireViewer } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getToday } from "@/lib/game";
import { Avatar } from "@/components/avatar/Avatar";
import { Card, Pill, buttonClass } from "@/components/ui";
import { ProfileActions } from "./ProfileActions";
import { photoAvatarAllowed } from "@/lib/avatar-server";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
  const { participant: p, company } = await requireViewer();
  const today = await getToday(p, company);
  const badges = await sql<{ code: string; name: string; description: string; icon: string; awarded_at: Date | null }[]>`
    select b.code, b.name, b.description, b.icon, pb.awarded_at from sipatgo.badges b
      left join sipatgo.participant_badges pb on pb.badge_code = b.code and pb.participant_id = ${p.id}
     order by b.sort`;
  const prizes = await sql<{ code: string; status: string; created_at: Date; day_index: number }[]>`
    select a.code, a.status, a.created_at, d.day_index from sipatgo.prize_awards a
      join sipatgo.wheel_spins w on w.id = a.wheel_spin_id join sipatgo.campaign_days d on d.id = w.campaign_day_id
     where a.participant_id = ${p.id} order by a.created_at`;
  const [cert] = await sql<{ code: string }[]>`select code from sipatgo.certificates where participant_id = ${p.id} and campaign_id = ${p.campaign_id}`;
  const [score] = await sql<{ total_points: number }[]>`select total_points from sipatgo.participant_scores where participant_id = ${p.id}`;
  const closed = today?.campaign.phase === "closed";

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center text-center">
        <Avatar config={p.avatar_config} seed={p.id} size={112} />
        <h1 className="mt-3 font-display text-2xl font-bold">{p.name}</h1>
        <p className="text-sm text-brand-muted">{p.sector}{p.role === "leader" ? " · Líder" : ""}</p>
        <p className="mt-1 font-display text-xl font-extrabold tabular text-brand">{score?.total_points ?? 0} pts</p>
      </div>

      <ProfileActions avatar={p.avatar_config} seed={p.id} brandColors={[company.primary_color, company.secondary_color, company.accent_color]} allowPhoto={photoAvatarAllowed(company)} />

      <section id="certificado">
        <h2 className="mb-2 font-display text-lg font-bold">Certificado</h2>
        <Card>
          {cert ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm">Seu certificado está pronto! 🎓</p>
              <a href={`/api/certificate/${cert.code}`} target="_blank" className={buttonClass("primary", "sm")}>Baixar PDF</a>
            </div>
          ) : (
            <p className="text-sm text-brand-muted">{closed ? "Você não atingiu o mínimo de dias para o certificado nesta campanha." : "Liberado após o encerramento da campanha para quem concluir o mínimo de dias."}</p>
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg font-bold">Pontos por dia</h2>
        <Card className="divide-y divide-brand-100 p-0">
          {today?.days.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span>Dia {d.day_index} <span className="text-brand-muted">· {d.title}</span></span>
              <span className="font-display font-bold tabular">{d.state === "locked" ? "🔒" : `${d.points}${d.state === "done_makeup" ? " ↺" : ""}`}</span>
            </div>
          ))}
        </Card>
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg font-bold">Meus brindes</h2>
        {prizes.length === 0 ? <p className="text-sm text-brand-muted">Nenhum brinde ainda. Gire a roleta nos dias marcados com 🎡.</p> : (
          <ul className="space-y-2">
            {prizes.map((pr) => (
              <li key={pr.code} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-brand-100">
                <div><p className="font-display text-lg font-extrabold tracking-widest tabular">{pr.code}</p><p className="text-xs text-brand-muted">Roleta do dia {pr.day_index}</p></div>
                <Pill tone={pr.status === "delivered" ? "green" : pr.status === "cancelled" ? "red" : "amber"}>{pr.status === "delivered" ? "Retirado" : pr.status === "cancelled" ? "Cancelado" : "Retirar no RH"}</Pill>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg font-bold">Selos</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {badges.map((b) => (
            <div key={b.code} title={b.description} className={cn("rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-brand-100", !b.awarded_at && "opacity-40 grayscale")}>
              <p className="text-3xl">{b.icon}</p>
              <p className="mt-1 text-xs font-semibold leading-tight">{b.name}</p>
              <p className="mt-0.5 text-[10px] leading-tight text-brand-muted">{b.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
