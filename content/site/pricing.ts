export type Plan = {
  name: string;
  range: string;
  price: string;
  priceNote: string;
  highlight?: boolean;
  description: string;
  bullets: string[];
};

/** Preços ainda não definidos: exibir "A partir de R$ —" / "Sob consulta". */
export const PLANS: Plan[] = [
  {
    name: "Essencial",
    range: "Até 150 participantes",
    price: "A partir de R$ —",
    priceNote: "por campanha",
    description: "Para a primeira SIPAT digital de empresas pequenas e médias.",
    bullets: ["Tudo incluso", "1 unidade", "Suporte por e-mail e WhatsApp", "Relatório final NR-5"],
  },
  {
    name: "Profissional",
    range: "Até 500 participantes",
    price: "A partir de R$ —",
    priceNote: "por campanha",
    highlight: true,
    description: "Para quem tem vários setores, turnos e quer ranking disputado.",
    bullets: ["Tudo incluso", "Até 3 unidades", "Onboarding guiado", "Relatório final NR-5"],
  },
  {
    name: "Corporativo",
    range: "Acima de 500 participantes",
    price: "Sob consulta",
    priceNote: "proposta personalizada",
    description: "Para operações grandes, multiunidade e com exigências de TI e compras.",
    bullets: ["Tudo incluso", "Unidades ilimitadas", "Gerente de sucesso dedicado", "Revisão de segurança e LGPD"],
  },
];

/** Incluso em todos os planos. */
export const INCLUDED: string[] = [
  "5 dias de campanha com as 5 dinâmicas",
  "Ranking ao vivo individual e por setor",
  "Roleta de brindes com controle de estoque",
  "Avatar e 14 selos",
  "Mural social com moderação",
  "Games para a família",
  "Check-in presencial por QR",
  "Visão da liderança por setor",
  "Certificado automático com verificação",
  "Dashboard em tempo real",
  "Lista de presença e relatório final (PDF e CSV)",
  "Kit de divulgação com QR",
  "Logo e cores da sua empresa",
  "Importação de participantes por CSV",
];

export const ADDONS: { name: string; description: string }[] = [
  {
    name: "Conteúdo pronto",
    description: "Banco de vídeos curtos e perguntas revisadas por tema. Ideal para quem não tem tempo de produzir.",
  },
  {
    name: "Unidades extras",
    description: "Mais unidades além das inclusas no plano, cada uma com seu ranking e relatório.",
  },
  {
    name: "Suporte dedicado na semana",
    description: "Uma pessoa da SipatGo de plantão de segunda a sexta, no seu horário, com acompanhamento diário dos números.",
  },
];
