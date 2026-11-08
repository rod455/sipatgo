import { Check } from "lucide-react";
import type { Plan } from "@/content/site/pricing";
import { cn } from "@/lib/utils";
import { CtaButton } from "./CtaButton";

export function PricingCard({ plan, compact = false }: { plan: Plan; compact?: boolean }) {
  const hl = plan.highlight;
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl p-6 md:p-7",
        hl ? "bg-sg-navy-900 text-white shadow-xl ring-2 ring-sg-orange-500" : "bg-white text-sg-navy-900 shadow-sm ring-1 ring-sg-navy-900/10",
      )}
    >
      {hl ? (
        <span className="absolute -top-3 left-6 rounded-full bg-sg-yellow-400 px-3 py-1 text-xs font-bold text-sg-navy-900">Mais escolhido</span>
      ) : null}
      <p className={cn("text-sm font-semibold tracking-wide uppercase", hl ? "text-sg-orange-500" : "text-sg-navy-500")}>{plan.name}</p>
      <h3 className="mt-2 font-display text-2xl font-extrabold">{plan.range}</h3>
      <p className="mt-4 font-display text-3xl font-extrabold tabular">{plan.price}</p>
      <p className={cn("text-sm", hl ? "text-white/70" : "text-sg-gray-600")}>{plan.priceNote}</p>
      {!compact ? (
        <>
          <p className={cn("mt-4 text-sm leading-6", hl ? "text-white/80" : "text-sg-gray-600")}>{plan.description}</p>
          <ul className="mt-5 space-y-2.5">
            {plan.bullets.map((b) => (
              <li key={b} className="flex gap-2 text-sm">
                <Check aria-hidden className={cn("mt-0.5 size-4 shrink-0", hl ? "text-sg-green-500" : "text-sg-navy-500")} strokeWidth={3} />
                {b}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <div className="mt-auto pt-6">
        <CtaButton
          href={`/contato?plano=${encodeURIComponent(plan.name)}`}
          variant={hl ? "primary" : "outline"}
          className="w-full"
          trackLabel={`pricing_${plan.name}`}
        >
          {compact ? "Ver planos" : "Pedir orçamento"}
        </CtaButton>
      </div>
    </article>
  );
}
