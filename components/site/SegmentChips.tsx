import Link from "next/link";
import { SEGMENTS } from "@/content/site/segments";
import { cn } from "@/lib/utils";

/** Chips por segmento, com link para o bloco correspondente em /para-quem. */
export function SegmentChips({ className }: { className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {SEGMENTS.map((s) => (
        <li key={s.slug}>
          <Link
            href={`/para-quem#${s.slug}`}
            className="group flex h-full items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sg-navy-900/5 transition hover:-translate-y-0.5 hover:ring-sg-orange-500/50"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-sg-sand-100">
              <s.icon aria-hidden className="size-5 text-sg-navy-500 group-hover:text-sg-orange-500" strokeWidth={2} />
            </span>
            <span className="font-display text-sm font-bold text-sg-navy-900 sm:text-base">{s.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
