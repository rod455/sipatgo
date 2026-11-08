import type { Metadata } from "next";
import { Clock, Sparkles } from "lucide-react";
import { CtaButton } from "@/components/site/CtaButton";
import { DynamicCard } from "@/components/site/DynamicCard";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMetadata } from "@/components/site/seo";
import { SipatHubLinks } from "@/components/site/SipatHubLinks";
import { DYNAMIC_IDEAS, PLATFORM_DYNAMICS } from "@/content/site/dynamics";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "20 dinâmicas para SIPAT online e presencial",
  description:
    "20 dinâmicas para SIPAT: Fato ou Fake, quiz cronometrado, caça aos riscos, gincana de EPIs, simulado, mural, bingo e mais. Online, presencial e híbrida.",
  path: "/sipat/dinamicas",
  keywords: ["dinâmicas para sipat", "gincana sipat", "brincadeiras sipat", "dinâmica sipat online", "atividades sipat"],
});

const formatColor: Record<string, string> = {
  Online: "bg-[#E6EEF6] text-sg-navy-900",
  Presencial: "bg-sg-sand-100 text-sg-navy-900",
  Híbrida: "bg-[#FFF1C2] text-sg-navy-900",
};

export default function DinamicasPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Guia da SIPAT", path: "/sipat" },
          { name: "Dinâmicas", path: "/sipat/dinamicas" },
        ]}
        eyebrow="20 ideias"
        title="Dinâmicas para SIPAT"
        lead="Online, presenciais e híbridas. Para todos os turnos, todos os tamanhos de empresa e todos os orçamentos."
      >
        <CtaButton href="/demo" size="lg" arrow trackLabel="dinamicas_demo">
          Jogar uma dinâmica agora
        </CtaButton>
      </PageHero>

      <Section tone="sand" aria-labelledby="h-plataforma">
        <SectionHeading
          id="h-plataforma"
          eyebrow="Em destaque"
          title="As 5 dinâmicas da SipatGo"
          lead="Prontas para usar, com 5 itens cada, feedback imediato e o mesmo sistema de pontos. Uma por dia, de segunda a sexta."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PLATFORM_DYNAMICS.map((d) => (
            <li key={d.slug}>
              <DynamicCard dynamic={d} />
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="white" aria-labelledby="h-lista">
        <SectionHeading id="h-lista" eyebrow="Lista completa" title="20 dinâmicas para a sua semana" />
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {DYNAMIC_IDEAS.map((d, i) => (
            <li
              key={d.name}
              className={cn("rounded-2xl p-6 ring-1", d.platform ? "bg-sg-sand-50 ring-sg-orange-500/40" : "bg-white shadow-sm ring-sg-navy-900/5")}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-sg-navy-900 font-display text-sm font-bold text-white tabular">{i + 1}</span>
                <h3 className="font-display text-lg font-bold text-sg-navy-900">{d.name}</h3>
                {d.platform ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sg-yellow-400 px-2 py-0.5 text-xs font-bold text-sg-navy-900">
                    <Sparkles aria-hidden className="size-3" /> Na SipatGo
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className={cn("rounded-full px-2.5 py-0.5", formatColor[d.format])}>{d.format}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sg-sand-100 px-2.5 py-0.5 text-sg-navy-900">
                  <Clock aria-hidden className="size-3" /> {d.time}
                </span>
              </div>
              <p className="mt-3 text-base leading-7 text-sg-gray-600">{d.description}</p>
              {d.tip ? (
                <p className="mt-3 rounded-xl bg-white p-3 text-sm text-sg-navy-900 ring-1 ring-sg-navy-900/5">
                  <b>Dica:</b> {d.tip}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="sand" aria-labelledby="h-continue">
        <SectionHeading id="h-continue" eyebrow="Continue lendo" title="Mais para a sua SIPAT" />
        <SipatHubLinks current="/sipat/dinamicas" className="mt-8" />
      </Section>

      <FinalCta origem="sipat-dinamicas" />
    </>
  );
}
