import { AlertTriangle } from "lucide-react";
import type { GuideSection } from "@/content/site/blocks";
import { formatDate } from "@/content/site/blog";
import { LEGAL_REVIEW_NOTE } from "@/content/site/legal";
import { PageHero } from "./PageHero";
import { Prose } from "./Prose";
import { Container } from "./Section";
import { Toc } from "./Toc";

export function LegalPage({ title, path, updatedAt, sections }: { title: string; path: string; updatedAt: string; sections: GuideSection[] }) {
  return (
    <>
      <PageHero crumbs={[{ name: title, path }]} eyebrow="Legal" title={title} lead={`Última atualização: ${formatDate(updatedAt)}`} />
      <section className="bg-sg-sand-50 py-12 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
          <aside>
            <Toc title="Seções" items={sections.map((s) => ({ id: s.id, title: s.title }))} />
          </aside>
          <article className="min-w-0 max-w-3xl">
            <p role="note" className="flex gap-3 rounded-2xl border-2 border-sg-yellow-400 bg-[#FFF8E1] p-5 text-base text-sg-navy-900">
              <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" />
              <span>
                <b>Atenção:</b> {LEGAL_REVIEW_NOTE}
              </span>
            </p>
            {sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`h-${s.id}`} className="scroll-mt-24 pt-10">
                <h2 id={`h-${s.id}`} className="mb-4 font-display text-2xl font-extrabold text-sg-navy-900">
                  {s.title}
                </h2>
                <Prose blocks={s.blocks} className="text-base leading-7" />
              </section>
            ))}
          </article>
        </Container>
      </section>
    </>
  );
}
