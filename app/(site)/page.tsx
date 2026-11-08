import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import { Smartphone } from "lucide-react";
import { CampaignTiles } from "@/components/site/CampaignTiles";
import { IncludedPanel } from "@/components/site/IncludedPanel";
import { AdminMockup } from "@/components/site/AdminMockup";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { CaseCard } from "@/components/site/CaseCard";
import { CtaButton } from "@/components/site/CtaButton";
import { DynamicCard } from "@/components/site/DynamicCard";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { FeatureGrid } from "@/components/site/FeatureGrid";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { PricingCard } from "@/components/site/PricingCard";
import { Container, Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SegmentChips } from "@/components/site/SegmentChips";
import { organizationJsonLd, pageMetadata, softwareApplicationJsonLd } from "@/components/site/seo";
import { Testimonial } from "@/components/site/Testimonial";
import { WeekTimeline } from "@/components/site/WeekTimeline";
import { CASES } from "@/content/site/cases";
import { PLATFORM_DYNAMICS } from "@/content/site/dynamics";
import { HOME_FAQ } from "@/content/site/faq";
import { ENGAGEMENT_EXTRAS, ENGAGEMENT_FEATURES, HR_FEATURES, TRUST_ITEMS } from "@/content/site/features";
import { PLANS } from "@/content/site/pricing";
import { HERO_CHIPS, HERO_SLIDES } from "@/content/site/hero";
import { HeroRotator, type ShowcaseSlide } from "@/components/site/HeroShowcase";
import { SEGMENT_NOTE } from "@/content/site/segments";

export const metadata: Metadata = pageMetadata({
  title: "SipatGo — SIPAT online gamificada em 5 dias",
  description:
    "A SIPAT que todo mundo quer jogar. Vídeo, desafio e ranking ao vivo em 5 dias, no celular e nas ações presenciais, com a marca da sua empresa e a documentação organizada para a CIPA.",
  path: "/",
  keywords: ["sipat online", "sipat gamificada", "plataforma sipat", "sipat digital", "sipat 2026"],
});

