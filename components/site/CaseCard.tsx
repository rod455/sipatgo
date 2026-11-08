import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CaseStudy } from "@/content/site/cases";

export function IllustrativeBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-sg-yellow-400 px-3 py-1 text-xs font-bold tracking-wide text-sg-navy-900 uppercase">
      Exemplo ilustrativo
    </span>
  );
}

/** Card de case: logo, nº de trabalhadores, % adesão, acerto médio. */
export function CaseCard({ item }: { item: CaseStudy }) {
  const adesao = item.results.find((r) => r.label === "Adesão")?.value ?? "—";
  const acerto = item.results.find((r) => r.label.startsWith("Acerto"))?.value ?? "—";
  return (
    <Link
      href={`/cases/${item.slug}`}
      className="group flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sg-navy-900/5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="inline-flex size-12 items-center justify-center rounded-xl text-sm font-extrabold text-white"
          style={{ background: `linear-gradient(135deg, ${item.brand.primary}, ${item.brand.secondary})` }}
        >
          {item.company
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)}
        </span>
        {item.illustrative ? <IllustrativeBadge /> : null}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-sg-navy-900">{item.company}</h3>
      <p className="text-sm text-sg-gray-600">
        {item.sector} · {item.people} pessoas
      </p>
      <p className="mt-3 flex-1 text-sm leading-6 text-sg-gray-600">{item.summary}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-sg-navy-900/5 pt-4">
        <div>
          <dt className="text-xs text-sg-gray-600">Adesão</dt>
          <dd className="font-display text-2xl font-extrabold text-sg-navy-900 tabular">{adesao}</dd>
        </div>
        <div>
          <dt className="text-xs text-sg-gray-600">Acerto médio</dt>
          <dd className="font-display text-2xl font-extrabold text-sg-navy-900 tabular">{acerto}</dd>
        </div>
      </dl>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sg-navy-500 group-hover:underline">
        Ver case <ArrowRight aria-hidden className="size-4" />
      </span>
    </Link>
  );
}
