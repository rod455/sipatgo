"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Briefcase, HardHat } from "lucide-react";
import { LoginFlow } from "@/components/auth/LoginFlow";
import { Alert, Button, Input, Label } from "@/components/ui";
import { api } from "@/components/ui/fetcher";
import { cn } from "@/lib/utils";

type Tab = "colaborador" | "rh";

export function LoginTabs({ next }: { next?: string }) {
  const [tab, setTab] = useState<Tab>("colaborador");
  return (
    <div>
      <div role="tablist" aria-label="Tipo de acesso" className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
        {([["colaborador", "Sou colaborador", HardHat], ["rh", "Sou empresa", Briefcase]] as const).map(([k, label, Icon]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={cn("flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition",
              tab === k ? "bg-white text-[var(--sg-navy-900)] shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      {tab === "colaborador" ? (
        <div>
          <p className="mb-4 text-sm text-slate-600">Entre com seu CPF e sua senha.</p>
          <LoginFlow next={next} />
        </div>
      ) : (
        <RhLogin next={next} />
      )}
    </div>
  );
}

function RhLogin({ next }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "link" | "sent">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run(fn: () => Promise<void>) {
    setBusy(true); setErr("");
    try { await fn(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  if (mode === "sent") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-[var(--brand-50)] p-4 text-sm leading-relaxed text-[var(--sg-navy-900)]">
          <p className="font-bold">Confira seu e-mail</p>
          <p className="mt-1">Se <b>{email}</b> tiver acesso ao painel, enviamos um link para você criar sua senha. Ele vale por 1 hora. Não chegou? Veja a caixa de spam.</p>
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={() => { setMode("login"); setErr(""); }}>Voltar para o login</Button>
      </div>
    );
  }

  if (mode === "link") {
    return (
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run(async () => {
        await api("/api/auth/rh-reset-request", { email });
        setMode("sent");
      }); }}>
        <button type="button" onClick={() => { setMode("login"); setErr(""); }} className="flex items-center gap-1 text-sm text-slate-500"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <p className="text-sm text-slate-600">Primeiro acesso ou esqueceu a senha? Informe seu e-mail e enviaremos um link para criar uma nova senha.</p>
        <div><Label htmlFor="rh-email">E-mail</Label><Input id="rh-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus className="h-12" /></div>
        {err && <Alert>{err}</Alert>}
        <Button type="submit" size="lg" className="w-full" disabled={busy || !email}>{busy ? "Enviando..." : "Enviar link"}</Button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run(async () => {
      const r = await api<{ role: string }>("/api/auth/rh-login", { email, password });
      router.replace(next && next.startsWith("/") ? next : r.role === "admin" || r.role === "superadmin" ? "/admin" : "/app");
      router.refresh();
    }); }}>
      <p className="text-sm text-slate-600">Acesso ao painel da campanha.</p>
      <div><Label htmlFor="rh-email">E-mail</Label><Input id="rh-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus className="h-12" /></div>
      <div><Label htmlFor="rh-pass">Senha</Label><Input id="rh-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" /></div>
      {err && <Alert>{err}</Alert>}
      <Button type="submit" size="lg" className="w-full" disabled={busy || !email || !password}>{busy ? "Entrando..." : "Entrar no painel"}</Button>
      <button type="button" onClick={() => { setMode("link"); setErr(""); }} className="w-full text-center text-sm font-semibold text-[var(--sg-orange-600)] hover:underline">
        Primeiro acesso ou esqueci a senha
      </button>
    </form>
  );
}
