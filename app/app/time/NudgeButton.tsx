"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Alert, Button } from "@/components/ui";
import { api } from "@/components/ui/fetcher";

export function NudgeButton({ disabled, pending }: { disabled: boolean; pending: number }) {
  const [done, setDone] = useState(disabled);
  const [msg, setMsg] = useState<{ tone: "green" | "red"; text: string } | null>(null);
  async function go() {
    try {
      const r = await api<{ sent: number; withEmail: number }>("/api/team/nudge", {});
      setDone(true);
      setMsg({ tone: "green", text: `Lembrete enviado para ${r.sent} pessoa(s) (${r.withEmail} com e-mail cadastrado).` });
    } catch (e) { setMsg({ tone: "red", text: (e as Error).message }); }
  }
  return (
    <div className="space-y-2">
      <Button className="w-full" variant="secondary" onClick={go} disabled={done || pending === 0}>
        <Bell className="h-4 w-4" /> {done ? "Lembrete de hoje já enviado" : pending ? `Lembrar ${pending} pendente(s)` : "Todo mundo jogou hoje 🎉"}
      </Button>
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
    </div>
  );
}
