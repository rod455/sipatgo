import { Check, Lock, Play } from "lucide-react";
import type { Segment } from "@/content/site/segments";

/** Mini tela da plataforma com as cores de uma marca fictícia do segmento. */
export function SegmentPreview({ segment }: { segment: Segment }) {
  const { name, primary, secondary } = segment.demoBrand;
  const initials = name
    .split(" ")
    .filter((w) => w.length > 2)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div role="img" aria-label={`Exemplo da plataforma com a marca fictícia ${name}`} className="mx-auto w-full max-w-xs overflow-hidden rounded-3xl border-8 border-slate-900 bg-slate-50 shadow-xl">
      <div className="flex items-center gap-2 px-4 py-3 text-white" style={{ background: primary }}>
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-white text-[11px] font-extrabold" style={{ color: primary }} aria-hidden>
          {initials}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[11px] opacity-90">{name}</p>
          <p className="truncate text-[13px] font-bold">{segment.themeExample}</p>
        </div>
      </div>
      <ul className="space-y-2 p-4">
        {["Seg", "Ter", "Qua", "Qui", "Sex"].map((d, i) => (
          <li
            key={d}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px]"
            style={i === 1 ? { background: secondary, borderColor: secondary, color: "#fff" } : undefined}
          >
            <b className="w-8">{d}</b>
            <span className="flex-1 truncate opacity-80">{i === 0 ? "Concluído" : i === 1 ? "Disponível hoje" : "Bloqueado"}</span>
            {i === 0 ? (
              <Check className="size-4 text-green-700" strokeWidth={3} aria-hidden />
            ) : i === 1 ? (
              <Play className="size-4" strokeWidth={3} aria-hidden />
            ) : (
              <Lock className="size-4 text-slate-400" aria-hidden />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
