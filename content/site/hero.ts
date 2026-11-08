/**
 * Hero da home: "A SIPAT que todo mundo quer {verbo}."
 * Cada verbo é um motor de engajamento que a plataforma já entrega, mostrado
 * na tela do celular (participante) e no cartão do RH (empresa). A semana
 * avança de segunda a sexta conforme os slides.
 */
export type HeroDriver = {
  key: "jogar" | "disputar" | "ganhar" | "familia" | "reconhecer";
  verb: string;
  tab: string;
  day: string;
  dayTheme: string;
  /** O que a empresa ganha com isso (cartão do RH). */
  rh: { label: string; value: string; note: string };
};

export const HERO_DRIVERS: HeroDriver[] = [
  { key: "jogar", verb: "jogar", tab: "Desafio diário", day: "Seg", dayTheme: "Abertura",
    rh: { label: "Adesão no 1º dia", value: "78%", note: "5 min por pessoa, no celular" } },
  { key: "disputar", verb: "disputar", tab: "Ranking por setor", day: "Ter", dayTheme: "Ergonomia",
    rh: { label: "Setores com adesão acima de 70%", value: "9 de 10", note: "líderes puxando as equipes" } },
  { key: "ganhar", verb: "ganhar", tab: "Roleta de brindes", day: "Qua", dayTheme: "Olhar de risco",
    rh: { label: "Brindes entregues", value: "41/60", note: "estoque e retirada controlados" } },
  { key: "familia", verb: "levar pra casa", tab: "Jogos em família", day: "Qui", dayTheme: "Casa segura",
    rh: { label: "Partidas em família", value: "214", note: "a prevenção chega em casa" } },
  { key: "reconhecer", verb: "concluir", tab: "Certificado e selos", day: "Sex", dayTheme: "Novos hábitos",
    rh: { label: "Relatório final", value: "PDF", note: "presença e evidências para a CIPA" } },
];
