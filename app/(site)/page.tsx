import type { Metadata } from "next";
import { Check, Smartphone } from "lucide-react";
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
      <section className="relative overflow-hidden bg-white">
        <div aria-hidden className="pointer-events-none absolute -top-48 right-[-10%] size-[640px] rounded-full bg-sg-yellow-400/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-32 size-[420px] rounded-full bg-sg-orange-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(11,31,51,.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
        <Container className="relative grid items-center gap-14 pb-16 pt-12 md:pb-24 md:pt-20 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-sg-sand-50 px-4 py-1.5 text-sm font-semibold text-sg-navy-700 ring-1 ring-sg-navy-900/10">
              <span aria-hidden className="size-2 rounded-full bg-sg-orange-500" /> SIPAT 2026 · 100% digital
            </p>
            <h1 className="display-xl font-display text-[44px] font-extrabold leading-[1.02] text-sg-navy-900 text-balance sm:text-[56px] lg:text-[72px]">
              A SIPAT que todo mundo quer{" "}
              <span className="relative inline-block text-sg-orange-500">
                jogar.
                <svg aria-hidden viewBox="0 0 200 18" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full text-sg-yellow-400 md:-bottom-3 md:h-4">
                  <path d="M3 12 C 50 3, 120 3, 197 9" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-sg-navy-700/80 md:text-xl">
              Transforme a Semana de Prevenção em um jogo de 5 dias: vídeo, desafio e ranking ao vivo. Pronto em dias, com registro automático para a NR-5.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="/contato" size="lg" arrow trackLabel="hero_monte_sua_sipat">
                Monte sua SIPAT
              </CtaButton>
              <CtaButton href="/demo" variant="outline" size="lg" trackLabel="hero_ver_demo">
                Ver demo em 2 min
              </CtaButton>
            </div>
            <ul className="mt-9 flex flex-col gap-2 text-[15px] font-semibold text-sg-navy-700 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {["Sem instalar nada", "Funciona no celular", "Com a marca da sua empresa"].map((m) => (
                <li key={m} className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-sg-green-500/15">
                    <Check aria-hidden className="size-3.5 text-sg-green-500" strokeWidth={3.5} />
                  </span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto flex w-full max-w-md justify-center lg:max-w-none">
            <div aria-hidden className="absolute inset-x-6 bottom-6 top-10 rotate-[-4deg] rounded-[48px] bg-sg-yellow-400 sm:inset-x-14" />
            <div aria-hidden className="absolute inset-x-10 bottom-2 top-16 rotate-[3deg] rounded-[48px] bg-sg-navy-900 sm:inset-x-20" />
            <div className="relative">
              <PhoneMockup />
            </div>
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
