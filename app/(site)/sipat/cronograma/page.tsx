import type { Metadata } from "next";
import { CronogramaDownload } from "@/components/site/CronogramaDownload";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMetadata } from "@/components/site/seo";
import { SipatHubLinks } from "@/components/site/SipatHubLinks";
import { PREP_CHECKLIST, SCHEDULE, SCHEDULE_COLUMNS } from "@/content/site/cronograma";

export const metadata: Metadata = pageMetadata({
  title: "Modelo de cronograma de SIPAT (5 dias) para baixar",
  description:
    "Modelo de cronograma de SIPAT de segunda a sexta, com tema, atividade, dinâmica, extras e responsável. Baixe em CSV (Excel) ou imprima. Inclui checklist de preparação.",
  path: "/sipat/cronograma",
  keywords: ["cronograma sipat", "programação sipat", "modelo de cronograma sipat", "sipat 5 dias"],
});

export default function CronogramaPage() {
  return (
    <>
      <div className="no-print">
        <PageHero
          crumbs={[
            { name: "Guia da SIPAT", path: "/sipat" },
            { name: "Cronograma", path: "/sipat/cronograma" },
          ]}
          eyebrow="Modelo grátis"
          title="Cronograma de SIPAT"
          lead="Um modelo de 5 dias pronto para adaptar: mesma estrutura todo dia, um tipo de dinâmica diferente por dia e extras nos dias certos."
        >
          <CronogramaDownload tone="dark" />
        </PageHero>
      </div>

      <Section tone="white" aria-labelledby="h-tabela" className="sg-print-plain">
        <SectionHeading
          id="h-tabela"
          eyebrow="Segunda a sexta"
          title="Programação da semana"
          lead="Ajuste temas, horários e responsáveis à realidade da sua empresa. A programação final é definida pela CIPA."
        />
        <div className="mt-8 overflow-x-auto rounded-2xl ring-1 ring-sg-navy-900/10">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <caption className="sr-only">Modelo de cronograma de SIPAT de 5 dias</caption>
            <thead>
              <tr className="bg-sg-navy-900 text-white">
                {SCHEDULE_COLUMNS.map((c) => (
                  <th key={c.key} scope="col" className="p-3 font-display font-bold">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((r, i) => (
                <tr key={r.dia} className={i % 2 ? "bg-sg-sand-50" : "bg-white"}>
                  {SCHEDULE_COLUMNS.map((c, j) =>
                    j === 0 ? (
                      <th key={c.key} scope="row" className="p-3 align-top font-display font-bold text-sg-navy-900">
                        {r[c.key]}
                      </th>
                    ) : (
                      <td key={c.key} className="p-3 align-top text-sg-navy-900/85">
                        {r[c.key]}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-sg-gray-600">
          Modelo SipatGo · sipatgo.com.br/sipat/cronograma · Sugestão de rotina diária: liberação às 8h, lembrete às 14h, recuperação até sexta às 18h.
        </p>
      </Section>

      <Section tone="sand" aria-labelledby="h-prep" className="sg-print-plain">
        <SectionHeading id="h-prep" eyebrow="Checklist" title="Preparação, semana a semana" />
        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PREP_CHECKLIST.map((b) => (
            <li key={b.when} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sg-navy-900/5">
              <h3 className="font-display font-bold text-sg-navy-900">{b.when}</h3>
              <ul className="mt-3 space-y-2 text-sm text-sg-gray-600">
                {b.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span aria-hidden className="mt-0.5 inline-block size-4 shrink-0 rounded border-2 border-sg-navy-500" />
                    {it}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <div className="no-print">
        <Section tone="white" aria-labelledby="h-continue">
          <SectionHeading id="h-continue" eyebrow="Continue lendo" title="Mais para a sua SIPAT" />
          <SipatHubLinks current="/sipat/cronograma" className="mt-8" />
        </Section>
        <FinalCta
          origem="sipat-cronograma"
          title="Quer esse cronograma rodando sozinho?"
          lead="Na SipatGo, cada dia abre às 8h, a dinâmica libera depois do vídeo e a presença fica registrada. Você só acompanha."
        />
      </div>
    </>
  );
}
