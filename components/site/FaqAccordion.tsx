import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/content/site/faq";
import { cn } from "@/lib/utils";
import { JsonLd } from "./JsonLd";

/** Acordeão nativo (<details>), sem JS. Emite o schema FAQPage por padrão. */
export function FaqAccordion({ items, schema = true, className }: { items: FaqItem[]; schema?: boolean; className?: string }) {
  return (
    <div className={cn("divide-y divide-sg-navy-900/10 rounded-2xl bg-white shadow-sm ring-1 ring-sg-navy-900/5", className)}>
      {items.map((it) => (
        <details key={it.q} className="group px-5 md:px-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-display text-base font-bold text-sg-navy-900 md:text-lg">
            {it.q}
            <ChevronDown aria-hidden className="size-5 shrink-0 text-sg-navy-500 transition group-open:rotate-180" strokeWidth={2} />
          </summary>
          <p className="pb-5 text-base leading-7 text-sg-gray-600">{it.a}</p>
        </details>
      ))}
      {schema ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((it) => ({
              "@type": "Question",
              name: it.q,
              acceptedAnswer: { "@type": "Answer", text: it.a },
            })),
          }}
        />
      ) : null}
    </div>
  );
}
