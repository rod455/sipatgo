import { requireViewer } from "@/lib/auth";
import { sql } from "@/lib/db";
import { RankingBoard } from "@/components/ranking/RankingBoard";
import { PageTitle } from "@/components/ui";

export default async function RankingPage() {
  const { participant: p } = await requireViewer();
  const badges = await sql<{ code: string; icon: string }[]>`select code, icon from sipatgo.badges`;
  const days = await sql<{ day_index: number }[]>`select day_index from sipatgo.campaign_days where campaign_id = ${p.campaign_id} order by day_index`;
  return (
    <div>
      <PageTitle title="Ranking" subtitle="Desempate: quem respondeu mais rápido. Setor: média de todos, inclusive quem ainda não jogou." />
      <RankingBoard campaignId={p.campaign_id!} badgeIcons={Object.fromEntries(badges.map((b) => [b.code, b.icon]))} days={days.map((d) => d.day_index)} />
    </div>
  );
}
