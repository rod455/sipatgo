"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Alert, Button, Input, Label } from "@/components/ui";
import { api } from "@/components/ui/fetcher";
import { AvatarEditor } from "@/components/avatar/AvatarEditor";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

type Step = "cpf" | "pin" | "birth" | "consent" | "avatar" | "newpin";

function maskCpfInput(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function LoginFlow({ slug, brandColors, next }: { slug: string; brandColors: string[]; next?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("cpf");
  const [cpf, setCpf] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [birth, setBirth] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState<{ first_name: string; consent_text: string; needs_consent: boolean; needs_avatar: boolean; role: string } | null>(null);
  const [agree, setAgree] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);

  const go = (role?: string) => {
    const dest = next && next.startsWith("/") ? next : role === "admin" || role === "superadmin" ? "/admin" : "/app";
    router.replace(dest);
    router.refresh();
  };

  async function run(fn: () => Promise<void>) {
    setBusy(true); setErr("");
    try { await fn(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  const submitCpf = () => run(async () => {
    const r = await api<{ firstAccess: boolean }>("/api/auth/lookup", { slug, cpf });
    setStep(r.firstAccess ? "birth" : "pin");
    setTimeout(() => pinRef.current?.focus(), 50);
  });
  const submitPin = () => run(async () => {
    const r = await api<{ role: string }>("/api/auth/login", { slug, cpf, pin });
    go(r.role);
  });
  const submitBirth = () => run(async () => {
    const r = await api<NonNullable<typeof info>>("/api/auth/first-access", { slug, cpf, birth_date: birth });
    setInfo(r);
    setStep(r.needs_consent ? "consent" : r.needs_avatar ? "avatar" : "newpin");
  });
  const submitConsent = () => run(async () => {
    await api("/api/auth/consent", {});
    setStep(info?.needs_avatar ? "avatar" : "newpin");
  });
  const submitNewPin = () => run(async () => {
    if (pin !== pin2) throw new Error("Os PINs não conferem.");
    const r = await api<{ role: string }>("/api/auth/set-pin", { pin });
    go(r.role);
  });

  const back = () => { setErr(""); setPin(""); setStep("cpf"); };
  const pinLen = info?.role === "admin" || info?.role === "superadmin" ? "6" : "4 a 6";

  return (
    <div className="space-y-4">
      {step === "cpf" && (
        <form onSubmit={(e) => { e.preventDefault(); submitCpf(); }} className="space-y-4">
          <div>
            <Label htmlFor="cpf">Seu CPF</Label>
            <Input id="cpf" inputMode="numeric" autoComplete="username" placeholder="000.000.000-00" value={cpf}
              onChange={(e) => setCpf(maskCpfInput(e.target.value))} autoFocus className="h-14 text-lg tracking-wide" />
          </div>
          {err && <Alert>{err}</Alert>}
          <Button type="submit" size="lg" className="w-full" disabled={busy || cpf.replace(/\D/g, "").length !== 11}>
            {busy ? "Verificando..." : "Continuar"}
          </Button>
        </form>
      )}

      {step === "pin" && (
        <form onSubmit={(e) => { e.preventDefault(); submitPin(); }} className="space-y-4">
          <button type="button" onClick={back} className="flex items-center gap-1 text-sm text-slate-500"><ArrowLeft className="h-4 w-4" /> {cpf}</button>
          <div>
            <Label htmlFor="pin">Seu PIN</Label>
            <Input id="pin" ref={pinRef} type="password" inputMode="numeric" autoComplete="current-password" maxLength={6} value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className="h-14 text-center text-2xl tracking-[.5em]" />
          </div>
          {err && <Alert>{err}</Alert>}
          <Button type="submit" size="lg" className="w-full" disabled={busy || pin.length < 4}>{busy ? "Entrando..." : "Entrar"}</Button>
          <p className="text-center text-xs text-slate-500">Esqueceu o PIN? Peça ao RH para resetar.</p>
        </form>
      )}

      {step === "birth" && (
        <form onSubmit={(e) => { e.preventDefault(); submitBirth(); }} className="space-y-4">
          <button type="button" onClick={back} className="flex items-center gap-1 text-sm text-slate-500"><ArrowLeft className="h-4 w-4" /> {cpf}</button>
          <p className="text-sm text-slate-600">Primeiro acesso! Confirme sua data de nascimento para criar seu PIN.</p>
          <div>
            <Label htmlFor="birth">Data de nascimento</Label>
            <Input id="birth" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className="h-14 text-lg" max="2015-12-31" />
          </div>
          {err && <Alert>{err}</Alert>}
          <Button type="submit" size="lg" className="w-full" disabled={busy || !birth}>{busy ? "Conferindo..." : "Confirmar"}</Button>
        </form>
      )}

      {step === "consent" && info && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold">Olá, {info.first_name}! 👋</h2>
          <div className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <p className="whitespace-pre-line">{info.consent_text}</p>
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--brand-primary)]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>Li e concordo com o tratamento dos meus dados para a campanha.</span>
          </label>
          {err && <Alert>{err}</Alert>}
          <Button size="lg" className="w-full" disabled={!agree || busy} onClick={submitConsent}>Aceitar e continuar</Button>
        </div>
      )}

      {step === "avatar" && (
        <div className="space-y-3">
          <h2 className="font-display text-xl font-bold">Crie seu avatar</h2>
          <p className="text-sm text-slate-600">É ele que aparece no ranking. Dá para mudar depois no perfil.</p>
          <AvatarEditor initial={null} seed={cpf} brandColors={brandColors} saveLabel="Continuar" onSaved={() => setStep("newpin")} />
        </div>
      )}

      {step === "newpin" && (
        <form onSubmit={(e) => { e.preventDefault(); submitNewPin(); }} className="space-y-4">
          <div className="flex items-center gap-2"><Lock className="h-5 w-5 text-brand" /><h2 className="font-display text-xl font-bold">Crie seu PIN</h2></div>
          <p className="text-sm text-slate-600">Use {pinLen} números. Você vai entrar com CPF + PIN daqui pra frente.</p>
          <Input type="password" inputMode="numeric" autoComplete="new-password" placeholder="PIN" maxLength={6} value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className="h-14 text-center text-2xl tracking-[.5em]" autoFocus />
          <Input type="password" inputMode="numeric" autoComplete="new-password" placeholder="Repita o PIN" maxLength={6} value={pin2}
            onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} className="h-14 text-center text-2xl tracking-[.5em]" />
          {err && <Alert>{err}</Alert>}
          <Button type="submit" size="lg" className="w-full" disabled={busy || pin.length < 4}>{busy ? "Salvando..." : "Começar a jogar"}</Button>
        </form>
      )}
    </div>
  );
}
