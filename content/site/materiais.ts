import type { LucideIcon } from "lucide-react";
import { CalendarDays, ClipboardCheck, FileSpreadsheet, Image as ImageIcon } from "lucide-react";

export type Material = {
  slug: string;
  title: string;
  description: string;
  format: string;
  icon: LucideIcon;
  /** Link direto quando já disponível sem cadastro. */
  href?: string;
};

export const MATERIALS: Material[] = [
  {
    slug: "cronograma",
    title: "Modelo de cronograma de SIPAT (5 dias)",
    description: "Tabela de segunda a sexta com tema, atividade, dinâmica e responsável. Baixe em CSV ou imprima.",
    format: "CSV / impressão",
    icon: CalendarDays,
    href: "/sipat/cronograma",
  },
  {
    slug: "checklist-nr-5",
    title: "Checklist de comprovação da SIPAT",
    description: "O que guardar antes, durante e depois da semana para a documentação da CIPA.",
    format: "Página para imprimir",
    icon: ClipboardCheck,
    href: "/sipat/nr-5#checklist",
  },
  {
    slug: "cartaz",
    title: "Cartaz editável de divulgação",
    description: "Modelo A4 com espaço para o tema do ano, datas e QR code de acesso.",
    format: "Canva (enviamos o link por e-mail)",
    icon: ImageIcon,
  },
  {
    slug: "planilha-brindes",
    title: "Planilha de controle de brindes",
    description: "Estoque, sorteados, código de retirada e status de entrega.",
    format: "Planilha (enviamos por e-mail)",
    icon: FileSpreadsheet,
  },
];
