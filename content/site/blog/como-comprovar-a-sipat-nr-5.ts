import type { BlogPost } from "./types";

export const comoComprovarSipat: BlogPost = {
  slug: "como-comprovar-a-sipat-nr-5",
  title: "Como comprovar a SIPAT: o que guardar para a NR-5",
  description:
    "Programação, listas de presença, atas, fotos e relatório: o que guardar para comprovar a realização da SIPAT e como organizar tudo sem papelada.",
  category: "NR-5",
  keywords: ["comprovação sipat", "registro sipat nr 5", "lista de presença sipat", "documentação cipa"],
  datePublished: "2026-11-08",
  readingMinutes: 5,
  author: "Equipe SipatGo",
  excerpt: "A semana acabou. E agora, o que vai para a pasta da CIPA? Um checklist simples para não correr atrás depois.",
  blocks: [
    {
      type: "p",
      text: "A SIPAT é uma das atribuições da CIPA na NR-5, e em uma fiscalização ou auditoria interna a pergunta costuma ser direta: **como vocês comprovam que ela aconteceu?** Não existe um formulário oficial único; o que existe é a boa prática de guardar evidências de planejamento, execução e avaliação.",
    },
    {
      type: "callout",
      tone: "warning",
      title: "Conteúdo informativo",
      text: "Não substitui a leitura da NR-5 vigente nem a orientação do seu SESMT, assessoria de SST ou jurídico.",
    },
    { type: "h2", text: "Antes da semana: planejamento" },
    {
      type: "ul",
      items: [
        "**Ata da reunião da CIPA** em que a SIPAT foi planejada, com tema e programação.",
        "**Programação oficial** com datas, horários, atividades e responsáveis.",
        "**Material de divulgação**: cartazes, e-mails, posts, com data.",
        "Contratos ou confirmações de palestrantes e fornecedores, se houver.",
      ],
    },
    { type: "h2", text: "Durante a semana: execução" },
    {
      type: "ul",
      items: [
        "**Lista de presença por atividade e por dia** (nome, setor e data, no mínimo).",
        "Registros fotográficos das atividades presenciais (com autorização de imagem).",
        "Material apresentado: vídeos, apresentações, perguntas das dinâmicas.",
        "Registro de eventos presenciais, como check-in em palestras e simulados.",
      ],
    },
    { type: "h2", text: "Depois da semana: avaliação" },
    {
      type: "ul",
      items: [
        "**Relatório final** com adesão, participação por setor e principais resultados.",
        "Indicadores de aprendizado (ex.: acerto por pergunta) que mostrem onde reforçar.",
        "**Ata da reunião de avaliação** da CIPA com pontos de melhoria para o próximo ano.",
        "Certificados emitidos, se a empresa optar por emitir.",
      ],
    },
    { type: "h2", text: "Quanto tempo guardar?" },
    {
      type: "p",
      text: "A NR-5 traz regras sobre a guarda da documentação da CIPA, e outras normas e a legislação trabalhista podem exigir prazos específicos. Defina o prazo com o seu SESMT ou jurídico e mantenha os arquivos organizados por ano, em formato digital, para encontrar rápido quando precisar.",
    },
    { type: "h2", text: "Como a plataforma ajuda" },
    {
      type: "p",
      text: "Na SipatGo, a presença é registrada automaticamente a cada vídeo assistido e cada dinâmica concluída. No fim, o RH exporta a **matriz de presença participante × dia**, o **relatório final em PDF e CSV** e a lista de certificados com código de verificação pública. O que antes era digitação vira download.",
    },
    {
      type: "p",
      text: "Para o passo a passo completo do que a norma pede, leia [SIPAT e NR-5: o que a norma exige](/sipat/nr-5).",
    },
    {
      type: "cta",
      text: "Quer ver o relatório final que a plataforma gera?",
      href: "/contato",
      label: "Falar com a gente",
    },
  ],
};
