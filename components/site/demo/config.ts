/**
 * Configuração da demo jogável (/demo). Sem persistência: tudo vive no estado do navegador.
 * Para usar um vídeo real, defina o ID do YouTube abaixo (ex.: "dQw4w9WgXcQ").
 */
export const DEMO_YOUTUBE_ID = "";

/** Duração do vídeo-placeholder, em segundos. */
export const PLACEHOLDER_SECONDS = 60;
/** Segundos até o botão "Pular" aparecer. */
export const SKIP_AFTER_SECONDS = 5;
/** Cronômetro de bônus por item. */
export const BONUS_TIMER_SECONDS = 20;

export const POINTS = { video: 50, firstTry: 100, retry: 50, maxBonus: 20 } as const;

/** Bônus de velocidade: round(20 * max(0, 20 - t) / 20), só na 1ª tentativa correta. */
export function speedBonus(seconds: number): number {
  return Math.round((POINTS.maxBonus * Math.max(0, BONUS_TIMER_SECONDS - seconds)) / BONUS_TIMER_SECONDS);
}

export type FactItem = { statement: string; answer: boolean; hint: string; explanation: string };

export const FACT_ITEMS: FactItem[] = [
  {
    statement: "Perto de máquinas rotativas, como furadeira de bancada ou torno, usar luva sempre aumenta a segurança.",
    answer: false,
    hint: "Pense no que acontece se a luva encostar em algo que está girando.",
    explanation:
      "Fake. Perto de partes rotativas, a luva pode enroscar e puxar a mão junto. Siga o procedimento de cada máquina: em alguns casos, o certo é não usar luva.",
  },
  {
    statement: "Antes de fazer manutenção, a máquina deve ser desligada e bloqueada para ninguém religar por engano.",
    answer: true,
    hint: "E se alguém apertar o botão enquanto você está com a mão lá dentro?",
    explanation:
      "Fato. Desligar não basta: bloqueie a fonte de energia e sinalize (bloqueio e etiquetagem). Assim ninguém religa sem querer.",
  },
  {
    statement: "Se a proteção da máquina atrapalha a produção, dá para tirar por alguns minutos, com cuidado.",
    answer: false,
    hint: "Quanto tempo leva um acidente?",
    explanation:
      "Fake. Proteção removida é risco instalado: um acidente leva menos de um segundo. Se a proteção atrapalha, avise a liderança e a manutenção para ajustar.",
  },
];

export const VIDEO_SCENES: { title: string; text: string }[] = [
  { title: "SIPAT 2026", text: "Mãos seguras: cada dedo conta" },
  { title: "Você sabia?", text: "Dedos e mãos estão entre as partes do corpo mais atingidas em acidentes de trabalho." },
  { title: "Luva certa, tarefa certa", text: "Perto de partes que giram, a luva pode puxar a mão. Siga o procedimento da máquina." },
  { title: "Proteção não se remove", text: "Se a proteção atrapalha, avise. Não improvise." },
  { title: "Antes de mexer", text: "Desligue, bloqueie e sinalize. Energia zero." },
  { title: "Agora é com você", text: "3 perguntas valendo pontos. Responda rápido para ganhar bônus!" },
];

export type RankingPerson = { name: string; sector: string; points: number; color: string };

export const DEMO_RANKING: RankingPerson[] = [
  { name: "Carla", sector: "Manutenção", points: 398, color: "#1D4ED8" },
  { name: "Jorge", sector: "Usinagem", points: 372, color: "#15803D" },
  { name: "Bia", sector: "Qualidade", points: 351, color: "#B45309" },
  { name: "Rafa", sector: "Logística", points: 318, color: "#0E7490" },
  { name: "Seu Antônio", sector: "Montagem", points: 290, color: "#9D174D" },
  { name: "Dani", sector: "Administrativo", points: 262, color: "#6D28D9" },
  { name: "Léo", sector: "Expedição", points: 225, color: "#334155" },
  { name: "Marta", sector: "Segurança", points: 180, color: "#C2410C" },
];

export const WHEEL_SLICES = 8;
