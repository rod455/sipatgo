import type { Metadata } from "next";
import { CtaButton } from "@/components/site/CtaButton";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { Container, Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { articleJsonLd, pageMetadata } from "@/components/site/seo";
import { SipatHubLinks } from "@/components/site/SipatHubLinks";
import { Toc } from "@/components/site/Toc";
import { formatDate } from "@/content/site/blog";
import { SIPAT_FAQ } from "@/content/site/faq";
import { GUIDE_UPDATED_AT, SIPAT_GUIDE } from "@/content/site/sipat-guide";

const TITLE = "O que é SIPAT e como organizar em 2026 — guia completo";
const DESCRIPTION =
  "SIPAT é a Semana Interna de Prevenção de Acidentes do Trabalho. Entenda quem organiza, o que a NR-5 pede, como montar a semana em 7 passos, erros comuns e checklist.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/sipat",
  keywords: ["sipat", "o que é sipat", "como organizar sipat", "sipat 2026", "semana interna de prevenção de acidentes do trabalho"],
  type: "article",
  publishedTime: GUIDE_UPDATED_AT,
});

export default function SipatGuidePage() {
  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: TITLE,
          description: DESCRIPTION,
          path: "/sipat",
          datePublished: GUIDE_UPDATED_AT,
          author: "Equipe SipatGo",
          section: "SIPAT",
        })}
      />
      <PageHero
        crumbs={[{ name: "Guia da SIPAT", path: "/sipat" }]}
        eyebrow="Guia completo"
        title="O que é SIPAT"
        lead="Tudo que você precisa para organizar a Semana Interna de Prevenção de Acidentes do Trabalho: quem organiza, o que a NR-5 pede, passo a passo, erros comuns e checklist."
      >
        <CtaButton href="/sipat/cronograma" size="lg" arrow trackLabel="guia_cronograma">
          Baixar cronograma de 5 dias
        </CtaButton>
        <CtaButton href="/demo" variant="ghost" size="lg" trackLabel="guia_demo">
          Ver demo em 2 min
        </CtaButton>
      </PageHero>

      <section className="bg-sg-sand-50 py-12 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
          <aside>
            <Toc items={SIPAT_GUIDE.map((s) => ({ id: s.id, title: s.title }))} />
          </aside>
          <article className="min-w-0 max-w-3xl">
            <p className="text-sm text-sg-gray-600">
              Atualizado em <time dateTime={GUIDE_UPDATED_AT}>{formatDate(GUIDE_UPDATED_AT)}</time> · Equipe SipatGo · Conteúdo informativo; confira sempre a NR-5 vigente.
            </p>
            {SIPAT_GUIDE.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`h-${s.id}`} className="scroll-mt-24 pt-10 first:pt-6">
                <h2 id={`h-${s.id}`} className="mb-5 font-display text-2xl font-extrabold text-sg-navy-900 md:text-3xl">
                  {s.title}
                </h2>
                <Prose blocks={s.blocks} />
              </section>
            ))}
          </article>
        </Container>
      </section>

      <Section tone="white" aria-labelledby="h-faq-sipat">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading id="h-faq-sipat" eyebrow="Perguntas frequentes" title="Dúvidas comuns sobre a SIPAT" />
          <FaqAccordion items={SIPAT_FAQ} />
        </div>
      </Section>

      <Section tone="sand" aria-labelledby="h-continue">
        <SectionHeading id="h-continue" eyebrow="Continue lendo" title="Tudo para a sua SIPAT" />
        <SipatHubLinks current="/sipat" className="mt-8" />
      </Section>

      <FinalCta origem="guia-sipat" />
    </>
  );
}
