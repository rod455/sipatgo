import type { Metadata } from "next";
import { Check, Smartphone } from "lucide-react";
import { AdminMockup } from "@/components/site/AdminMockup";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { CaseCard } from "@/components/site/CaseCard";
import { CtaButton } from "@/components/site/CtaButton";
import { DynamicCard } from "@/components/site/DynamicCard";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { FeatureGrid } from "@/components/site/FeatureGrid";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { MiniRanking, PhoneMockup } from "@/components/site/PhoneMockup";
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
import { SEGMENT_NOTE } from "@/content/site/segments";

export const metadata: Metadata = pageMetadata({
  title: "SipatGo — SIPAT online gamificada em 5 dias",
  description:
    "A SIPAT que todo mundo quer jogar. Vídeo, desafio e ranking ao vivo em 5 dias, no celular, com a marca da sua empresa e registro automático para a NR-5.",
  path: "/",
  keywords: ["sipat online", "sipat gamificada", "plataforma sipat", "sipat digital", "sipat 2026"],
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), softwareApplicationJsonLd()]} />

      {/* 3.2 Hero */}
      <section className="relative overflow-hidden bg-sg-navy-900 text-white">
        <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 size-[560px] rounded-full bg-sg-navy-500/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-[480px] rounded-full bg-sg-orange-500/10 blur-3xl" />
        <Container className="relative grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/15">
              <span aria-hidden className="size-2 rounded-full bg-sg-orange-500" /> SIPAT 2026, 100% digital
            </p>
            <h1 className="font-display text-4xl leading-[44px] font-extrabold tracking-tight text-balance md:text-[56px] md:leading-[64px]">
              A SIPAT que todo mundo quer <span className="text-sg-orange-500">jogar.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-white/80">
              Transforme a Semana de Prevenção em um jogo de 5 dias: vídeo, desafio e ranking ao vivo. Pronto em dias, com registro automático para a NR-5.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="/contato" size="lg" arrow trackLabel="hero_monte_sua_sipat">
                Monte sua SIPAT
              </CtaButton>
              <CtaButton href="/demo" variant="ghost" size="lg" trackLabel="hero_ver_demo">
                Ver demo em 2 min
              </CtaButton>
            </div>
            <ul className="mt-8 flex flex-col gap-2 text-sm text-white/80 sm:flex-row sm:flex-wrap sm:gap-x-5">
              {["Sem instalar nada", "Funciona no celular", "Com a marca da sua empresa"].map((m) => (
                <li key={m} className="flex items-center gap-2">
                  <Check aria-hidden className="size-4 text-sg-green-500" strokeWidth={3} /> {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto flex w-full max-w-md justify-center lg:max-w-none">
            <PhoneMockup />
            <MiniRanking className="sg-float absolute top-16 -right-2 hidden sm:block lg:-right-6" />
          </div>
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
          lead="Preço por campanha, de acordo com o número de participantes. Tudo incluso em todos os planos."
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
