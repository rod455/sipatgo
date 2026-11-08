import { requireViewer } from "@/lib/auth";
import { listPosts, votingDeadline } from "@/lib/wall";
import { loadCampaign, loadDays } from "@/lib/game";
import { now } from "@/lib/clock";
import { isClosed } from "@/lib/calendar";
import { storageEnabled } from "@/lib/storage";
import { formatDateTimeBR } from "@/lib/dates";
import { PageTitle } from "@/components/ui";
import { WallFeed } from "./WallFeed";

export default async function WallPage() {
  const { participant: p, company } = await requireViewer();
  const c = (await loadCampaign(p.campaign_id!))!;
  const days = await loadDays(c.id);
  const [approved, mine] = await Promise.all([listPosts(c.id, p.id), listPosts(c.id, p.id, { mine: true })]);
  const vd = votingDeadline(c, days);
  const t = now();
  return (
    <div>
      <PageTitle title="Mural" subtitle={c.wall_challenge ?? "Compartilhe a SIPAT com a sua equipe!"} />
      <WallFeed
        posts={JSON.parse(JSON.stringify(approved))}
        mine={JSON.parse(JSON.stringify(mine))}
        canPost={storageEnabled() && !isClosed(c, t)}
        canVote={t <= vd}
        votingUntil={formatDateTimeBR(vd, company.timezone)}
        meId={p.id}
      />
    </div>
  );
}
