import { sql, type Tx } from "./db";
import { now } from "./clock";
import { HttpError } from "./auth";
import { isClosed } from "./calendar";
import { prizeCode } from "./codes";
import { pickWeighted, randomSlot } from "./wheel";
import { dayContext } from "./game";
import { notify } from "./notify";
import { adminTopic, broadcast } from "./realtime";
import type { Participant } from "./types";

export type SpinResult = { slot: number; code: string; already?: boolean };

/** spin-wheel: sorteio no servidor. O cliente só anima até `slot`. */
export async function spinWheel(p: Participant, dayIndex: number): Promise<SpinResult> {
  const ctx = await dayContext(p, dayIndex);
  if (!ctx.day.has_wheel) throw new HttpError(400, "Este dia não tem roleta.");
  if (ctx.state !== "done") {
    throw new HttpError(400, ctx.state === "done_makeup"
      ? "A roleta não vale para dias feitos na recuperação."
      : "Conclua a dinâmica do dia para girar a roleta.");
  }
  if (isClosed(ctx.campaign, ctx.now)) throw new HttpError(400, "A campanha já foi encerrada.");

  const res = await sql.begin(async (tx: Tx) => {
    const [existing] = await tx<{ slot: number; code: string }[]>`
      select w.slot, a.code from sipatgo.wheel_spins w
        left join sipatgo.prize_awards a on a.wheel_spin_id = w.id
       where w.participant_id = ${p.id} and w.campaign_day_id = ${ctx.day.id}`;
    if (existing) return { ...existing, already: true, award: null };

    const prizes = await tx<{ id: string; internal_name: string; weight: number; stock_available: number; active: boolean }[]>`
      select id, internal_name, weight, stock_available, active from sipatgo.prizes
       where campaign_id = ${ctx.campaign.id} and active and stock_available > 0
       for update`;
    const prize = pickWeighted(prizes);
    if (!prize) throw new HttpError(409, "Os brindes acabaram! Procure o RH.");

    const slot = randomSlot();
    const [spin] = await tx<{ id: string }[]>`
      insert into sipatgo.wheel_spins (participant_id, campaign_day_id, prize_id, slot, created_at)
      values (${p.id}, ${ctx.day.id}, ${prize.id}, ${slot}, ${now()})
      on conflict (participant_id, campaign_day_id) do nothing
      returning id`;
    if (!spin) throw new HttpError(409, "Giro já registrado.");
    await tx`update sipatgo.prizes set stock_available = stock_available - 1 where id = ${prize.id}`;

    let code = prizeCode();
    for (let i = 0; i < 5; i++) {
      const [dup] = await tx`select 1 from sipatgo.prize_awards where code = ${code}`;
      if (!dup) break;
      code = prizeCode();
    }
    await tx`
      insert into sipatgo.prize_awards (participant_id, prize_id, wheel_spin_id, code, status)
      values (${p.id}, ${prize.id}, ${spin.id}, ${code}, 'pending')`;
    return { slot, code, already: false, award: { prize: prize.internal_name } };
  });

  if (res.award) {
    void notify({
      companyId: p.company_id, campaignId: ctx.campaign.id, event: "prize.awarded",
      data: { participant: p.name, sector: p.sector, email: p.email, prize: res.award.prize, code: res.code, day_index: dayIndex },
      dedupeKey: `prize:${res.code}`,
    });
    void broadcast(adminTopic(ctx.campaign.id));
  }
  return { slot: res.slot, code: res.code, already: res.already || undefined };
}

/** deliver-prize */
export async function deliverPrize(adminId: string, campaignId: string, awardIdOrCode: { id?: string; code?: string }) {
  const rows = await sql<{ id: string }[]>`
    update sipatgo.prize_awards a set status = 'delivered', delivered_at = ${now()}, delivered_by = ${adminId}
      from sipatgo.prizes pr
     where pr.id = a.prize_id and pr.campaign_id = ${campaignId}
       and a.status = 'pending'
       and (a.id::text = ${awardIdOrCode.id ?? ""} or a.code = ${awardIdOrCode.code ?? "--"})
     returning a.id`;
  return rows.length > 0;
}
