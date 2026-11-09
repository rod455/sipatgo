import { addDays, zonedInstant } from "./dates";

export type CampaignClock = {
  start_date: string;
  end_date: string;
  release_time: string; // "08:00" ou "08:00:00"
  makeup_deadline: Date | string | null;
  status: "draft" | "scheduled" | "active" | "closed" | string;
  timezone: string;
};

export type DayClock = { day_index: number; date: string };

export type DayState = "locked" | "available" | "makeup" | "done" | "done_makeup" | "missed";

export function makeupDeadline(c: CampaignClock): Date {
  if (c.makeup_deadline) return new Date(c.makeup_deadline);
  return zonedInstant(c.end_date, "18:00", c.timezone);
}

export function releaseAt(c: CampaignClock, d: DayClock): Date {
  return zonedInstant(d.date, c.release_time, c.timezone);
}

/** Fim do "dia certo": meia-noite local seguinte (limitado ao prazo final). */
export function dayEndsAt(c: CampaignClock, d: DayClock): Date {
  const midnight = zonedInstant(addDays(d.date, 1), "00:00", c.timezone);
  const deadline = makeupDeadline(c);
  return midnight < deadline ? midnight : deadline;
}

export function isClosed(c: CampaignClock, now: Date): boolean {
  return c.status === "closed" || now >= makeupDeadline(c);
}

export type CampaignPhase = "draft" | "upcoming" | "running" | "closed";

export function campaignPhase(c: CampaignClock, now: Date, firstDay?: DayClock): CampaignPhase {
  if (c.status === "draft") return "draft";
  if (isClosed(c, now)) return "closed";
  const first = firstDay ?? { day_index: 1, date: c.start_date };
  if (now < releaseAt(c, first)) return "upcoming";
  return "running";
}

/** O dia, neste instante, só pode ser feito como recuperação? */
export function isMakeupNow(c: CampaignClock, d: DayClock, now: Date): boolean {
  return now >= dayEndsAt(c, d);
}

export function dayState(
  c: CampaignClock,
  d: DayClock,
  now: Date,
  completion?: { is_makeup: boolean } | null,
  /** Participante de teste: todos os dias abertos (exceto campanha encerrada). */
  preview = false,
): DayState {
  if (completion) return completion.is_makeup ? "done_makeup" : "done";
  if (preview && c.status !== "closed") return "available";
  if (c.status === "draft") return "locked";
  if (now < releaseAt(c, d)) return "locked";
  if (isClosed(c, now)) return "missed";
  if (now < dayEndsAt(c, d)) return "available";
  return "makeup";
}

/** Pode jogar (pontuar) agora? */
export function canPlay(state: DayState): boolean {
  return state === "available" || state === "makeup";
}
