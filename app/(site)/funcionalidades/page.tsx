import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { AdminMockup } from "@/components/site/AdminMockup";
import { CtaButton } from "@/components/site/CtaButton";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { PhoneMockup } from "@/components/site/PhoneMockup";
import { Container, Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMetadata } from "@/components/site/seo";
import { COMPARISON, FEATURE_BLOCKS } from "@/content/site/features";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Funcionalidades — ranking, roleta, relatórios NR-5",
  description:
    "Dinâmicas, pontuação e ranking ao vivo, roleta de brindes, avatar e selos, mural, games da família, check-in por QR, painel do RH e relatórios para a NR-5.",
  path: "/funcionalidades",
  keywords: ["plataforma sipat", "sipat interativa", "ranking sipat", "roleta sipat", "relatório sipat"],
});

const SCREEN_FOR: Record<string, "day" | "quiz" | "wheel" | "admin"> = {
  dinamicas: "quiz",
  pontuacao: "day",
  roleta: "wheel",
  admin: "admin",
};

export default function FuncionalidadesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Funcionalidades", path: "/funcionalidades" }]}
        eyebrow="Funcionalidades"
        title="Tudo que sua SIPAT precisa"
        lead="Do primeiro acesso ao relatório final. Engajamento para quem joga, controle para quem organiza."
      >
        <CtaButton href="/contato" size="lg" arrow trackLabel="func_monte">
          Monte sua SIPAT
        </CtaButton>
        <CtaButton href="/demo" variant="ghost" size="lg" trackLabel="func_demo">
          Ver demo em 2 min
        </CtaButton>
      </PageHero>

      <nav aria-label="Funcionalidades" className="sticky top-16 z-30 border-b border-sg-navy-900/10 bg-white/95 backdrop-blur">
        <Container>
          <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 py-2 text-sm whitespace-nowrap [scrollbar-width:none]">
            {FEATURE_BLOCKS.map((b) => (
              <li key={b.id}>
                <a href={`#${b.id}`} className="inline-block rounded-lg px-3 py-1.5 font-medium text-sg-gray-600 hover:bg-sg-sand-100 hover:text-sg-navy-900">
                  {b.title}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      {FEATURE_BLOCKS.map((b, i) => {
        const screen = SCREEN_FOR[b.id];
        const reverse = i % 2 === 1;
        return (
          <Section key={b.id} id={b.id} tone={i % 2 === 0 ? "sand" : "white"} className="scroll-mt-28" aria-labelledby={`h-${b.id}`}>
            <div className={cn("grid items-center gap-10", screen && "lg:grid-cols-2")}>
              <div className={cn(reverse && screen && "lg:order-2")}>
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-sg-navy-900/5">
                  <b.icon aria-hidden className="size-6 text-sg-orange-500" strokeWidth={2} />
                </span>
                <h2 id={`h-${b.id}`} className="mt-4 font-display text-3xl font-extrabold text-sg-navy-900 md:text-[40px] md:leading-[48px]">
                  {b.title}
                </h2>
                <p className="mt-2 text-lg text-sg-gray-600">{b.lead}</p>
                <ul className={cn("mt-6 grid gap-3", !screen && "md:grid-cols-3")}>
                  {b.bullets.map((t) => (
                    <li key={t} className="flex gap-3 rounded-xl bg-white p-4 text-base text-sg-navy-900 shadow-sm ring-1 ring-sg-navy-900/5">
                      <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-sg-navy-500" strokeWidth={2.5} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              {screen ? (
                <div className={cn("min-w-0", reverse && "lg:order-1")}>
                  {screen === "admin" ? <AdminMockup /> : <PhoneMockup screen={screen} autoRotate={false} />}
                </div>
              ) : null}
            </div>
          </Section>
        );
      })}

      <Section tone="white" aria-labelledby="h-comparativo">
        <SectionHeading
          id="h-comparativo"
          eyebrow="Comparativo"
          title="SipatGo × SIPAT presencial × plataforma tradicional"
          lead="Não é sobre substituir o presencial. É sobre fazer a SIPAT chegar a todo mundo, todos os dias."
        />
        <div className="mt-10 overflow-x-auto rounded-2xl ring-1 ring-sg-navy-900/10">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="sr-only">Comparativo entre SipatGo, SIPAT presencial e plataforma tradicional</caption>
            <thead>
              <tr className="bg-sg-sand-50">
                <th scope="col" className="p-4 font-semibold text-sg-gray-600">
                  Critério
                </th>
                <th scope="col" className="bg-sg-navy-900 p-4 font-display font-bold text-white">
                  SipatGo
                </th>
                <th scope="col" className="p-4 font-display font-bold text-sg-navy-900">
                  SIPAT presencial
                </th>
                <th scope="col" className="p-4 font-display font-bold text-sg-navy-900">
                  Plataforma tradicional
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((r) => (
                <tr key={r.row} className="border-t border-sg-navy-900/10">
                  <th scope="row" className="p-4 font-semibold text-sg-navy-900">
                    {r.row}
                  </th>
                  <td className="bg-sg-navy-900/[0.03] p-4 font-semibold text-sg-navy-900">
                    <span className="flex items-start gap-2">
                      <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-green-700" strokeWidth={3} />
                      {r.sipatgo}
                    </span>
                  </td>
                  <td className="p-4 text-sg-gray-600">
                    <span className="flex items-start gap-2">
                      <Minus aria-hidden className="mt-0.5 size-4 shrink-0 text-sg-gray-600" />
                      {r.presencial}
                    </span>
                  </td>
                  <td className="p-4 text-sg-gray-600">
                    <span className="flex items-start gap-2">
                      <Minus aria-hidden className="mt-0.5 size-4 shrink-0 text-sg-gray-600" />
                      {r.tradicional}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <FinalCta origem="funcionalidades" />
    </>
  );
}
