"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Input, Label } from "@/components/ui";
import { api } from "@/components/ui/fetcher";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <form className="space-y-4" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setErr("");
      try {
        if (password !== password2) throw new Error("As senhas não conferem.");
        await api("/api/auth/rh-reset", { token, password });
        router.replace("/admin"); router.refresh();
      } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
    }}>
      <p className="text-sm text-slate-600">Mínimo de 8 caracteres, com letras e números. Depois você entra com seu e-mail e esta senha.</p>
      <div><Label htmlFor="pw">Nova senha</Label><Input id="pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus className="h-12" /></div>
      <div><Label htmlFor="pw2">Repita a senha</Label><Input id="pw2" type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="h-12" /></div>
      {err && <Alert>{err}</Alert>}
      <Button type="submit" size="lg" className="w-full" disabled={busy || password.length < 8}>{busy ? "Salvando..." : "Salvar senha e entrar"}</Button>
      <p className="text-center text-xs text-slate-500"><Link href="/login" className="hover:underline">Voltar para o login</Link></p>
    </form>
  );
}
