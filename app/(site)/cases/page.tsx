import type { Metadata } from "next";
import { CaseCard } from "@/components/site/CaseCard";
import { CtaButton } from "@/components/site/CtaButton";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMetadata } from "@/components/site/seo";
import { CASES } from "@/content/site/cases";

export const metadata: Metadata = pageMetadata({
  title: "Cases — resultados de SIPAT com a SipatGo",
  description: "Como empresas usam a SipatGo na SIPAT: desafio, grade da semana, adesão, acertos e depoimentos.",
  path: "/cases",
  keywords: ["case sipat", "resultado sipat", "sipat gamificada resultados"],
});

export default function CasesPage() {
  const hasReal = CASES.some((c) => !c.illustrative);
  return (
    <>
      <PageHero
        crumbs={[{ name: "Cases", path: "/cases" }]}
        eyebrow="Cases"
        title="Resultados de quem já jogou"
        lead="Adesão, aprendizado e engajamento, com números reais e autorização de cada cliente."
      >
        <CtaButton href="/contato" size="lg" arrow trackLabel="cases_monte">
          Seja um dos primeiros cases
        </CtaButton>
      </PageHero>

      <Section tone="sand" aria-labelledby="h-lista-cases">
        <SectionHeading
          id="h-lista-cases"
          title={hasReal ? "Todos os cases" : "Os primeiros cases estão a caminho"}
          lead={
            hasReal
              ? undefined
              : "A SipatGo é nova e só publica resultados reais, com autorização. Enquanto isso, veja um exemplo ilustrativo de como cada case será apresentado."
          }
        />
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c) => (
            <li key={c.slug}>
              <CaseCard item={c} />
            </li>
          ))}
        </ul>
      </Section>

      <FinalCta origem="cases" />
    </>
  );
}
