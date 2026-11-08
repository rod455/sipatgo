import type { Metadata } from "next";
import { CalendarCheck, FileCheck2, Megaphone, PlayCircle, Settings2 } from "lucide-react";
import { AdminMockup } from "@/components/site/AdminMockup";
import { CtaButton } from "@/components/site/CtaButton";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { PhoneMockup } from "@/components/site/PhoneMockup";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMetadata } from "@/components/site/seo";
import { WeekTimeline } from "@/components/site/WeekTimeline";

export const metadata: Metadata = pageMetadata({
  title: "Como funciona a SIPAT digital da SipatGo",
  description:
    "Sua SIPAT em 4 passos: configure em uma tarde, divulgue com QR, jogue 5 dias no celular e encerre com pódio, certificados e relatório para a NR-5.",
  path: "/como-funciona",
  keywords: ["sipat digital", "como fazer sipat online", "sipat passo a passo"],
});

const STEPS = [
  {
    n: 1,
    icon: Settings2,
    title: "Configure",
    time: "1 tarde",
    text: "Importe a lista por CSV, escolha o tema do ano, cole os 5 vídeos do YouTube, escreva as perguntas, cadastre os brindes e aplique logo e cores da empresa.",
    bullets: ["Importação de participantes com validação de CPF", "Editor de dinâmica por tipo, com prévia", "Roleta ligada ou desligada por dia"],
  },
  {
    n: 2,
    icon: Megaphone,
    title: "Divulgue",
    time: "1 semana antes",
    text: "Baixe o kit pronto: cartaz A4, banner de e-mail e post quadrado, todos com QR code e a marca da empresa. Os líderes recebem o que falar no DDS.",
    bullets: ["Link e QR da campanha", "Peças em PNG para imprimir ou postar", "Mensagem de abertura da liderança"],
  },
  {
    n: 3,
    icon: PlayCircle,
    title: "Jogue",
    time: "Segunda a sexta",
    text: "Às 8h o dia abre. Cada pessoa assiste o vídeo, joga a dinâmica e sobe no ranking. Quarta e sexta têm roleta. Quem perdeu um dia recupera até sexta, às 18h.",
    bullets: ["5 minutos por dia, no celular", "Ranking ao vivo individual e por setor", "Mural, games da família e check-in por QR"],
  },
  {
    n: 4,
    icon: FileCheck2,
    title: "Encerre e comprove",
    time: "Sexta, 18h",
    text: "O ranking congela, o pódio aparece e os certificados são liberados. Você exporta a lista de presença por dia e o relatório final para a documentação da CIPA.",
    bullets: ["Pódio individual e setor campeão", "Certificado com código de verificação", "Relatório final em PDF e CSV"],
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Como funciona", path: "/como-funciona" }]}
        eyebrow="Como funciona"
        title="Sua SIPAT em 4 passos"
        lead="Você configura em uma tarde. A plataforma cuida da semana. Todo dia a mesma regra: assiste, joga, sobe no ranking."
        aside={<PhoneMockup className="hidden lg:block" />}
      >
        <CtaButton href="/contato" size="lg" arrow trackLabel="como_monte">
          Monte sua SIPAT
        </CtaButton>
        <CtaButton href="/demo" variant="ghost" size="lg" trackLabel="como_demo">
          Ver demo em 2 min
        </CtaButton>
      </PageHero>

      <Section tone="sand" aria-labelledby="h-passos">
        <SectionHeading id="h-passos" eyebrow="Passo a passo" title="Do zero ao pódio" />
        <ol className="mt-10 grid gap-6 md:grid-cols-2">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sg-navy-900/5 md:p-8">
              <div className="flex items-center gap-4">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-sg-navy-900 font-display text-xl font-extrabold text-white">{s.n}</span>
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-sg-navy-900">{s.title}</h3>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-sg-navy-500">
                    <s.icon aria-hidden className="size-4" strokeWidth={2} /> {s.time}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-base leading-7 text-sg-gray-600">{s.text}</p>
              <ul className="mt-4 space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-sg-navy-900">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-sg-orange-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="white" aria-labelledby="h-semana">
        <SectionHeading
          id="h-semana"
          eyebrow="A semana"
          title="Cada dia, um jogo novo"
          lead="Mesma estrutura todo dia (vídeo → dinâmica → roleta, se houver → ranking). Só o tipo de dinâmica muda, e todo dia vale o mesmo no ranking."
        />
        <WeekTimeline showExtras className="mt-10" />
      </Section>

      <Section tone="sand" aria-labelledby="h-pontos">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading id="h-pontos" eyebrow="Pontuação" title="Regras simples, ranking justo" />
            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { k: "Vídeo até o fim", v: "50" },
                { k: "Acerto de primeira", v: "100" },
                { k: "Acerto refazendo", v: "50" },
                { k: "Bônus de velocidade", v: "até 20" },
                { k: "Check-in presencial", v: "100" },
                { k: "Recuperação até sexta", v: "50%" },
              ].map((r) => (
                <div key={r.k} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sg-navy-900/5">
                  <dt className="text-sm text-sg-gray-600">{r.k}</dt>
                  <dd className="font-display text-2xl font-extrabold text-sg-navy-900 tabular">{r.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm text-sg-gray-600">
              Máximo por dia: 50 + 5 × 100 + 5 × 20 = <b className="text-sg-navy-900">650 pontos</b>. Nenhum dia pesa mais que outro.
            </p>
          </div>
          <div className="rounded-2xl bg-sg-navy-900 p-6 text-white md:p-8">
            <CalendarCheck aria-hidden className="size-8 text-sg-orange-500" strokeWidth={2} />
            <h3 className="mt-4 font-display text-2xl font-extrabold">Vídeo explicativo de 90 segundos</h3>
            <p className="mt-2 text-white/80">Em breve, um tour narrado pela plataforma. Enquanto isso, jogue a demo: leva 2 minutos e não precisa de cadastro.</p>
            <div className="mt-6">
              <CtaButton href="/demo" arrow trackLabel="como_demo_video">
                Jogar a demo
              </CtaButton>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="white" aria-labelledby="h-painel">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading
            id="h-painel"
            eyebrow="Painel do RH"
            title="Acompanhe tudo ao vivo"
            lead="Adesão por setor, funil do dia, perguntas com mais erro, brindes para entregar e posts para moderar. Sem planilha paralela."
          />
          <AdminMockup />
        </div>
      </Section>

      <FinalCta origem="como-funciona" />
    </>
  );
}
