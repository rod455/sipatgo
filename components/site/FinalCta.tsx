import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/content/site/site";
import { CtaButton } from "./CtaButton";
import { LeadForm } from "./LeadForm";
import { Container } from "./Section";

/** CTA final em fundo navy com formulário curto embutido (seção 3.13). */
export function FinalCta({
  origem,
  title = "Sua próxima SIPAT pode ser a melhor da história da empresa.",
  lead = "Conte rapidinho sobre a sua empresa. A gente responde em até 1 dia útil com uma proposta e uma demo do painel.",
  withForm = true,
}: {
  origem: string;
  title?: string;
  lead?: string;
  withForm?: boolean;
}) {
  const wa = whatsappUrl();
  return (
    <section className="relative overflow-hidden bg-sg-navy-900 text-white" aria-labelledby={`cta-${origem}`}>
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-40 size-[480px] rounded-full bg-sg-navy-500/30 blur-3xl" />
      <Container className="relative grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <h2 id={`cta-${origem}`} className="font-display text-3xl leading-tight font-extrabold text-balance md:text-[40px] md:leading-[48px]">
            {title}
          </h2>
          <p className="mt-4 text-lg text-white/80">{lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaButton href="/contato" size="lg" arrow trackLabel={`final_${origem}_monte`}>
              Monte sua SIPAT
            </CtaButton>
            {wa ? (
              <CtaButton href={wa} variant="ghost" size="lg" icon={<MessageCircle aria-hidden className="size-5" />} trackLabel={`final_${origem}_whatsapp`}>
                Falar no WhatsApp
              </CtaButton>
            ) : (
              <CtaButton href="/demo" variant="ghost" size="lg" trackLabel={`final_${origem}_demo`}>
                Ver demo em 2 min
              </CtaButton>
            )}
          </div>
        </div>
        {withForm ? (
          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 md:p-7">
            <LeadForm origem={origem} tone="dark" />
          </div>
        ) : null}
      </Container>
    </section>
  );
}
