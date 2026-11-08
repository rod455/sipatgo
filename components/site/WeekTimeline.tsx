import { FerrisWheel } from "lucide-react";
import { WEEK } from "@/content/site/week";
import { cn } from "@/lib/utils";

/** Timeline seg→sex: horizontal no desktop, vertical no mobile. */
export function WeekTimeline({ showExtras = false, className }: { showExtras?: boolean; className?: string }) {
  return (
    <ol className={cn("relative grid gap-4 md:grid-cols-5 md:gap-3", className)}>
      <span aria-hidden className="absolute top-0 bottom-0 left-[27px] w-0.5 bg-sg-navy-900/10 md:top-[27px] md:right-8 md:bottom-auto md:left-8 md:h-0.5 md:w-auto" />
      {WEEK.map((d, i) => (
        <li key={d.short} className="relative flex gap-4 md:flex-col md:gap-3">
          <span
            className={cn(
              "relative z-10 inline-flex size-14 shrink-0 items-center justify-center rounded-2xl font-display text-base font-extrabold shadow-sm ring-4",
              i === 0 ? "bg-sg-navy-900 text-white ring-sg-sand-50" : "bg-white text-sg-navy-900 ring-sg-sand-50",
            )}
          >
            {d.short}
          </span>
          <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sg-navy-900/5">
            <div className="flex items-center gap-2">
              <d.icon aria-hidden className="size-5 text-sg-navy-500" strokeWidth={2} />
              <h3 className="font-display text-base font-bold text-sg-navy-900">{d.dynamic}</h3>
            </div>
            <p className="mt-1 text-sm text-sg-gray-600">{d.theme}</p>
            {d.wheel ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sg-yellow-400 px-2.5 py-0.5 text-xs font-bold text-sg-navy-900">
                <FerrisWheel aria-hidden className="size-3.5" strokeWidth={2} /> Roleta
                {d.short === "Sex" ? " + Pódio + Certificado" : ""}
              </p>
            ) : d.short === "Qui" ? (
              <p className="mt-2 inline-flex rounded-full bg-sg-sand-100 px-2.5 py-0.5 text-xs font-semibold text-sg-navy-900">Votação do mural</p>
            ) : null}
            {showExtras ? (
              <ul className="mt-3 space-y-1 border-t border-sg-navy-900/5 pt-3 text-xs text-sg-gray-600">
                {d.extras.map((e) => (
                  <li key={e}>· {e}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
