"use client";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function api<T = unknown>(url: string, data?: unknown, method?: string): Promise<T> {
  const res = await fetch(url, {
    method: method ?? (data === undefined ? "GET" : "POST"),
    headers: data instanceof FormData || data === undefined ? undefined : { "content-type": "application/json" },
    body: data === undefined ? undefined : data instanceof FormData ? data : JSON.stringify(data),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined" && !url.startsWith("/api/auth")) window.location.href = "/login";
    throw new ApiError(res.status, json.error ?? "Erro inesperado.");
  }
  return json as T;
}
