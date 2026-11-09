import Link from "next/link";
import { requireViewer } from "@/lib/auth";
import { getToday } from "@/lib/game";
import { sql } from "@/lib/db";
import { firstName } from "@/lib/utils";
import { formatDateTimeBR } from "@/lib/dates";
import { parseYoutubeId } from "@/lib/youtube";
import { Avatar } from "@/components/avatar/Avatar";
import { DayCard } from "@/components/app/DayCard";
import { Card } from "@/components/ui";
import { Trophy, Image as ImageIcon, Users, QrCode, UsersRound, PartyPopper, Award } from "lucide-react";

export default async function Home() {
  const { participant: p, company } = await requireViewer();
  const today = await getToday(p, company);
  if (!today) return null;
  const [rank] = await sql<{ position: number; points: number; total: number }[]>`
    select position::int, total_points as points,
           (select count(*)::int from sipatgo.v_ranking_individual where campaign_id = ${p.campaign_id}) as total
      from sipatgo.v_ranking_individual where participant_id = ${p.id}`;
  const badges = await sql<{ icon: string; name: string }[]>`
    select b.icon, b.name from sipatgo.participant_badges pb join sipatgo.badges b on b.code = pb.badge_code
     where pb.participant_id = ${p.id} order by pb.awarded_at desc limit 6`;
  const { campaign, days } = today;
  const closed = campaign.phase === "closed";
  const showOpening = days[0]?.state === "available" && !days[0].video_done && (campaign.opening_message || campaign.opening_video_url);
  const openingVideo = campaign.opening_video_url ? parseYoutubeId(campaign.opening_video_url) : null;
  const wheelDay = days.find((d) => d.wheel_available);
  const hasMakeup = days.some((d) => d.state === "makeup");

  return (
    <div className="space-y-5">
      <section className="flex items-center gap-3">
        <Avatar config={p.avatar_config} seed={p.id} size={56} />
        <div className="min-w-0">
          <p className="text-sm text-brand-muted">Olá,</p>
          <h1 className="truncate font-display text-2xl font-bold">{firstName(p.name)}!</h1>
        </div>
        {rank && (
          <Link href="/app/ranking" className="ml-auto rounded-2xl bg-white px-3 py-2 text-center shadow-sm ring-1 ring-brand-100">
            <p className="font-display text-xl font-extrabold tabular text-brand">{rank.position}º</p>
            <p className="text-[11px] text-brand-muted tabular">{rank.points} pts</p>
          </Link>
        )}
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-brand to-brand-2 p-4 text-brand-fg shadow">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{campaign.name}</p>
        <p className="font-display text-xl font-bold leading-tight">{campaign.theme || "Segurança é com a gente"}</p>
        {(campaign.phase === "upcoming" || campaign.phase === "draft") && <p className="mt-2 text-sm opacity-90">A campanha começa em breve. Volte no primeiro dia às 08h!</p>}
        {hasMakeup && !closed && <p className="mt-2 text-sm opacity-90">Perdeu algum dia? Recupere até {formatDateTimeBR(campaign.makeup_deadline, company.timezone)} (vale 50%).</p>}
      </section>

      {closed && (
        <Link href="/app/podio" className="flex items-center gap-3 rounded-2xl bg-brand-accent p-4 font-semibold text-brand-accent-fg shadow">
          <PartyPopper className="h-6 w-6" /> A campanha terminou! Veja o pódio e seu certificado
        </Link>
      )}

      {wheelDay && (
        <Link href={`/app/dia/${wheelDay.day_index}/roleta`} className="flex items-center gap-3 rounded-2xl bg-brand-accent p-4 font-semibold text-brand-accent-fg shadow animate-pulse-ring">
          <span className="text-2xl">🎡</span> Sua roleta está liberada! Gire agora
        </Link>
      )}

      {showOpening && (
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Mensagem da liderança</p>
          {openingVideo && (
            <div className="aspect-video overflow-hidden rounded-xl bg-black">
              <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${openingVideo}?rel=0&modestbranding=1`} title="Mensagem da liderança" allowFullScreen />
            </div>
          )}
          {campaign.opening_message && <p className="whitespace-pre-line text-sm text-brand-ink">{campaign.opening_message}</p>}
        </Card>
      )}

      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold">Sua semana</h2>
        {days.map((d) => <DayCard key={d.id} d={d} tz={company.timezone} />)}
      </section>

      {badges.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Seus selos</h2><Link href="/app/perfil" className="text-sm font-semibold text-brand">Ver todos</Link></div>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => <span key={b.name} className="rounded-full bg-white px-3 py-1.5 text-sm shadow-sm ring-1 ring-brand-100">{b.icon} {b.name}</span>)}
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <Shortcut href="/app/ranking" icon={<Trophy />} label="Ranking" />
        <Shortcut href="/app/mural" icon={<ImageIcon />} label="Mural" />
        <Shortcut href="/app/familia" icon={<Users />} label="Família" />
        <Shortcut href="/app/checkin" icon={<QrCode />} label="Check-in" />
        {(p.role === "leader" || p.role === "admin") && <Shortcut href="/app/time" icon={<UsersRound />} label="Meu time" />}
        {closed && <Shortcut href="/app/perfil#certificado" icon={<Award />} label="Certificado" />}
      </section>
    </div>
  );
}

function Shortcut({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl bg-white p-4 font-semibold text-brand-ink shadow-sm ring-1 ring-brand-100 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:text-brand">
      {icon}{label}
    </Link>
  );
}
