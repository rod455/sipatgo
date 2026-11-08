import type { LucideIcon } from "lucide-react";
import { Briefcase, Factory, HardHat, Hospital, Landmark, Store, Tractor, Truck } from "lucide-react";

export type Segment = {
  slug: string;
  name: string;
  icon: LucideIcon;
  pain: string;
  how: string;
  themeExample: string;
  /** Cores da marca fictícia exibida no mockup. */
  demoBrand: { name: string; primary: string; secondary: string };
};

export const SEGMENTS: Segment[] = [
  {
    slug: "industria",
    name: "Indústria",
    icon: Factory,
    pain: "Três turnos, linha que não pode parar e palestra no refeitório que metade da fábrica perde.",
    how: "Cada pessoa joga no próprio celular, no intervalo, em 5 minutos. Quem não pode usar celular na área joga no totem ou na recuperação até sexta.",
    themeExample: "Mãos seguras: cada dedo conta",
    demoBrand: { name: "Indústria Horizonte", primary: "#15803D", secondary: "#1D4ED8" },
  },
  {
    slug: "logistica",
    name: "Logística",
    icon: Truck,
    pain: "Motoristas na estrada, CD com empilhadeira girando e equipe espalhada em várias bases.",
    how: "Link e QR em cada base, ranking por unidade e conteúdo curto que cabe na parada do caminhão.",
    themeExample: "Atenção no pátio: quem vê, previne",
    demoBrand: { name: "TransRota", primary: "#B45309", secondary: "#0F172A" },
  },
  {
    slug: "saude",
    name: "Saúde",
    icon: Hospital,
    pain: "Plantões 12×36, risco biológico e equipe que mal tem tempo para almoçar.",
    how: "Janela de recuperação até sexta, dinâmicas de 5 minutos e temas como perfurocortantes e saúde mental.",
    themeExample: "Cuidar de quem cuida",
    demoBrand: { name: "Hospital Vida Plena", primary: "#0E7490", secondary: "#9D174D" },
  },
  {
    slug: "varejo",
    name: "Varejo",
    icon: Store,
    pain: "Lojas espalhadas, alta rotatividade e gente que entrou semana passada.",
    how: "Cadastro por CSV de todas as lojas, ranking entre unidades e linguagem simples para quem é novo.",
    themeExample: "Loja segura, cliente seguro",
    demoBrand: { name: "Rede Bom Preço", primary: "#B91C1C", secondary: "#1E3A8A" },
  },
  {
    slug: "escritorio",
    name: "Escritório e home office",
    icon: Briefcase,
    pain: "Riscos menos visíveis: ergonomia, sedentarismo, saúde mental e trânsito.",
    how: "Temas de saúde integral, mural com fotos do home office e games para a família jogar junto.",
    themeExample: "Pausa também é produtividade",
    demoBrand: { name: "Nexo Serviços", primary: "#6D28D9", secondary: "#0F766E" },
  },
  {
    slug: "agro",
    name: "Agro",
    icon: Tractor,
    pain: "Campo extenso, sinal de internet instável e safra que não espera.",
    how: "Telas leves que carregam rápido, check-in por QR na sede e recuperação para quem estava na lavoura.",
    themeExample: "No campo, segurança também se planta",
    demoBrand: { name: "Fazendas Aurora", primary: "#4D7C0F", secondary: "#92400E" },
  },
  {
    slug: "construcao",
    name: "Construção",
    icon: HardHat,
    pain: "Canteiro muda toda semana, muita gente terceirizada e risco de queda no topo da lista.",
    how: "Dinâmicas visuais (Encontre os Erros com fotos da obra), cadastro de terceiros e ranking por frente de trabalho.",
    themeExample: "Do chão ao topo, ninguém trabalha sem proteção",
    demoBrand: { name: "Construtora Alicerce", primary: "#C2410C", secondary: "#334155" },
  },
  {
    slug: "setor-publico",
    name: "Setor público",
    icon: Landmark,
    pain: "Secretarias diferentes, servidores com perfis variados e necessidade de prestação de contas.",
    how: "Relatórios completos para documentação, acesso sem e-mail institucional e ranking por secretaria.",
    themeExample: "Servir com segurança",
    demoBrand: { name: "Prefeitura de Vale Verde", primary: "#1D4ED8", secondary: "#047857" },
  },
];

export const SEGMENT_NOTE =
  "Funciona onde celular é proibido? Sim: totens, QR em pontos fixos e janela de recuperação.";
