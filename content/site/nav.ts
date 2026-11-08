export type NavLink = { label: string; href: string };

export const HEADER_LINKS: NavLink[] = [
  { label: "Como funciona", href: "/como-funciona" },
  { label: "Funcionalidades", href: "/funcionalidades" },
  { label: "Para quem", href: "/para-quem" },
  { label: "Cases", href: "/cases" },
  { label: "Preços", href: "/precos" },
  { label: "Blog", href: "/blog" },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Produto",
    links: [
      { label: "Como funciona", href: "/como-funciona" },
      { label: "Funcionalidades", href: "/funcionalidades" },
      { label: "Para quem", href: "/para-quem" },
      { label: "Preços", href: "/precos" },
      { label: "Demo jogável", href: "/demo" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { label: "Guia da SIPAT", href: "/sipat" },
      { label: "Temas para SIPAT", href: "/sipat/temas" },
      { label: "Dinâmicas para SIPAT", href: "/sipat/dinamicas" },
      { label: "Cronograma de SIPAT", href: "/sipat/cronograma" },
      { label: "SIPAT e NR-5", href: "/sipat/nr-5" },
      { label: "Blog", href: "/blog" },
      { label: "Materiais grátis", href: "/materiais" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "/sobre" },
      { label: "Cases", href: "/cases" },
      { label: "Contato", href: "/contato" },
      { label: "Entrar", href: "/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidade", href: "/privacidade" },
      { label: "Termos de uso", href: "/termos" },
    ],
  },
];
