import type { Metadata } from "next";
import { Clock, Mail, MessageCircle, PlayCircle } from "lucide-react";
import { CtaButton } from "@/components/site/CtaButton";
import { LeadForm } from "@/components/site/LeadForm";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { pageMetadata } from "@/components/site/seo";
import { CONTACT_EMAIL, whatsappUrl } from "@/content/site/site";

export const metadata: Metadata = pageMetadata({
  title: "Contato — monte sua SIPAT com a SipatGo",
  description: "Fale com a SipatGo: conte sobre a sua empresa e a data da SIPAT. Resposta em até 1 dia útil, por e-mail ou WhatsApp.",
  path: "/contato",
  keywords: ["contratar sipat online", "orçamento sipat", "contato sipatgo"],
});

export default function ContatoPage() {
  const wa = whatsappUrl();
  return (
    <>
      <PageHero
        crumbs={[{ name: "Contato", path: "/contato" }]}
        eyebrow="Contato"
        title="Monte sua SIPAT"
        lead="Conte rapidinho sobre a sua empresa. Em até 1 dia útil você recebe uma proposta e um horário para ver o painel do RH ao vivo."
      />
      <Section tone="sand">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-sg-navy-900/5 md:p-8">
            <h2 className="mb-6 font-display text-2xl font-extrabold text-sg-navy-900">Fale com a gente</h2>
            <LeadForm variant="full" origem="contato" submitLabel="Enviar" />
          </div>
          <aside className="space-y-4">
            <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sg-navy-900/5">
              <Clock aria-hidden className="size-6 shrink-0 text-sg-navy-500" strokeWidth={2} />
              <div>
                <p className="font-display font-bold text-sg-navy-900">Resposta em até 1 dia útil</p>
                <p className="text-sm text-sg-gray-600">De segunda a sexta, em horário comercial.</p>
              </div>
            </div>
            {wa ? (
              <div className="rounded-2xl bg-sg-navy-900 p-5 text-white">
                <MessageCircle aria-hidden className="size-6 text-sg-orange-500" strokeWidth={2} />
                <p className="mt-3 font-display text-lg font-bold">Prefere WhatsApp?</p>
                <p className="mt-1 text-sm text-white/80">Chama a gente e já tira as primeiras dúvidas.</p>
                <CtaButton href={wa} className="mt-4 w-full" trackLabel="contato_whatsapp">
                  Falar no WhatsApp
                </CtaButton>
              </div>
            ) : null}
            <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sg-navy-900/5">
              <Mail aria-hidden className="size-6 shrink-0 text-sg-navy-500" strokeWidth={2} />
              <div>
                <p className="font-display font-bold text-sg-navy-900">E-mail</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm font-medium text-sg-navy-500 underline underline-offset-4">
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sg-navy-900/5">
              <PlayCircle aria-hidden className="size-6 shrink-0 text-sg-navy-500" strokeWidth={2} />
              <div>
                <p className="font-display font-bold text-sg-navy-900">Quer ver antes?</p>
                <p className="text-sm text-sg-gray-600">Jogue a demo em 2 minutos, sem cadastro.</p>
                <CtaButton href="/demo" variant="outline" size="sm" className="mt-3" trackLabel="contato_demo">
                  Jogar a demo
                </CtaButton>
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
