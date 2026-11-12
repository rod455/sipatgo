import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "sg_session";

export type SessionPayload = {
  pid: string;            // participant id
  cid: string;            // company id
  v: number;              // session_version
  stage: "full" | "onboarding";
};

function key(): Uint8Array {
  // SESSION_SECRET é o recomendado; na falta dele, usa um segredo de servidor
  // já injetado pela integração Supabase (nunca exposto ao navegador).
  const s = process.env.SESSION_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!s && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET não configurado");
  return new TextEncoder().encode(s || "dev-only-insecure-session-secret-change-me");
}

export async function signSession(p: SessionPayload): Promise<string> {
  return new SignJWT({ ...p })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(p.stage === "full" ? "30d" : "2h")
    .sign(key());
}

export async function readSessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (typeof payload.pid !== "string" || typeof payload.cid !== "string") return null;
    return { pid: payload.pid, cid: payload.cid, v: Number(payload.v), stage: payload.stage === "full" ? "full" : "onboarding" };
  } catch {
    return null;
  }
}

export async function setSession(p: SessionPayload) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(p), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: p.stage === "full" ? 60 * 60 * 24 * 30 : 60 * 60 * 2,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  // contexto do painel (empresa/campanha escolhidas) também sai
  jar.delete("sg_admin_company");
  jar.delete("sg_admin_campaign");
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}
