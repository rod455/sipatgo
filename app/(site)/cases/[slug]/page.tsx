import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertTriangle, ImageIcon } from "lucide-react";
import { IllustrativeBadge } from "@/components/site/CaseCard";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMetadata } from "@/components/site/seo";
import { StatCard } from "@/components/site/StatCard";
import { Testimonial } from "@/components/site/Testimonial";
import { CASES } from "@/content/site/cases";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return CASES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const c = CASES.find((x) => x.slug === slug);
  if (!c) return {};
  return pageMetadata({
    title: `${c.illustrative ? "Exemplo ilustrativo: " : "Case "}${c.company} — SipatGo`,
    description: c.summary,
    path: `/cases/${c.slug}`,
    noindex: c.illustrative,
  });
}

export default async function CasePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const c = CASES.find((x) => x.slug === slug);
  if (!c) notFound();

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Cases", path: "/cases" },
          { name: c.company, path: `/cases/${c.slug}` },
        ]}
        eyebrow={`${c.sector} · ${c.people} pessoas · ${c.city}`}
        title={c.company}
        lead={c.summary}
        aside={
          <div
            aria-hidden
            className="mx-auto flex size-40 items-center justify-center rounded-3xl font-display text-5xl font-extrabold text-white shadow-2xl lg:size-52"
            style={{ background: `linear-gradient(135deg, ${c.brand.primary}, ${c.brand.secondary})` }}
          >
            {c.company
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </div>
        }
      >
        {c.illustrative ? <IllustrativeBadge /> : null}
      </PageHero>

      {c.illustrative ? (
        <div className="border-b border-sg-yellow-400 bg-[#FFF8E1]">
          <p className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-4 text-sm text-sg-navy-900 sm:px-6 lg:px-8">
            <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" />
            <span>
              <b>Exemplo ilustrativo.</b> Empresa, grade e textos fictícios, criados para mostrar o formato de um case. Nenhum número aqui representa resultado real de cliente.
            </span>
          </p>
        </div>
      ) : null}

      <Section tone="white" aria-labelledby="h-desafio">
        <SectionHeading id="h-desafio" eyebrow="O desafio" title="Onde a SIPAT travava" />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {c.challenge.map((t) => (
            <li key={t} className="rounded-2xl bg-sg-sand-50 p-5 text-base text-sg-navy-900">
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand" aria-labelledby="h-feito">
        <SectionHeading id="h-feito" eyebrow="O que foi feito" title="A grade da semana" />
        <div className="mt-8 overflow-x-auto rounded-2xl ring-1 ring-sg-navy-900/10">
          <table className="w-full min-w-[560px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="bg-sg-navy-900 text-white">
                <th scope="col" className="p-3">Dia</th>
                <th scope="col" className="p-3">Tema</th>
                <th scope="col" className="p-3">Dinâmica</th>
                <th scope="col" className="p-3">Extra</th>
              </tr>
            </thead>
            <tbody>
              {c.whatWeDid.map((d) => (
                <tr key={d.day} className="border-t border-sg-navy-900/10">
                  <th scope="row" className="p-3 font-display font-bold text-sg-navy-900">
                    {d.day}
                  </th>
                  <td className="p-3 text-sg-navy-900">{d.theme}</td>
                  <td className="p-3 text-sg-navy-900">{d.dynamic}</td>
                  <td className="p-3 text-sg-gray-600">{d.extra ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="white" aria-labelledby="h-resultados">
        <SectionHeading id="h-resultados" eyebrow="Resultados" title="Os números da semana" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.results.map((r) => (
            <StatCard key={r.label} value={r.value} label={r.label} note={r.note} />
          ))}
        </div>
        {c.testimonial ? (
          <Testimonial className="mt-8" placeholder={c.illustrative} quote={c.testimonial.quote} author={c.testimonial.author} role={c.testimonial.role} />
        ) : null}
      </Section>

      <Section tone="sand" aria-labelledby="h-mural">
        <SectionHeading id="h-mural" eyebrow="Mural" title="Galeria do mural" lead={c.wallNote} />
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Espaços reservados para fotos do mural">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-sg-navy-900/15 bg-white text-sg-gray-600">
              <ImageIcon aria-hidden className="size-8" strokeWidth={1.5} />
            </li>
          ))}
        </ul>
      </Section>

      <FinalCta origem={`case-${c.slug}`} />
    </>
  );
}
