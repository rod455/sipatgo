import type { GuideSection } from "./blocks";

/** Conteúdo de /sipat/nr-5. Linguagem cautelosa: não citar itens/alíneas sem certeza. */
export const NR5_SECTIONS: GuideSection[] = [
  {
    id: "o-que-e-a-nr-5",
    title: "O que é a NR-5",
    blocks: [
      {
        type: "p",
        text: "A **Norma Regulamentadora nº 5 (NR-5)** estabelece as regras da CIPA, a Comissão Interna de Prevenção de Acidentes e de Assédio. Ela define quais organizações precisam constituir a comissão, como dimensioná-la de acordo com o número de empregados e o grau de risco da atividade, como funcionam a eleição, o mandato, o treinamento dos membros e quais são as atribuições da CIPA.",
      },
      {
        type: "p",
        text: "A norma passou por uma revisão ampla publicada em 2021 e foi atualizada em 2022 para refletir a Lei nº 14.457, que ampliou o nome e o escopo da comissão para incluir a **prevenção ao assédio** sexual e a outras formas de violência no trabalho.",
      },
    ],
  },
  {
    id: "sipat-e-obrigatoria",
    title: "A SIPAT é obrigatória?",
    blocks: [
      {
        type: "p",
        text: "Para as organizações que precisam constituir CIPA, sim: entre as atribuições da comissão listadas na NR-5 está **promover, anualmente, em conjunto com o SESMT, onde houver, a Semana Interna de Prevenção de Acidentes do Trabalho (SIPAT)**, conforme programação definida pela CIPA. Cabe à organização proporcionar os meios necessários para que a comissão desempenhe as suas atribuições.",
      },
      {
        type: "p",
        text: "Organizações que não se enquadram na obrigação de constituir CIPA seguem regras próprias da norma, como a nomeação de um representante para auxiliar na execução das ações de prevenção. Se esse é o seu caso, verifique na redação vigente como as atribuições se aplicam.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "Confira a redação vigente",
        text: "Não reproduzimos números de itens e alíneas porque eles mudam entre revisões. Consulte a NR-5 atualizada no portal do Ministério do Trabalho e Emprego (gov.br) e valide a aplicação na sua empresa com o SESMT, a assessoria de SST ou o jurídico.",
      },
    ],
  },
  {
    id: "o-que-a-norma-define",
    title: "O que a norma define (e o que deixa livre)",
    blocks: [
      { type: "h3", text: "O que está na norma" },
      {
        type: "ul",
        items: [
          "Que a SIPAT é uma atribuição da CIPA, a ser promovida anualmente.",
          "Que a promoção é feita em conjunto com o SESMT, onde houver.",
          "Que a programação é definida pela CIPA.",
          "Que a organização deve proporcionar os meios para a CIPA atuar.",
        ],
      },
      { type: "h3", text: "O que fica a critério da CIPA" },
      {
        type: "ul",
        items: [
          "O tema e os subtemas da semana.",
          "O formato das atividades: palestras, dinâmicas, jogos, simulados, campanhas de saúde.",
          "Se as atividades serão presenciais, online ou híbridas.",
          "A escolha da semana no calendário, respeitando a realidade da operação.",
        ],
      },
      {
        type: "p",
        text: "Com a inclusão da prevenção ao assédio no escopo da CIPA, vale considerar o tema na programação. A Lei nº 14.457/2022 também trouxe obrigações de capacitação e sensibilização periódicas sobre violência, assédio, igualdade e diversidade para empresas com CIPA; muitas organizações aproveitam a SIPAT para isso. Confirme com o seu jurídico como atender a essas exigências.",
      },
    ],
  },
  {
    id: "como-comprovar",
    title: "Como comprovar a SIPAT",
    blocks: [
      {
        type: "p",
        text: "Não existe um formulário oficial de comprovação. A boa prática é manter evidências organizadas das três fases da semana, que mostram que ela foi planejada pela CIPA, realizada e avaliada:",
      },
      {
        type: "ul",
        items: [
          "**Ata da reunião da CIPA** com o planejamento da SIPAT (tema, programação, responsáveis).",
          "**Programação oficial** divulgada aos trabalhadores.",
          "**Listas de presença por atividade e por dia.**",
          "**Materiais utilizados:** vídeos, apresentações, perguntas, cartazes.",
          "**Registros fotográficos** das atividades presenciais, com autorização de imagem.",
          "**Relatório final** com participação e resultados.",
          "**Ata da reunião de avaliação** com pontos de melhoria.",
        ],
      },
    ],
  },
  {
    id: "o-que-a-plataforma-gera",
    title: "O que a SipatGo gera automaticamente",
    blocks: [
      {
        type: "ul",
        items: [
          "**Programação da semana** com tema, vídeo e dinâmica de cada dia.",
          "**Matriz de presença participante × dia**, exportável em CSV e PDF.",
          "**Relatório final** com adesão geral e por setor, aprendizado (acerto na primeira tentativa por pergunta), ranking, brindes entregues e certificados emitidos.",
          "**Registro de check-in** em eventos presenciais (palestras, simulados) via QR code.",
          "**Certificados** com código de verificação pública.",
          "**Registro de consentimento** (LGPD) no primeiro acesso de cada participante.",
        ],
      },
      {
        type: "p",
        text: "As atas de reunião da CIPA continuam sendo responsabilidade da comissão. A plataforma não substitui a CIPA; ela tira o trabalho manual da execução e entrega os registros prontos.",
      },
    ],
  },
];

export const NR5_CHECKLIST: string[] = [
  "Ata da reunião de planejamento da SIPAT",
  "Programação oficial (datas, atividades, responsáveis)",
  "Comprovantes de divulgação (cartazes, e-mails, posts)",
  "Lista de presença por dia e por atividade",
  "Materiais apresentados (vídeos, slides, perguntas)",
  "Fotos das atividades presenciais (com autorização)",
  "Relatório final de participação e resultados",
  "Certificados emitidos (se houver)",
  "Ata da reunião de avaliação da SIPAT",
  "Plano de ação com melhorias para o próximo ano",
];
