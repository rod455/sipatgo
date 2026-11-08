"use client";

import { useState } from "react";
import { Car, HardHat, HeartPulse, Sparkles, Sprout, UserPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CtaButton } from "./CtaButton";

const TILES = [
  {
    key: "sipat", icon: HardHat, title: "SIPAT", tag: "Semana Interna de Prevenção",
    text: "A semana que a CIPA promove todo ano (NR-5, item 5.3.1 “i”) ganha um jogo de 5 dias que soma às ações presenciais: vídeo, desafio, roleta e ranking ao vivo. Lista de presença e relatório saem prontos para a documentação da CIPA.",
    points: ["Programação definida pela CIPA, pronta para editar", "Check-in por QR nas palestras presenciais", "Presença e relatório para guardar por 5 anos"],
  },
  {
    key: "abril", icon: Sprout, title: "Abril Verde", tag: "Saúde e segurança no trabalho",
    text: "Reforce a cultura de prevenção no mês dedicado à segurança do trabalhador, com desafios rápidos que cabem no intervalo.",
    points: ["Dinâmicas sobre riscos do dia a dia", "Ranking por setor para engajar líderes", "Mural com fotos das equipes"],
  },
  {
    key: "maio", icon: Car, title: "Maio Amarelo", tag: "Segurança no trânsito",
    text: "Ideal para frotas, logística e quem se desloca para o trabalho: direção defensiva, fadiga e checklist do veículo em formato de jogo.",
    points: ["Modelo pronto para transporte", "Games para jogar com a família", "Check-in em blitz presencial por QR"],
  },
  {
    key: "integracao", icon: UserPlus, title: "Integração", tag: "Onboarding de novos colaboradores",
    text: "Transforme a integração de segurança em uma trilha de 5 etapas, com acerto medido pergunta a pergunta.",
    points: ["Conteúdo da empresa no lugar da apostila", "Saiba quem concluiu cada etapa", "Certificado de conclusão"],
  },
  {
    key: "saude", icon: HeartPulse, title: "Semana da Saúde", tag: "Bem-estar e saúde mental",
    text: "Sono, ergonomia, alimentação e saúde mental com vídeos curtos e desafios leves. Sem sala lotada, sem lista no papel.",
    points: ["Funciona no celular, sem instalar nada", "Recuperação para quem perdeu um dia", "Dashboard de adesão em tempo real"],
  },
  {
    key: "custom", icon: Sparkles, title: "Personalizada", tag: "Do seu jeito",
    text: "Seu tema, seus vídeos, suas perguntas, suas cores. A mesma mecânica que engaja, aplicada a qualquer campanha de 5 dias.",
    points: ["Editor sem código para o RH", "Logo e cores da sua empresa", "Brindes e roleta configuráveis"],
  },
] as const;

/** "Uma campanha para cada momento": cartões grandes com ícone + painel do selecionado. */
export function CampaignTiles() {
  const [active, setActive] = useState<(typeof TILES)[number]["key"]>("sipat");
  const tile = TILES.find((t) => t.key === active)!;
  return (
    <div>
      <div role="tablist" aria-label="Tipos de campanha" className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
        {TILES.map((t) => {
          const on = t.key === active;
          return (
            <button
              key={t.key} role="tab" aria-selected={on} aria-controls="campanha-painel" onClick={() => setActive(t.key)}
              className={cn(
                "group flex min-w-[150px] snap-start flex-col items-center gap-4 rounded-[28px] px-4 py-7 text-center transition-all duration-200",
                on ? "bg-sg-yellow-400 shadow-[0_18px_40px_-18px_rgba(255,198,40,.9)]" : "bg-sg-sand-50 hover:-translate-y-1 hover:bg-sg-sand-100",
              )}
            >
              <span className={cn("flex size-[72px] items-center justify-center rounded-[22px] transition-colors", on ? "bg-sg-navy-900" : "bg-sg-navy-700 group-hover:bg-sg-navy-900")}>
                <t.icon aria-hidden className="size-8 text-white" strokeWidth={1.75} />
              </span>
              <span className="font-display text-lg font-bold leading-tight text-sg-navy-900">{t.title}</span>
              <span className="text-[13px] leading-snug text-sg-navy-700/70">{t.tag}</span>
            </button>
          );
        })}
      </div>

      <div id="campanha-painel" role="tabpanel" className="mt-6 grid gap-8 rounded-[32px] bg-sg-navy-900 p-7 text-white md:grid-cols-[1.2fr_1fr] md:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-sg-yellow-400">{tile.tag}</p>
          <h3 className="mt-2 font-display text-3xl font-extrabold md:text-4xl">{tile.title}</h3>
          <p className="mt-4 max-w-xl text-lg leading-8 text-white/80">{tile.text}</p>
          <div className="mt-7">
            <CtaButton href="/contato" arrow trackLabel={`tiles_${tile.key}`}>Quero essa campanha</CtaButton>
          </div>
        </div>
        <ul className="grid content-center gap-3">
          {tile.points.map((p) => (
            <li key={p} className="flex items-center gap-3 rounded-2xl bg-white/[.07] px-5 py-4 text-base font-semibold ring-1 ring-white/10">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sg-orange-500"><Check aria-hidden className="size-4 text-sg-navy-900" strokeWidth={3} /></span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
