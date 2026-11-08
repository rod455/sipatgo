import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  return process.env.CHECKIN_HMAC_SECRET || process.env.SESSION_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-checkin-secret";
}

function sign(eventId: string, eventSecret: string): string {
  return createHmac("sha256", secret()).update(`${eventId}.${eventSecret}`).digest("base64url").slice(0, 22);
}

/** Token que vai no QR code: "{event_id}.{hmac}" */
export function checkinToken(eventId: string, eventSecret: string): string {
  return `${eventId}.${sign(eventId, eventSecret)}`;
}

export function parseCheckinToken(token: string): { eventId: string; mac: string } | null {
  const m = /^([0-9a-f-]{36})\.([A-Za-z0-9_-]{10,})$/.exec((token ?? "").trim());
  return m ? { eventId: m[1], mac: m[2] } : null;
}

export function verifyCheckinMac(eventId: string, eventSecret: string, mac: string): boolean {
  const expected = Buffer.from(sign(eventId, eventSecret));
  const got = Buffer.from(mac);
  return expected.length === got.length && timingSafeEqual(expected, got);
}
