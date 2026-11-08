import type { Metadata } from "next";
import { ArrowRight, Mail } from "lucide-react";
import { CtaButton } from "@/components/site/CtaButton";
import { LeadForm } from "@/components/site/LeadForm";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMetadata } from "@/components/site/seo";
import { MATERIALS } from "@/content/site/materiais";

export const metadata: Metadata = pageMetadata({
  title: "Materiais grátis para SIPAT — cronograma, cartaz e checklist",
  description: "Baixe grátis: modelo de cronograma de SIPAT, checklist de comprovação para a NR-5, cartaz editável e planilha de controle de brindes.",
  path: "/materiais",
  keywords: ["material sipat", "cartaz sipat", "checklist sipat", "modelo sipat grátis"],
});

export default function MateriaisPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Materiais", path: "/materiais" }]}
        eyebrow="Grátis"
        title="Materiais para a sua SIPAT"
        lead="Modelos prontos para planejar, divulgar e comprovar a semana. Use com ou sem a SipatGo."
      />

      <Section tone="sand" aria-label="Materiais">
        <ul className="grid gap-6 md:grid-cols-2">
          {MATERIALS.map((m) => (
            <li key={m.slug} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sg-navy-900/5">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-sg-sand-100">
                <m.icon aria-hidden className="size-6 text-sg-navy-500" strokeWidth={2} />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold text-sg-navy-900">{m.title}</h2>
              <p className="mt-1 flex-1 text-base text-sg-gray-600">{m.description}</p>
              <p className="mt-3 text-sm font-semibold text-sg-navy-900">Formato: {m.format}</p>
              <div className="mt-5">
                {m.href ? (
                  <CtaButton href={m.href} variant="outline" arrow trackLabel={`material_${m.slug}`}>
                    Acessar agora
                  </CtaButton>
                ) : (
                  <a href="#receber" className="inline-flex items-center gap-1.5 font-semibold text-sg-navy-500 hover:underline">
                    <Mail aria-hidden className="size-4" /> Receber por e-mail <ArrowRight aria-hidden className="size-4" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="white" id="receber" className="scroll-mt-20" aria-labelledby="h-receber">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            id="h-receber"
            eyebrow="Kit completo"
            title="Receba o kit por e-mail"
            lead="Cartaz editável no Canva, planilha de brindes, cronograma e checklist. Mandamos tudo no seu e-mail."
          />
          <div className="rounded-2xl bg-sg-sand-50 p-5 md:p-7">
            <LeadForm
              origem="materiais"
              submitLabel="Quero o kit"
              successTitle="Kit a caminho! 📬"
              successText="Em breve você recebe o kit no seu e-mail. Confira também a caixa de spam."
            />
          </div>
        </div>
      </Section>
    </>
  );
}
