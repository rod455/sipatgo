import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  ClipboardCheck,
  Crown,
  FerrisWheel,
  FileCheck2,
  FileSpreadsheet,
  Gamepad2,
  Gift,
  Heart,
  Image as ImageIcon,
  Megaphone,
  Palette,
  QrCode,
  ShieldCheck,
  Smile,
  Trophy,
  Upload,
  Users,
  Zap,
} from "lucide-react";

export type Feature = { icon: LucideIcon; title: string; description: string };

/** Seção 3.6 — o que faz a galera voltar todo dia. */
export const ENGAGEMENT_FEATURES: Feature[] = [
  {
    icon: Trophy,
    title: "Ranking ao vivo",
    description: "Individual e por setor, atualizado na hora. O setor é medido pela média, então todo mundo puxa quem ainda não jogou.",
  },
  {
    icon: FerrisWheel,
    title: "Roleta de brindes",
    description: "Na quarta e na sexta, quem conclui o dia gira e sempre ganha. O RH é avisado na hora com o código de retirada.",
  },
  {
    icon: Award,
    title: "Avatar e selos",
    description: "Cada pessoa cria o próprio avatar e coleciona 14 selos: Madrugador, Relâmpago, Semana perfeita e outros.",
  },
];

export const ENGAGEMENT_EXTRAS: Feature[] = [
  { icon: ImageIcon, title: "Mural social com votação", description: "Fotos do desafio da semana, moderadas pelo RH." },
  { icon: Heart, title: "Games para a família", description: "Caça-palavras e quiz para jogar com quem você ama: a prevenção vai além do trabalho e chega em casa." },
  { icon: QrCode, title: "Check-in presencial por QR", description: "Palestra, simulado ou blitz valendo pontos." },
];

/** Seção 3.7 — recursos para o RH. */
export const HR_FEATURES: Feature[] = [
  { icon: Upload, title: "Importação por CSV", description: "Suba a planilha com nome, CPF, nascimento e setor." },
  { icon: ClipboardCheck, title: "Lista de presença automática", description: "Quem fez cada dia, sem papel e sem caneta." },
  { icon: FileCheck2, title: "Certificado automático", description: "PDF com código de verificação pública." },
  { icon: BarChart3, title: "Dashboard em tempo real", description: "Adesão por setor, funil do dia e acerto por pergunta." },
  { icon: Gift, title: "Gestão de brindes e entregas", description: "Estoque, sorteio, código e baixa na retirada." },
  { icon: FileSpreadsheet, title: "Relatório final para auditoria", description: "PDF e CSV para a documentação da CIPA." },
  { icon: Megaphone, title: "Kit de divulgação com QR", description: "Cartaz, banner de e-mail e post prontos." },
  { icon: Palette, title: "Marca da empresa em tudo", description: "Logo e cores da sua empresa, não da nossa." },
];

export type FeatureBlock = {
  id: string;
  title: string;
  icon: LucideIcon;
  lead: string;
  bullets: [string, string, string];
};

