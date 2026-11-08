import { BarChart3, Gift, Image as ImageIcon, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_CLIENT } from "@/content/site/demo-client";

const SECTORS = [
  { name: "Manutenção", pct: 92 },
  { name: "Usinagem", pct: 85 },
  { name: "Montagem", pct: 81 },
  { name: "Qualidade", pct: 76 },
  { name: "Logística", pct: 64 },
  { name: "Administrativo", pct: 58 },
];

const FUNNEL = [
  { label: "Acessou", v: 104 },
  { label: "Vídeo", v: 98 },
  { label: "Dinâmica", v: 93 },
  { label: "Roleta", v: 90 },
];

/** Painel do RH em HTML/CSS: adesão por setor, KPIs e funil do dia (dados fictícios). */
export function AdminMockup({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label={`Painel do RH com a marca fictícia ${DEMO_CLIENT.name}: adesão por setor, indicadores e funil do dia`}
      className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-sg-navy-900/20", className)}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400" aria-hidden />
        <span className="size-2.5 rounded-full bg-amber-400" aria-hidden />
        <span className="size-2.5 rounded-full bg-green-400" aria-hidden />
        <span className="ml-3 truncate rounded-md bg-white px-3 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
          horizonte.sipatgo.com.br/admin
        </span>
      </div>
      <div className="flex">
        <aside className="hidden w-36 shrink-0 flex-col gap-1 p-3 text-[11px] text-white sm:flex" style={{ background: DEMO_CLIENT.primary }}>
          <span className="mb-2 font-extrabold">{DEMO_CLIENT.name}</span>
          {["Dashboard", "Campanha", "Dias", "Participantes", "Brindes", "Presença", "Relatórios"].map((l, i) => (
            <span key={l} className={cn("rounded-md px-2 py-1", i === 0 ? "bg-white/20 font-bold" : "opacity-80")}>
              {l}
            </span>
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-extrabold">Quarta · Dia 3 de 5</p>
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
              <span className="size-1.5 animate-pulse rounded-full bg-red-600" aria-hidden /> AO VIVO
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              { icon: Users, label: "Adesão hoje", value: "78%" },
              { icon: BarChart3, label: "Acumulada", value: "86%" },
              { icon: Gift, label: "Brindes p/ entregar", value: "6" },
              { icon: ImageIcon, label: "Posts p/ moderar", value: "3" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-200">
                <k.icon className="size-3.5 text-slate-500" aria-hidden />
                <p className="mt-1 font-display text-lg leading-none font-extrabold tabular">{k.value}</p>
                <p className="mt-1 truncate text-[10px] text-slate-500">{k.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-[11px] font-bold text-slate-600">Adesão por setor (acumulado)</p>
              <ul className="mt-2 space-y-1.5">
                {SECTORS.map((s) => (
                  <li key={s.name} className="grid grid-cols-[84px_1fr_32px] items-center gap-2 text-[11px]">
                    <span className="truncate text-slate-600">{s.name}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <span className="block h-full rounded-full" style={{ width: `${s.pct}%`, background: DEMO_CLIENT.secondary }} />
                    </span>
                    <span className="text-right font-bold tabular">{s.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-600">Funil de hoje</p>
              <ul className="mt-2 space-y-1.5">
                {FUNNEL.map((f) => (
                  <li key={f.label} className="text-[11px]">
                    <span
                      className="flex h-5 items-center justify-between rounded-md px-2 font-semibold text-white"
                      style={{ width: `${(f.v / 120) * 100}%`, minWidth: "60%", background: DEMO_CLIENT.primary }}
                    >
                      <span>{f.label}</span>
                      <span className="tabular">{f.v}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
