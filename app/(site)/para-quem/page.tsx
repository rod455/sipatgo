import type { Metadata } from "next";
import { CtaButton } from "@/components/site/CtaButton";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SegmentChips } from "@/components/site/SegmentChips";
import { SegmentPreview } from "@/components/site/SegmentPreview";
import { pageMetadata } from "@/components/site/seo";
import { SEGMENT_NOTE, SEGMENTS } from "@/content/site/segments";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Para quem é a SipatGo — SIPAT por segmento",
  description:
    "SIPAT digital para indústria, logística, saúde, varejo, escritório, agro, construção e setor público. Veja a dor de cada segmento e como a plataforma resolve.",
  path: "/para-quem",
  keywords: ["sipat indústria", "sipat hospital", "sipat logística", "sipat construção civil", "sipat varejo"],
});

export default function ParaQuemPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Para quem", path: "/para-quem" }]}
        eyebrow="Para quem"
        title="Cada segmento tem a sua SIPAT"
        lead="Turno, plantão, campo, loja ou home office: a semana se adapta à rotina de quem trabalha. A marca é sempre a da sua empresa."
      >
        <CtaButton href="/contato" size="lg" arrow trackLabel="paraquem_monte">
          Monte sua SIPAT
        </CtaButton>
      </PageHero>

      <Section tone="sand" className="py-10 md:py-14">
        <SegmentChips />
        <p className="mt-6 text-center text-base font-semibold text-sg-navy-900">{SEGMENT_NOTE}</p>
      </Section>

      {SEGMENTS.map((s, i) => (
        <Section key={s.slug} id={s.slug} tone={i % 2 === 0 ? "white" : "sand"} className="scroll-mt-20" aria-labelledby={`h-${s.slug}`}>
          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div className={cn(i % 2 === 1 && "lg:order-2")}>
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-sg-sand-100">
                <s.icon aria-hidden className="size-6 text-sg-navy-500" strokeWidth={2} />
              </span>
              <h2 id={`h-${s.slug}`} className="mt-4 font-display text-3xl font-extrabold text-sg-navy-900 md:text-[40px] md:leading-[48px]">
                {s.name}
              </h2>
              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-sm font-semibold tracking-wide text-sg-navy-500 uppercase">A dor</dt>
                  <dd className="mt-1 text-lg text-sg-navy-900">{s.pain}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold tracking-wide text-sg-navy-500 uppercase">Como a SipatGo resolve</dt>
                  <dd className="mt-1 text-lg text-sg-gray-600">{s.how}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold tracking-wide text-sg-navy-500 uppercase">Exemplo de tema do ano</dt>
                  <dd className="mt-1 font-display text-xl font-bold text-sg-navy-900">“{s.themeExample}”</dd>
                </div>
              </dl>
            </div>
            <div className={cn(i % 2 === 1 && "lg:order-1")}>
              <SegmentPreview segment={s} />
              <p className="mt-3 text-center text-xs text-sg-gray-600">Marca fictícia: {s.demoBrand.name}</p>
            </div>
          </div>
        </Section>
      ))}

      <FinalCta origem="para-quem" />
    </>
  );
}