/** Blocos com âncora de /funcionalidades. */
export const FEATURE_BLOCKS: FeatureBlock[] = [
  {
    id: "dinamicas",
    title: "Dinâmicas",
    icon: Gamepad2,
    lead: "5 jogos, 5 dias, zero monotonia.",
    bullets: [
      "Fato ou Fake, Acerte em Tempo, Encontre os Erros, Ligue os Pares e Novos Hábitos.",
      "Toda dinâmica tem 5 itens com feedback e explicação imediatos.",
      "Troque a dinâmica de qualquer dia sem mexer em código.",
    ],
  },
  {
    id: "pontuacao",
    title: "Pontuação e ranking",
    icon: Trophy,
    lead: "Regras claras. Todo dia vale o mesmo.",
    bullets: [
      "Vídeo até o fim vale 50. Acerto de primeira, 100. Refez e acertou, 50.",
      "Bônus de velocidade de até 20 pontos por item.",
      "Ranking geral, do dia e por setor, atualizado ao vivo.",
    ],
  },
  {
    id: "roleta",
    title: "Roleta e brindes",
    icon: FerrisWheel,
    lead: "Todo giro ganha. O RH fica sabendo na hora.",
    bullets: [
      "Sorteio no servidor, ponderado pelo peso e restrito ao estoque.",
      "O participante recebe só um código de retirada, nunca o nome do brinde.",
      "Baixa da entrega pelo painel ou pela busca do código.",
    ],
  },
  {
    id: "avatar",
    title: "Avatar e selos",
    icon: Smile,
    lead: "Cada um com a sua cara. E com a sua coleção.",
    bullets: [
      "Avatar personalizável no primeiro acesso, editável depois.",
      "14 selos: Primeiro passo, Três seguidos, Gabaritou, Madrugador, Pódio e mais.",
      "Selos aparecem no perfil e no ranking.",
    ],
  },
  {
    id: "mural",
    title: "Mural social",
    icon: ImageIcon,
    lead: "A campanha vira assunto no corredor.",
    bullets: [
      "Desafio da semana definido pelo RH (ex.: foto da equipe com o tema).",
      "Todo post passa por aprovação antes de aparecer.",
      "Votação com pontos para o post mais votado do dia.",
    ],
  },
  {
    id: "familia",
    title: "Games para a família",
    icon: Heart,
    lead: "Segurança que vai para casa.",
    bullets: [
      "Caça-palavras e quiz leve com o tema do dia.",
      "Não pontua no ranking, mas rende selo.",
      "Joga no celular do participante, sem cadastro extra.",
    ],
  },
  {
    id: "check-in",
    title: "Check-in presencial",
    icon: QrCode,
    lead: "Palestra presencial também conta ponto.",
    bullets: [
      "QR code assinado para cada evento, com janela de horário.",
      "Escaneia com a câmera ou digita o código de 6 caracteres.",
      "100 pontos por evento e selo Presente.",
    ],
  },
  {
    id: "lideranca",
    title: "Liderança",
    icon: Crown,
    lead: "O líder vira aliado, não espectador.",
    bullets: [
      "Aba Meu time com quem fez e quem falta no dia.",
      "Botão de lembrete para os pendentes do setor.",
      "Mensagem ou vídeo da liderança na abertura da segunda.",
    ],
  },
  {
    id: "admin",
    title: "Admin e relatórios",
    icon: BarChart3,
    lead: "Você configura em uma tarde. A plataforma cuida da semana.",
    bullets: [
      "Dashboard ao vivo com adesão por setor e acerto por pergunta.",
      "Matriz de presença participante × dia para exportar.",
      "Relatório final em PDF e CSV para auditoria.",
    ],
  },
  {
    id: "marca",
    title: "Marca da empresa",
    icon: Palette,
    lead: "Quem aparece é a sua empresa.",
    bullets: [
      "Logo e cores da empresa em todas as telas.",
      "Kit de divulgação com cartaz A4, banner e post.",
      "A SipatGo só assina discretamente no rodapé.",
    ],
  },
  {
    id: "seguranca",
    title: "Segurança e LGPD",
    icon: ShieldCheck,
    lead: "Dados no lugar certo, com o mínimo necessário.",
    bullets: [
      "Tela de consentimento no primeiro acesso, com registro.",
      "CPF mascarado fora do painel do RH.",
      "Cada empresa isolada, com acesso por perfil.",
    ],
  },
];

export const COMPARISON: { row: string; sipatgo: string; presencial: string; tradicional: string }[] = [
  { row: "Alcance", sipatgo: "Todos os turnos e unidades", presencial: "Quem estava no horário", tradicional: "Quem tem e-mail e computador" },
  { row: "Duração da experiência", sipatgo: "5 dias, 5 minutos por dia", presencial: "1 a 2 horas de palestra", tradicional: "Curso longo de uma vez" },
  { row: "Lista de presença", sipatgo: "Automática, por dia", presencial: "Papel e caneta", tradicional: "Relatório manual" },
  { row: "Aprendizado medido", sipatgo: "Pergunta a pergunta", presencial: "Não", tradicional: "Prova no final" },
  { row: "Engajamento", sipatgo: "Ranking, roleta, selos e mural", presencial: "Sorteio no fim", tradicional: "Baixo" },
  { row: "Marca da empresa", sipatgo: "Em todas as telas", presencial: "Banner no auditório", tradicional: "Marca do fornecedor" },
  { row: "Tempo para colocar no ar", sipatgo: "Dias", presencial: "Semanas de logística", tradicional: "Semanas de projeto" },
  { row: "Precisa de e-mail corporativo", sipatgo: "Não (CPF + PIN)", presencial: "Não", tradicional: "Geralmente sim" },
];

export const TRUST_ITEMS: { icon: LucideIcon; label: string }[] = [
  { icon: FileCheck2, label: "Documentação para a CIPA" },
  { icon: ShieldCheck, label: "Pensado para a LGPD" },
  { icon: Zap, label: "Online + presencial" },
  { icon: Users, label: "Multiunidade" },
];