/** Usa as fotos do hero só quando existem em /public/site/hero (ver docs/site/hero-imagens.md). */
function heroSlides(): ShowcaseSlide[] {
  const has = (f: string) => existsSync(path.join(process.cwd(), "public", "site", "hero", f));
  return HERO_SLIDES.map((s) => ({
    ...s,
    scene: has(`${s.key}-cena.jpg`) ? `/site/hero/${s.key}-cena.jpg` : undefined,
    person: has(`${s.key}-pessoa.png`) ? `/site/hero/${s.key}-pessoa.png` : undefined,
  }));
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), softwareApplicationJsonLd()]} />

      {/* 3.2 Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-sg-sand-50 to-[#FFF1DA]">
        <div aria-hidden className="pointer-events-none absolute -top-48 right-[-10%] size-[640px] rounded-full bg-sg-yellow-400/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-32 size-[420px] rounded-full bg-sg-orange-500/10 blur-3xl" />
        <Container className="relative pb-16 pt-10 md:pb-24 md:pt-16">
          <HeroRotator slides={heroSlides()}>
            <p className="mt-7 max-w-xl text-lg leading-8 text-sg-navy-700/80 md:text-xl">
              Campanhas de prevenção gamificadas e 100% personalizadas para a sua empresa: vídeo, desafio e ranking ao vivo, junto com as palestras e ações presenciais da CIPA. Pronto em dias, com a documentação organizada.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2.5" aria-label="O que a SipatGo traz">
              {HERO_CHIPS.map((c) => (
                <li key={c} className="rounded-full bg-sg-navy-900 px-4 py-2 text-sm font-semibold text-white">{c}</li>
              ))}
              <li className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-sg-navy-900 ring-1 ring-sg-navy-900/10">tudo em um só lugar</li>
            </ul>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="/contato" size="lg" arrow trackLabel="hero_monte_sua_sipat">
                Monte sua SIPAT
              </CtaButton>
              <CtaButton href="/demo" variant="outline" size="lg" trackLabel="hero_ver_demo">
                Ver demo em 2 min
              </CtaButton>
            </div>
          </HeroRotator>
        </Container>
      </section>

      {/* 3.3 Barra de confiança */}
      <section className="border-b border-sg-navy-900/5 bg-white">
        <Container className="flex flex-col items-center gap-5 py-8 md:flex-row md:justify-between">
          <p className="text-center font-display text-base font-bold text-sg-navy-900 md:text-left">Feito para empresas de 50 a 5.000 pessoas</p>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:flex-wrap sm:justify-center">
            {TRUST_ITEMS.map((t) => (
              <li key={t.label} className="flex items-center gap-2 text-sm font-semibold text-sg-gray-600">
                <t.icon aria-hidden className="size-5 text-sg-navy-500" strokeWidth={2} /> {t.label}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Campanhas */}
      <Section tone="white" aria-labelledby="h-campanhas" className="pt-10 md:pt-16">
        <SectionHeading
          id="h-campanhas"
          align="center"
          title={<>Uma campanha para cada <span className="text-sg-orange-500">momento</span> da sua empresa</>}
          lead="A mesma mecânica que engaja na SIPAT funciona em qualquer campanha de 5 dias: você escolhe o tema, a plataforma cuida do resto."
        />
        <div className="mt-12">
          <CampaignTiles />
        </div>
      </Section>

      {/* Tudo incluso */}
      <Section tone="white" aria-labelledby="h-incluso" className="pt-0 md:pt-4">
        <SectionHeading
          id="h-incluso"
          align="center"
          title="Tudo que a campanha precisa, em um só lugar"
          className="mb-10"
        />
        <IncludedPanel />
      </Section>

      {/* 3.4 Como funciona */}
      <Section tone="sand" id="como-funciona" aria-labelledby="h-semana">
        <SectionHeading
          id="h-semana"
          eyebrow="Como funciona"
          title="Sua semana em 5 dias"
          lead="Todo dia a mesma regra: assiste o vídeo, joga o desafio, sobe no ranking. Dias futuros ficam bloqueados; quem perdeu recupera até sexta."
        />
        <WeekTimeline className="mt-10" />
        <div className="mt-10">
          <CtaButton href="/como-funciona" variant="outline" arrow trackLabel="home_jornada">
            Ver a jornada completa
          </CtaButton>
        </div>
      </Section>

      {/* 3.5 Dinâmicas */}
      <Section tone="white" aria-labelledby="h-dinamicas">
        <SectionHeading
          id="h-dinamicas"
          eyebrow="Dinâmicas"
          title="5 jogos, 5 dias, zero monotonia"
          lead="Cada dia tem um tipo de desafio diferente, sempre com 5 itens e feedback na hora."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PLATFORM_DYNAMICS.map((d) => (
            <li key={d.slug}>
              <DynamicCard dynamic={d} />
            </li>
          ))}
        </ul>
        <p className="mt-8 rounded-2xl bg-sg-sand-50 p-5 text-center font-display text-lg font-bold text-sg-navy-900">
          Cada acerto vale 100 pontos. Errou? Refaz e ganha 50. Respondeu rápido? Bônus.
        </p>
      </Section>

      {/* 3.6 Engajamento */}
      <Section tone="sand" aria-labelledby="h-engajamento">
        <SectionHeading id="h-engajamento" eyebrow="Engajamento" title="O que faz a galera voltar todo dia" />
        <FeatureGrid features={ENGAGEMENT_FEATURES} columns={3} iconColor="orange" className="mt-10" />
        <FeatureGrid features={ENGAGEMENT_EXTRAS} columns={3} compact className="mt-4" />
      </Section>

      {/* 3.7 Para o RH */}
      <Section tone="white" aria-labelledby="h-rh">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeading
              id="h-rh"
              eyebrow="Para o RH"
              title="Você configura. A plataforma faz o resto."
              lead="Você configura em uma tarde. A plataforma cuida da semana."
            />
            <FeatureGrid features={HR_FEATURES} columns={2} compact className="mt-8" />
            <div className="mt-8">
              <CtaButton href="/funcionalidades" variant="outline" arrow trackLabel="home_funcionalidades">
                Ver todas as funcionalidades
              </CtaButton>
            </div>
          </div>
          <AdminMockup />
        </div>
      </Section>

      {/* 3.8 Antes e depois */}
      <Section tone="sand" aria-labelledby="h-antes-depois">
        <SectionHeading
          id="h-antes-depois"
          eyebrow="Antes e depois"
          title="Da palestra que ninguém lembra para a semana que todo mundo comenta."
          className="mb-10"
        />
        <BeforeAfter />
      </Section>

      {/* 3.9 Para quem */}
      <Section tone="white" aria-labelledby="h-para-quem">
        <SectionHeading
          id="h-para-quem"
          eyebrow="Para quem"
          title="Do chão de fábrica ao home office"
          lead="Indústria, logística, saúde, varejo, escritório, agro, construção e setor público."
        />
        <SegmentChips className="mt-10" />
        <p className="mt-8 flex items-start gap-3 rounded-2xl bg-sg-sand-50 p-5 text-base text-sg-navy-900">
          <Smartphone aria-hidden className="mt-0.5 size-5 shrink-0 text-sg-navy-500" strokeWidth={2} />
          {SEGMENT_NOTE}
        </p>
      </Section>

      {/* 3.10 Resultados */}
      <Section tone="sand" aria-labelledby="h-resultados">
        <SectionHeading
          id="h-resultados"
          eyebrow="Resultados"
          title="Resultados que dá para mostrar para a diretoria"
          lead="Adesão por setor, acerto por pergunta, brindes entregues. Os primeiros cases estão chegando; enquanto isso, veja como eles serão apresentados."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          {CASES.slice(0, 1).map((c) => (
            <CaseCard key={c.slug} item={c} />
          ))}
          <Testimonial
            placeholder
            quote="Espaço reservado para o depoimento em vídeo do RH do nosso primeiro cliente."
            author="Em breve"
            role="Depoimento real, com autorização"
          />
        </div>
      </Section>

      {/* 3.11 Preços */}
      <Section tone="white" aria-labelledby="h-precos">
        <SectionHeading
          id="h-precos"
          eyebrow="Preços"
          title="Planos por tamanho de empresa"
          lead="Preço por campanha, de acordo com o número de participantes. Tudo incluso e 100% personalizado para a sua empresa."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <PricingCard key={p.name} plan={p} compact />
          ))}
        </div>
        <div className="mt-8">
          <CtaButton href="/precos" variant="outline" arrow trackLabel="home_ver_planos">
            Ver planos
          </CtaButton>
        </div>
      </Section>

      {/* 3.12 FAQ */}
      <Section tone="sand" aria-labelledby="h-faq">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading
            id="h-faq"
            eyebrow="Perguntas frequentes"
            title="Tudo que o RH costuma perguntar"
            lead="Não achou sua dúvida? Fale com a gente: resposta em até 1 dia útil."
          />
          <FaqAccordion items={HOME_FAQ} />
        </div>
      </Section>

      {/* 3.13 CTA final */}
      <FinalCta origem="home" />
    </>
  );
}
