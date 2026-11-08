import type { Metadata } from "next";
import { HeartHandshake, Rocket, Target } from "lucide-react";
import { CtaButton } from "@/components/site/CtaButton";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMetadata } from "@/components/site/seo";
import { CONTACT_EMAIL } from "@/content/site/site";

export const metadata: Metadata = pageMetadata({
  title: "Sobre a SipatGo",
  description: "A SipatGo existe para fazer da segurança do trabalho algo de que as pessoas querem participar. Conheça a nossa história e missão.",
  path: "/sobre",
});

const VALUES = [
  { icon: Target, title: "Missão", text: "Segurança do trabalho que as pessoas querem participar." },
  { icon: Rocket, title: "Como fazemos", text: "Simples de configurar sozinho, pronto em dias e com preço acessível para empresas de 50 a 500 pessoas." },
  { icon: HeartHandshake, title: "Para quem", text: "Para o RH e a CIPA que querem uma SIPAT da qual todo mundo fale bem, sem trabalho manual." },
];

export default function SobrePage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Sobre", path: "/sobre" }]}
        eyebrow="Sobre"
        title="Segurança que vira jogo. Jogo que vira hábito."
        lead="A SipatGo nasceu de uma pergunta simples: por que a semana mais importante para a segurança da empresa costuma ser a mais esquecida?"
      />

      <Section tone="sand" aria-labelledby="h-historia">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading id="h-historia" eyebrow="Nossa história" title="Da palestra que ninguém lembra para a semana que todo mundo comenta" />
          <div className="space-y-5 text-lg leading-8 text-sg-navy-900/85">
            <p>
              Todo ano, milhares de empresas fazem a SIPAT. E todo ano a história se repete: uma palestra no auditório, uma lista de presença em papel, metade dos turnos
              de fora e, na semana seguinte, quase ninguém lembra do que foi falado.
            </p>
            <p>
              A gente acredita que o problema não é o tema. Segurança importa para todo mundo. O problema é o formato. Por isso criamos uma SIPAT em doses curtas, no
              celular, com a mesma regra todo dia: assiste, joga, sobe no ranking.
            </p>
            <p>
              Para o RH, a promessa é outra: configurar em uma tarde, acompanhar ao vivo e sair da semana com o registro pronto para a documentação da CIPA.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="white" aria-label="Missão e valores">
        <ul className="grid gap-4 md:grid-cols-3">
          {VALUES.map((v) => (
            <li key={v.title} className="rounded-2xl bg-sg-sand-50 p-6">
              <v.icon aria-hidden className="size-7 text-sg-orange-500" strokeWidth={2} />
              <h2 className="mt-4 font-display text-xl font-bold text-sg-navy-900">{v.title}</h2>
              <p className="mt-2 text-base text-sg-gray-600">{v.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand" aria-labelledby="h-quem">
        <SectionHeading
          id="h-quem"
          eyebrow="Quem faz"
          title="Um time pequeno, perto de quem usa"
          lead="Somos um time enxuto de produto, tecnologia e segurança do trabalho. Cada campanha tem alguém da SipatGo acompanhando de perto, do setup ao relatório final."
        />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <CtaButton href="/contato" arrow trackLabel="sobre_contato">
            Falar com a gente
          </CtaButton>
          <CtaButton href={`mailto:${CONTACT_EMAIL}`} variant="outline" trackLabel="sobre_email">
            {CONTACT_EMAIL}
          </CtaButton>
        </div>
      </Section>

      <FinalCta origem="sobre" />
    </>
  );
}
