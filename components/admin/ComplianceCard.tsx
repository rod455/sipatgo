import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import type { ComplianceItem } from "@/lib/compliance";
import { Card, Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

const LEVEL = { obrigatorio: "Obrigatório", recomendado: "Recomendado", lembrete: "Lembrete" } as const;

export function ComplianceCard({ items, compact }: { items: ComplianceItem[]; compact?: boolean }) {
  const pending = items.filter((i) => !i.ok && i.level === "obrigatorio").length;
  return (
    <Card className={cn("space-y-3", pending ? "ring-1 ring-amber-300" : "")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display font-bold">Conformidade com a NR-5</h2>
        {pending ? <Pill tone="amber">{pending} pendência(s) obrigatória(s)</Pill> : <Pill tone="green">Itens obrigatórios ok</Pill>}
      </div>
      <ul className="space-y-2">
        {items.filter((i) => !compact || !i.ok || i.level === "obrigatorio").map((i) => (
          <li key={i.key} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm">
            {i.level === "lembrete" ? <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              : i.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />}
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{i.label} <span className="font-normal text-slate-500">· {i.reference}</span></p>
              <p className="text-slate-600">{i.detail}</p>
            </div>
            <span className="ml-auto shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{LEVEL[i.level]}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500">Conferido com o texto oficial da NR-5 (gov.br, com a Portaria MTP nº 4.219/2022). A NR-5 não define formato para a SIPAT; recomendamos a SIPAT híbrida. Valide com o SESMT ou jurídico.</p>
    </Card>
  );
}
