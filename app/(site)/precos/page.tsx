import type { Metadata } from "next";
import { Check, Plus } from "lucide-react";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { PricingCard } from "@/components/site/PricingCard";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMetadata } from "@/components/site/seo";
import { PRICING_FAQ } from "@/content/site/faq";
import { ADDONS, INCLUDED, PLANS } from "@/content/site/pricing";

export const metadata: Metadata = pageMetadata({
  title: "Preços — SipatGo",
  description: "Planos da SipatGo por faixa de participantes: até 150, até 500 e acima de 500. Tudo incluso, cobrança por campanha, sem mensalidade.",
  path: "/precos",
  keywords: ["sipat preço", "quanto custa sipat online", "preço plataforma sipat", "orçamento sipat"],
});

export default function PrecosPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Preços", path: "/precos" }]}
        eyebrow="Preços"
        title="Planos por tamanho de empresa"
        lead="Preço por campanha, de acordo com o número de participantes. Sem mensalidade, sem fidelidade. Tudo incluso em todos os planos."
      />

      <Section tone="sand" aria-label="Planos">
        <div className="grid gap-6 pt-3 md:grid-cols-3">
          {PLANS.map((p) => (
            <PricingCard key={p.name} plan={p} />
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-sg-gray-600">
          Valores em definição. Peça um orçamento: respondemos em até 1 dia útil com a proposta para a sua faixa. Limites e condições finais constam na proposta.
        </p>
      </Section>

      <Section tone="white" aria-labelledby="h-incluso">
        <SectionHeading id="h-incluso" eyebrow="Em todos os planos" title="Tudo incluso. Sem pegadinha." />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUDED.map((i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-sg-sand-50 p-4 text-base text-sg-navy-900">
              <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-green-700" strokeWidth={3} />
              {i}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand" aria-labelledby="h-addons">
        <SectionHeading id="h-addons" eyebrow="Adicionais" title="Quer ir além?" lead="Opcionais para quem quer menos trabalho ou mais escala." />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {ADDONS.map((a) => (
            <li key={a.name} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sg-navy-900/5">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-sg-sand-100">
                <Plus aria-hidden className="size-5 text-sg-orange-500" strokeWidth={2.5} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-sg-navy-900">{a.name}</h3>
              <p className="mt-1 text-sm leading-6 text-sg-gray-600">{a.description}</p>
              <p className="mt-3 text-sm font-semibold text-sg-navy-900">Sob consulta</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="white" aria-labelledby="h-faq-precos">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading id="h-faq-precos" eyebrow="Cobrança" title="Perguntas sobre preço" />
          <FaqAccordion items={PRICING_FAQ} />
        </div>
      </Section>

      <FinalCta origem="precos" title="Peça seu orçamento." lead="Diga quantas pessoas e quando é a SIPAT. A gente responde em até 1 dia útil." />
    </>
  );
}
