import type { Metadata } from "next";
import { CheckSquare } from "lucide-react";
import { CtaButton } from "@/components/site/CtaButton";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { Container, Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { articleJsonLd, pageMetadata } from "@/components/site/seo";
import { SipatHubLinks } from "@/components/site/SipatHubLinks";
import { Toc } from "@/components/site/Toc";
import { GUIDE_UPDATED_AT } from "@/content/site/sipat-guide";
import { NR5_CHECKLIST, NR5_SECTIONS } from "@/content/site/nr5";

const TITLE = "SIPAT e NR-5: o que a norma exige";
const DESCRIPTION =
  "A SIPAT é obrigatória? Entenda o que a NR-5 diz sobre a Semana Interna de Prevenção de Acidentes do Trabalho, o papel da CIPA e do SESMT e como comprovar a realização.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/sipat/nr-5",
  keywords: ["sipat nr 5", "sipat obrigatória", "nr 5 sipat", "cipa sipat", "comprovação sipat"],
  type: "article",
  publishedTime: GUIDE_UPDATED_AT,
});

export default function Nr5Page() {
  return (
    <>
      <JsonLd
        data={articleJsonLd({ title: TITLE, description: DESCRIPTION, path: "/sipat/nr-5", datePublished: GUIDE_UPDATED_AT, author: "Equipe SipatGo", section: "NR-5" })}
      />
      <PageHero
        crumbs={[
          { name: "Guia da SIPAT", path: "/sipat" },
          { name: "NR-5", path: "/sipat/nr-5" },
        ]}
        eyebrow="Norma Regulamentadora nº 5"
        title="SIPAT na NR-5"
        lead="O que a norma pede, o que fica a critério da CIPA e como guardar as evidências da semana sem papelada."
      >
        <CtaButton href="#checklist" size="lg" arrow trackLabel="nr5_checklist">
          Ver checklist de comprovação
        </CtaButton>
      </PageHero>

      <section className="bg-sg-sand-50 py-12 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
          <aside>
            <Toc title="Nesta página" items={[...NR5_SECTIONS.map((s) => ({ id: s.id, title: s.title })), { id: "checklist", title: "Checklist" }]} />
          </aside>
          <article className="min-w-0 max-w-3xl">
            <aside className="rounded-2xl border-2 border-sg-yellow-400 bg-[#FFF8E1] p-5 text-base leading-7 text-sg-navy-900">
              <b>Importante:</b> este conteúdo é informativo e foi escrito de forma cautelosa. Não substitui a leitura da NR-5 vigente, publicada pelo
              Ministério do Trabalho e Emprego (gov.br), nem a orientação do seu SESMT, assessoria de SST ou jurídico.
            </aside>
            {NR5_SECTIONS.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`h-${s.id}`} className="scroll-mt-24 pt-10">
                <h2 id={`h-${s.id}`} className="mb-5 font-display text-2xl font-extrabold text-sg-navy-900 md:text-3xl">
                  {s.title}
                </h2>
                <Prose blocks={s.blocks} />
              </section>
            ))}

            <section id="checklist" aria-labelledby="h-checklist" className="scroll-mt-24 pt-10">
              <h2 id="h-checklist" className="mb-5 font-display text-2xl font-extrabold text-sg-navy-900 md:text-3xl">
                Checklist de comprovação da SIPAT
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {NR5_CHECKLIST.map((it) => (
                  <li key={it} className="flex gap-3 rounded-xl bg-white p-4 text-base text-sg-navy-900 shadow-sm ring-1 ring-sg-navy-900/5">
                    <CheckSquare aria-hidden className="mt-0.5 size-5 shrink-0 text-sg-navy-500" strokeWidth={2} />
                    {it}
                  </li>
                ))}
              </ul>
            </section>
          </article>
        </Container>
      </section>

      <Section tone="white" aria-labelledby="h-continue">
        <SectionHeading id="h-continue" eyebrow="Continue lendo" title="Mais para a sua SIPAT" />
        <SipatHubLinks current="/sipat/nr-5" className="mt-8" />
      </Section>

      <FinalCta
        origem="sipat-nr5"
        title="A documentação da SIPAT organizada para a CIPA."
        lead="Presença por dia, relatório final e certificados com verificação: tudo sai pronto da plataforma."
      />
    </>
  );
}
