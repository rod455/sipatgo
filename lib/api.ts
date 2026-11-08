import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "./auth";

export function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

/** Envolve um handler: HttpError → status; ZodError → 400; resto → 500. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response | unknown>) {
  return async (...args: A): Promise<Response> => {
    try {
      const r = await fn(...args);
      return r instanceof Response ? r : NextResponse.json(r ?? { ok: true });
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
      console.error("[api]", e);
      return NextResponse.json({ error: "Algo deu errado. Tente de novo em instantes." }, { status: 500 });
    }
  };
}

export async function body<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, "Requisição inválida.");
  }
}
