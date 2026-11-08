"use client";

import { useState, useTransition } from "react";
import { Alert, Button, Input, Label, Select, Textarea } from "@/components/ui";
import { saveFamily } from "@/app/admin/dias/actions";

type Q = { question: string; options: string[]; correct_index: number };

export function FamilyEditor({ dayId, initial }: { dayId: string; initial: { type: string; config: Record<string, unknown> } | null }) {
  const [type, setType] = useState(initial?.type ?? "word_search");
  const [title, setTitle] = useState(String(initial?.config.title ?? ""));
  const [words, setWords] = useState(((initial?.type === "word_search" ? initial.config.words : null) as string[] | null)?.join(", ") ?? "");
  const [items, setItems] = useState<Q[]>(() =>
    (initial?.type === "light_quiz" ? (initial.config.items as Q[]) : null) ?? Array.from({ length: 5 }, () => ({ question: "", options: ["", "", ""], correct_index: 0 })));
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = () => start(async () => {
    const config = type === "word_search"
      ? { title, words: words.split(/[,\n;]/).map((w) => w.trim()).filter(Boolean) }
      : { title, items };
    const r = await saveFamily(dayId, { type, config });
    setMsg({ ok: r.ok, text: r.ok ? r.message ?? "Salvo" : r.error ?? "Erro" });
  });

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Tipo</Label><Select value={type} onChange={(e) => setType(e.target.value)}><option value="word_search">Caça-palavras (10×10)</option><option value="light_quiz">Quiz leve (5 perguntas)</option></Select></div>
        <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Caça-palavras da prevenção" /></div>
      </div>
      {type === "word_search" ? (
        <div><Label>Palavras (6 a 8, até 10 letras, separadas por vírgula)</Label>
          <Textarea rows={2} value={words} onChange={(e) => setWords(e.target.value)} placeholder="CAPACETE, LUVA, ÓCULOS, BOTA, CIPA, RISCO" /></div>
      ) : items.map((q, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 p-3">
          <Input placeholder={`Pergunta ${i + 1}`} value={q.question} onChange={(e) => setItems(items.map((x, k) => (k === i ? { ...x, question: e.target.value } : x)))} />
          {q.options.map((o, j) => (
            <div key={j} className="flex items-center gap-2">
              <input type="radio" name={`fq-${i}`} checked={q.correct_index === j} onChange={() => setItems(items.map((x, k) => (k === i ? { ...x, correct_index: j } : x)))} />
              <Input placeholder={`Opção ${j + 1}`} value={o} onChange={(e) => setItems(items.map((x, k) => (k === i ? { ...x, options: x.options.map((y, m) => (m === j ? e.target.value : y)) } : x)))} />
            </div>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={pending}>{pending ? "Salvando..." : "Salvar game"}</Button>
        {msg && (msg.ok ? <span className="text-sm text-green-700">{msg.text}</span> : <Alert>{msg.text}</Alert>)}
      </div>
    </div>
  );
}
