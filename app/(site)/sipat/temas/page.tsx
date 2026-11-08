import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { CtaButton } from "@/components/site/CtaButton";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { Container, Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMetadata } from "@/components/site/seo";
import { SipatHubLinks } from "@/components/site/SipatHubLinks";
import { Toc } from "@/components/site/Toc";
import { THEME_CATEGORIES, THEME_OF_THE_YEAR, THEMES_TOTAL } from "@/content/site/temas";

export const metadata: Metadata = pageMetadata({
  title: "50 temas para SIPAT 2026 (por categoria)",
  description: `${THEMES_TOTAL} temas para SIPAT organizados por categoria: segurança operacional, saúde, saúde mental, comportamento, emergências, trânsito e família. Com sugestão de tema do ano.`,
  path: "/sipat/temas",
  keywords: ["temas para sipat", "tema sipat 2026", "ideias de tema sipat", "sipat tema do ano"],
});

export default function TemasPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Guia da SIPAT", path: "/sipat" },
          { name: "Temas", path: "/sipat/temas" },
        ]}
        eyebrow={`${THEMES_TOTAL} ideias`}
        title="Temas para SIPAT"
        lead="Escolha um tema do ano para abrir, aprofundar e fechar a semana, e dois complementares para terça e quinta. Organizamos por categoria para facilitar."
      />

      <Section tone="white" className="py-12 md:py-16" aria-labelledby="h-tema-ano">
        <div className="rounded-3xl bg-sg-navy-900 p-6 text-white md:p-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-sg-yellow-400 px-3 py-1 text-sm font-bold text-sg-navy-900">
            <Star aria-hidden className="size-4" strokeWidth={2.5} /> Tema do ano sugerido
          </p>
          <h2 id="h-tema-ano" className="mt-4 font-display text-3xl font-extrabold text-balance md:text-4xl">
            “{THEME_OF_THE_YEAR.title}”
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-white/80">{THEME_OF_THE_YEAR.why}</p>
        </div>
      </Section>

      <section className="bg-sg-sand-50 py-12 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <aside>
            <Toc title="Categorias" items={THEME_CATEGORIES.map((c) => ({ id: c.slug, title: `${c.name} (${c.themes.length})` }))} />
          </aside>
          <div className="min-w-0 space-y-12">
            {THEME_CATEGORIES.map((c) => (
              <section key={c.slug} id={c.slug} aria-labelledby={`h-${c.slug}`} className="scroll-mt-24">
                <h2 id={`h-${c.slug}`} className="font-display text-2xl font-extrabold text-sg-navy-900 md:text-3xl">
                  {c.name}
                </h2>
                <p className="mt-1 text-sg-gray-600">{c.intro}</p>
                <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                  {c.themes.map((t) => (
                    <li key={t.title} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sg-navy-900/5">
                      <p className="font-display font-bold text-sg-navy-900">{t.title}</p>
                      <p className="mt-1 text-sm text-sg-gray-600">{t.hint}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ))}

            <div className="rounded-2xl bg-white p-6 ring-1 ring-sg-navy-900/5">
              <h2 className="font-display text-xl font-bold text-sg-navy-900">Como escolher o seu</h2>
              <p className="mt-2 text-sg-gray-600">
                Comece pelos dados: acidentes e quase acidentes do último ano, inventário de riscos e sugestões da CIPA. Depois, transforme o tema numa frase curta e positiva. Precisa de ajuda com a frase? Veja as nossas{" "}
                <Link href="/blog/frases-para-sipat" className="font-medium text-sg-navy-500 underline underline-offset-4">
                  60 frases para SIPAT
                </Link>
                .
              </p>
              <div className="mt-5">
                <CtaButton href="/sipat/cronograma" variant="outline" arrow trackLabel="temas_cronograma">
                  Montar o cronograma
                </CtaButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Section tone="white" aria-labelledby="h-continue">
        <SectionHeading id="h-continue" eyebrow="Continue lendo" title="Mais para a sua SIPAT" />
        <SipatHubLinks current="/sipat/temas" className="mt-8" />
      </Section>

      <FinalCta origem="sipat-temas" />
    </>
  );
}
