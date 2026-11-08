import type { LucideIcon } from "lucide-react";
import { Award, CheckCircle2, Link2, Search, Timer } from "lucide-react";

export type WeekDay = {
  short: string;
  name: string;
  dynamic: string;
  dynamicType: "true_false" | "timed_quiz" | "find_errors" | "match_pairs" | "new_habits";
  theme: string;
  extras: string[];
  wheel: boolean;
  icon: LucideIcon;
};

/** Grade padrão da semana (seção 6 da especificação da plataforma). */
export const WEEK: WeekDay[] = [
  {
    short: "Seg",
    name: "Segunda",
    dynamic: "Fato ou Fake",
    dynamicType: "true_false",
    theme: "Abertura do tema do ano",
    extras: ["Mensagem da liderança", "Criação do avatar", "Mural abre"],
    wheel: false,
    icon: CheckCircle2,
  },
  {
    short: "Ter",
    name: "Terça",
    dynamic: "Acerte em Tempo",
    dynamicType: "timed_quiz",
    theme: "Tema complementar",
    extras: ["Check-in presencial (opcional)", "Game da família"],
    wheel: false,
    icon: Timer,
  },
  {
    short: "Qua",
    name: "Quarta",
    dynamic: "Encontre os Erros",
    dynamicType: "find_errors",
    theme: "Aprofundamento do tema",
    extras: ["Roleta de brindes", "Selo Três seguidos"],
    wheel: true,
    icon: Search,
  },
  {
    short: "Qui",
    name: "Quinta",
    dynamic: "Ligue os Pares",
    dynamicType: "match_pairs",
    theme: "Tema complementar",
    extras: ["Votação do mural", "Lembrete de recuperação"],
    wheel: false,
    icon: Link2,
  },
  {
    short: "Sex",
    name: "Sexta",
    dynamic: "Novos Hábitos",
    dynamicType: "new_habits",
    theme: "Encerramento do tema do ano",
    extras: ["Roleta de brindes", "Pódio", "Certificado"],
    wheel: true,
    icon: Award,
  },
];
