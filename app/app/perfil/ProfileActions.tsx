"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AvatarEditor } from "@/components/avatar/AvatarEditor";
import { Alert, Button, Card, Input } from "@/components/ui";
import { api } from "@/components/ui/fetcher";
import type { AvatarConfig } from "@/lib/types";

export function ProfileActions({ avatar, seed, brandColors }: { avatar: AvatarConfig | null; seed: string; brandColors: string[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"none" | "avatar" | "pin">("none");
  const [cur, setCur] = useState(""); const [pin, setPin] = useState(""); const [pin2, setPin2] = useState("");
  const [msg, setMsg] = useState<{ tone: "green" | "red"; text: string } | null>(null);

  async function changePin() {
    setMsg(null);
    try {
      if (pin !== pin2) throw new Error("Os PINs não conferem.");
      await api("/api/auth/set-pin", { pin, current_pin: cur });
      setMsg({ tone: "green", text: "PIN alterado!" }); setMode("none"); setCur(""); setPin(""); setPin2("");
    } catch (e) { setMsg({ tone: "red", text: (e as Error).message }); }
  }
  async function logout() {
    await api("/api/auth/logout", {});
    router.replace("/login"); router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" onClick={() => setMode(mode === "avatar" ? "none" : "avatar")}>Editar avatar</Button>
        <Button variant="outline" size="sm" onClick={() => setMode(mode === "pin" ? "none" : "pin")}>Alterar PIN</Button>
        <Button variant="ghost" size="sm" onClick={logout}>Sair</Button>
      </div>
      {mode === "avatar" && <Card><AvatarEditor initial={avatar} seed={seed} brandColors={brandColors} onSaved={() => { setMode("none"); router.refresh(); }} /></Card>}
      {mode === "pin" && (
        <Card className="space-y-2">
          <Input type="password" inputMode="numeric" placeholder="PIN atual" maxLength={6} value={cur} onChange={(e) => setCur(e.target.value.replace(/\D/g, ""))} />
          <Input type="password" inputMode="numeric" placeholder="Novo PIN" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
          <Input type="password" inputMode="numeric" placeholder="Repita o novo PIN" maxLength={6} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} />
          <Button className="w-full" onClick={changePin} disabled={pin.length < 4 || cur.length < 4}>Salvar PIN</Button>
        </Card>
      )}
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
    </div>
  );
}
