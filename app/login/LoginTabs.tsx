"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Briefcase, HardHat } from "lucide-react";
import { LoginFlow } from "@/components/auth/LoginFlow";
import { Alert, Button, Input, Label } from "@/components/ui";
import { api } from "@/components/ui/fetcher";
import { cn } from "@/lib/utils";

type Tab = "colaborador" | "rh";

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function LoginTabs({ next }: { next?: string }) {
  const [tab, setTab] = useState<Tab>("colaborador");
  return (
    <div>
      <div role="tablist" aria-label="Tipo de acesso" className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
        {([["colaborador", "Sou colaborador", HardHat], ["rh", "Sou RH", Briefcase]] as const).map(([k, label, Icon]) => (
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
  const [mode, setMode] = useState<"login" | "first">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [cpf, setCpf] = useState("");
  const [birth, setBirth] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const done = (role: string) => {
    router.replace(next && next.startsWith("/") ? next : role === "admin" || role === "superadmin" ? "/admin" : "/app");
    router.refresh();
  };
  async function run(fn: () => Promise<void>) {
    setBusy(true); setErr("");
    try { await fn(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  if (mode === "first") {
    return (
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run(async () => {
        if (password !== password2) throw new Error("As senhas não conferem.");
        const r = await api<{ role: string }>("/api/auth/rh-password", { email, cpf, birth_date: birth, password });
        done(r.role);
      }); }}>
        <button type="button" onClick={() => { setMode("login"); setErr(""); }} className="flex items-center gap-1 text-sm text-slate-500"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <p className="text-sm text-slate-600">Primeiro acesso do RH: confirme seus dados e crie uma senha.</p>
        <div><Label htmlFor="rh-email">E-mail</Label><Input id="rh-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="rh-cpf">CPF</Label><Input id="rh-cpf" inputMode="numeric" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} className="h-12" /></div>
          <div><Label htmlFor="rh-birth">Nascimento</Label><Input id="rh-birth" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className="h-12" /></div>
        </div>
        <div><Label htmlFor="rh-new">Nova senha</Label><Input id="rh-new" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" /></div>
        <div><Label htmlFor="rh-new2">Repita a senha</Label><Input id="rh-new2" type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="h-12" /></div>
        <p className="text-xs text-slate-500">Mínimo de 8 caracteres, com letras e números.</p>
        {err && <Alert>{err}</Alert>}
        <Button type="submit" size="lg" className="w-full" disabled={busy || !email || cpf.replace(/\D/g, "").length !== 11 || !birth || password.length < 8}>
          {busy ? "Salvando..." : "Criar senha e entrar"}
        </Button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run(async () => {
      const r = await api<{ role: string }>("/api/auth/rh-login", { email, password });
      done(r.role);
    }); }}>
      <p className="text-sm text-slate-600">Acesso ao painel da campanha para RH, SESMT e CIPA.</p>
      <div><Label htmlFor="rh-email">E-mail</Label><Input id="rh-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus className="h-12" /></div>
      <div><Label htmlFor="rh-pass">Senha</Label><Input id="rh-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" /></div>
      {err && <Alert>{err}</Alert>}
      <Button type="submit" size="lg" className="w-full" disabled={busy || !email || !password}>{busy ? "Entrando..." : "Entrar no painel"}</Button>
      <button type="button" onClick={() => { setMode("first"); setErr(""); }} className="w-full text-center text-sm font-semibold text-[var(--sg-orange-600)] hover:underline">
        Primeiro acesso? Crie sua senha
      </button>
    </form>
  );
}
