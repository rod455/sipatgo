import { TZDate } from "@date-fns/tz";

/** Instante (Date) correspondente a uma data/hora local num fuso. */
export function zonedInstant(date: string, time: string, tz: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm, ss] = time.split(":").map(Number);
  const z = new TZDate(y, m - 1, d, hh || 0, mm || 0, ss || 0, tz);
  return new Date(z.getTime());
}

/** "YYYY-MM-DD" da data local de um instante no fuso. */
export function localDate(instant: Date, tz: string): string {
  const z = new TZDate(instant.getTime(), tz);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${z.getFullYear()}-${p(z.getMonth() + 1)}-${p(z.getDate())}`;
}

export function localHour(instant: Date, tz: string): number {
  return new TZDate(instant.getTime(), tz).getHours();
}

export function localMinutes(instant: Date, tz: string): number {
  const z = new TZDate(instant.getTime(), tz);
  return z.getHours() * 60 + z.getMinutes();
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export function weekdayName(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export function formatDateBR(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

export function formatDateTimeBR(instant: Date | string, tz: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: tz, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(new Date(instant));
}
