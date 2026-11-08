"use client";

import { useState, useTransition } from "react";
import Papa from "papaparse";
import { validateRows, CSV_TEMPLATE, type ParsedRow } from "@/lib/csv-import";
import { importParticipants } from "@/app/admin/participantes/actions";
import { maskCpf } from "@/lib/cpf";
import { Alert, Button, Pill } from "@/components/ui";
import { Upload, Download } from "lucide-react";

export function CsvImporter() {
  const [table, setTable] = useState<string[][] | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function onFile(f: File) {
    setMsg(null);
    Papa.parse<string[]>(f, {
      skipEmptyLines: true,
      complete: (res) => {
        const t = res.data as string[][];
        setTable(t);
        setRows(validateRows(t));
      },
      error: () => setMsg({ ok: false, text: "Não foi possível ler o arquivo." }),
    });
  }

  const bad = rows.filter((r) => r.errors.length);
  const download = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "modelo-participantes.csv"; a.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 font-semibold text-brand-fg">
          <Upload className="h-4 w-4" /> Escolher CSV
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
        <Button variant="outline" onClick={download}><Download className="h-4 w-4" /> Baixar modelo</Button>
      </div>
      <p className="text-xs text-slate-500">Colunas: <code>nome, cpf, data_nascimento, setor, email (opcional), lider (S/N)</code>. CPF já cadastrado é atualizado e passa para esta campanha.</p>
      {table && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Pill tone="blue">{rows.length} linhas</Pill>
            {bad.length ? <Pill tone="red">{bad.length} com erro</Pill> : <Pill tone="green">tudo certo</Pill>}
            <Pill>{rows.filter((r) => r.leader).length} líderes</Pill>
            <Pill>{new Set(rows.map((r) => r.sector)).size} setores</Pill>
          </div>
          <div className="max-h-80 overflow-auto rounded-xl ring-1 ring-slate-200">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-100 text-left"><tr><th className="p-2">Linha</th><th>Nome</th><th>CPF</th><th>Nascimento</th><th>Setor</th><th>Líder</th><th>Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {[...bad, ...rows.filter((r) => !r.errors.length)].slice(0, 300).map((r) => (
                  <tr key={r.line} className={r.errors.length ? "bg-red-50" : ""}>
                    <td className="p-2 text-slate-400">{r.line}</td><td>{r.name}</td><td>{maskCpf(r.cpf)}</td><td>{r.birth_date}</td><td>{r.sector}</td><td>{r.leader ? "S" : ""}</td>
                    <td className="text-red-700">{r.errors.join(", ") || "✓"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button disabled={!!bad.length || !rows.length || pending} onClick={() => start(async () => {
            const r = await importParticipants(table);
            setMsg({ ok: r.ok, text: r.ok ? r.message ?? "Importado" : r.error ?? "Erro" });
            if (r.ok) { setTable(null); setRows([]); }
          })}>{pending ? "Importando..." : `Importar ${rows.length} participantes`}</Button>
        </div>
      )}
      {msg && <Alert tone={msg.ok ? "green" : "red"}>{msg.text}</Alert>}
    </div>
  );
}
