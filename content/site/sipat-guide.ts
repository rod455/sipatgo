import type { GuideSection } from "./blocks";

export const GUIDE_UPDATED_AT = "2026-11-08";

/** Guia completo /sipat (hub SEO). Linguagem cautelosa sobre a norma: sempre recomendar a leitura da NR-5 vigente. */
export const SIPAT_GUIDE: GuideSection[] = [
  {
    id: "o-que-e-sipat",
    title: "O que é SIPAT",
    blocks: [
      {
        type: "p",
        text: "**SIPAT é a Semana Interna de Prevenção de Acidentes do Trabalho.** É uma semana dedicada a ações de conscientização sobre segurança e saúde no trabalho, organizada dentro da própria empresa pela CIPA (Comissão Interna de Prevenção de Acidentes e de Assédio), em conjunto com a organização e com o SESMT, quando houver.",
      },
      {
        type: "p",
        text: "Na prática, a SIPAT é o momento do ano em que a empresa para (ou desacelera) para falar de prevenção de um jeito diferente do dia a dia: palestras, dinâmicas, gincanas, simulados, campanhas de saúde e, cada vez mais, atividades digitais e gamificadas que alcançam todos os turnos e unidades.",
      },
      {
        type: "p",
        text: "O objetivo não é cumprir tabela. Uma boa SIPAT muda comportamento: faz a pessoa reconhecer riscos que a rotina esconde, lembrar da atitude certa na hora certa e levar o cuidado para casa.",
      },
    ],
  },
  {
    id: "por-que-existe",
    title: "Por que a SIPAT existe",
    blocks: [
      {
        type: "p",
        text: "A CIPA existe no Brasil desde os anos 1940 e, ao longo das décadas, a promoção de uma semana anual de prevenção passou a fazer parte das suas atribuições na Norma Regulamentadora nº 5 (NR-5). A lógica é simples: além das ações contínuas de prevenção, a empresa reserva um período com **foco total no tema**, com participação de todos os níveis.",
      },
      {
        type: "p",
        text: "Para a empresa, a SIPAT é uma oportunidade de reforçar a cultura de segurança, ouvir os trabalhadores, apresentar mudanças (novos procedimentos, EPIs, máquinas) e mostrar que a liderança leva o assunto a sério. Para o trabalhador, é a chance de aprender, opinar e ser reconhecido por boas práticas.",
      },
    ],
  },
  {
    id: "quem-organiza",
    title: "Quem organiza a SIPAT",
    blocks: [
      {
        type: "p",
        text: "A organização da SIPAT é compartilhada. Em linhas gerais:",
      },
      {
        type: "ul",
        items: [
          "**CIPA:** define a programação, escolhe o tema e conduz a semana. A SIPAT é uma das atribuições da comissão na NR-5.",
          "**SESMT** (Serviço Especializado em Segurança e Medicina do Trabalho), onde houver: atua em conjunto com a CIPA, apoia tecnicamente e valida o conteúdo.",
          "**Organização (empresa):** fornece os meios para a realização, como tempo, espaço, orçamento e apoio da liderança.",
          "**RH:** na prática, costuma cuidar da logística, da comunicação interna, dos brindes e dos fornecedores.",
          "**Liderança:** dá o exemplo, libera a equipe para participar e reforça as mensagens no dia a dia.",
        ],
      },
      {
        type: "p",
        text: "Empresas que não são obrigadas a constituir CIPA (por número de empregados e grau de risco) seguem regras específicas da NR-5, como a nomeação de um representante para auxiliar nas ações de prevenção. Nesses casos, verifique na norma como as obrigações se aplicam à sua realidade.",
      },
    ],
  },
  {
    id: "o-que-a-nr-5-pede",
    title: "O que a NR-5 pede sobre a SIPAT",
    blocks: [
      {
        type: "p",
        text: "A NR-5 trata da CIPA: como ela é constituída, dimensionada, eleita, treinada e quais são as suas atribuições. Entre essas atribuições está **promover, anualmente, em conjunto com o SESMT, onde houver, a Semana Interna de Prevenção de Acidentes do Trabalho**, conforme a programação definida pela própria CIPA.",
      },
      {
        type: "p",
        text: "A norma passou por uma revisão ampla publicada em 2021 e, em 2022, a Lei nº 14.457 alterou o nome da comissão para **Comissão Interna de Prevenção de Acidentes e de Assédio**, incorporando a prevenção ao assédio sexual e a outras formas de violência no trabalho às suas atribuições. Por isso, muitas empresas passaram a incluir esse tema na programação da SIPAT.",
      },
      {
        type: "p",
        text: "O que a norma **não** faz é detalhar um formato obrigatório para as atividades da semana. Duração exata de cada ação, se é palestra ou jogo, presencial ou online: isso fica a critério da CIPA, de acordo com a realidade da empresa.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "Sempre confira a fonte",
        text: "Este guia é informativo e não substitui a leitura da NR-5. Normas regulamentadoras são atualizadas periodicamente: consulte a redação vigente no portal do Ministério do Trabalho e Emprego (gov.br) e valide com o seu SESMT, assessoria de SST ou jurídico. Veja também o nosso resumo em [SIPAT e NR-5](/sipat/nr-5).",
      },
    ],
  },
  {
    id: "quando-fazer",
    title: "Quando fazer a SIPAT",
    blocks: [
      {
        type: "p",
        text: "A SIPAT é anual, mas não tem data fixa no calendário nacional. Cada empresa escolhe a semana que faz mais sentido. Algumas dicas para escolher:",
      },
      {
        type: "ul",
        items: [
          "**Fuja dos picos de produção**, fechamento de mês, inventário e safra.",
          "**Evite semanas com feriado**, que quebram a sequência de 5 dias.",
          "**Considere o calendário da CIPA:** a semana precisa caber no mandato e ser planejada em reunião.",
          "**Aproveite campanhas nacionais** quando combinarem com o tema: Abril Verde (segurança e saúde no trabalho), Maio Amarelo (trânsito), Setembro Amarelo (valorização da vida), Outubro Rosa e Novembro Azul.",
        ],
      },
      {
        type: "p",
        text: "Comece o planejamento com **4 a 6 semanas de antecedência**. Com uma plataforma digital, a configuração cabe em uma tarde, mas a divulgação e o alinhamento com a liderança precisam de tempo.",
      },
    ],
  },
  {
    id: "como-organizar",
    title: "Como organizar a SIPAT em 7 passos",
    blocks: [
      {
        type: "ol",
        items: [
          "**Reúna a CIPA e registre em ata.** Defina objetivo, tema do ano, formato (presencial, online ou híbrido), orçamento e responsáveis.",
          "**Escolha o tema do ano e 2 temas complementares.** O tema principal abre, aprofunda e fecha a semana; os complementares entram na terça e na quinta. Veja [50+ temas para SIPAT](/sipat/temas).",
          "**Monte a programação de 5 dias.** Uma atividade principal por dia, sempre no mesmo formato, com extras pontuais. Baixe o [modelo de cronograma](/sipat/cronograma).",
          "**Prepare o conteúdo.** Vídeos curtos (até 2 minutos), perguntas revisadas pelo SESMT, palestrantes confirmados, brindes comprados.",
          "**Cadastre os participantes.** Lista com nome, setor e unidade. Se for digital, importe por CSV e teste o acesso em celulares diferentes.",
          "**Divulgue com antecedência.** Cartaz com QR code, DDS, e-mail, grupos de WhatsApp e, principalmente, os líderes falando com a equipe.",
          "**Execute, acompanhe e encerre.** Monitore a adesão por setor, cobre quem está ficando para trás, entregue brindes e certificados e faça a reunião de avaliação.",
        ],
      },
    ],
  },
  {
    id: "programacao",
    title: "Exemplo de programação de 5 dias",
    blocks: [
      {
        type: "p",
        text: "Uma programação que funciona bem tem **a mesma estrutura todo dia** (a pessoa aprende a regra uma vez) e muda só o tipo de atividade, para não cansar. Este é o formato que usamos na SipatGo:",
      },
      {
        type: "ul",
        items: [
          "**Segunda — Abertura do tema do ano:** mensagem da liderança, vídeo de abertura e Fato ou Fake.",
          "**Terça — Tema complementar:** vídeo e quiz cronometrado (Acerte em Tempo). Bom dia para uma palestra presencial.",
          "**Quarta — Aprofundamento:** vídeo e Encontre os Erros numa cena do ambiente real. Primeira roleta de brindes.",
          "**Quinta — Tema complementar:** vídeo e Ligue os Pares. Encerramento da votação do mural.",
          "**Sexta — Encerramento:** vídeo, Novos Hábitos, segunda roleta, pódio e certificados.",
        ],
      },
      {
        type: "p",
        text: "Quer mais ideias de atividades? Veja as [20 dinâmicas para SIPAT](/sipat/dinamicas), online e presenciais.",
      },
    ],
  },
  {
    id: "tema",
    title: "Como escolher o tema da SIPAT",
    blocks: [
      {
        type: "p",
        text: "O tema certo nasce dos dados da própria empresa, não de uma lista genérica. Antes de escolher, olhe para:",
      },
      {
        type: "ul",
        items: [
          "**Acidentes e quase acidentes** dos últimos 12 meses: onde, com quem, por quê.",
          "**Inventário de riscos** do programa de gerenciamento de riscos da empresa.",
          "**Mapa de riscos** e sugestões da própria CIPA.",
          "**Pesquisas de clima e afastamentos**, que costumam revelar temas de saúde mental e ergonomia.",
          "**Mudanças recentes:** máquina nova, layout novo, novo turno, nova unidade.",
        ],
      },
      {
        type: "p",
        text: "Depois, transforme o tema em uma frase curta e positiva. \"Mãos seguras: cada dedo conta\" funciona melhor que \"Prevenção de acidentes com membros superiores\". Precisa de inspiração? Temos [60 frases para SIPAT](/blog/frases-para-sipat).",
      },
    ],
  },
  {
    id: "adesao",
    title: "Como garantir adesão",
    blocks: [
      {
        type: "p",
        text: "A maior dor de quem organiza SIPAT é a adesão. Palestra única no auditório costuma alcançar só uma parte da empresa, e quase ninguém lembra do conteúdo na semana seguinte. O que funciona:",
      },
      {
        type: "ul",
        items: [
          "**Doses curtas e diárias:** 5 minutos por dia durante 5 dias rendem mais do que 2 horas num dia só.",
          "**Competição saudável:** ranking individual e por setor, com o setor medido pela média, para que a equipe puxe quem não jogou.",
          "**Recompensa para todos:** muitos brindes pequenos com chance real, em vez de um prêmio grande para um sortudo.",
          "**Acesso sem barreira:** sem app para instalar, sem e-mail corporativo, funcionando no celular.",
          "**Segunda chance:** quem perdeu um dia por folga ou turno pode recuperar até sexta.",
          "**Liderança envolvida:** líder com a lista de quem falta e um botão para lembrar a equipe.",
        ],
      },
      {
        type: "p",
        text: "Aprofundamos cada ponto em [como engajar o chão de fábrica](/blog/como-engajar-o-chao-de-fabrica).",
      },
    ],
  },
  {
    id: "online-ou-presencial",
    title: "SIPAT online, presencial ou híbrida",
    blocks: [
      {
        type: "p",
        text: "Não existe formato certo para todo mundo. A SIPAT **presencial** gera contato humano e é ótima para simulados e palestras inspiradoras, mas tem alcance limitado em empresas com turnos e várias unidades. A **online** alcança todos, mede aprendizado e gera registros automaticamente, mas exige conteúdo bem feito para não virar só mais um link.",
      },
      {
        type: "p",
        text: "Para a maioria das empresas de 50 a 5.000 pessoas, o **híbrido** é o melhor dos dois mundos: uma base digital diária que todo mundo joga, mais 1 ou 2 eventos presenciais com check-in por QR. Leia a análise completa em [SIPAT online funciona?](/blog/sipat-online-funciona).",
      },
    ],
  },
  {
    id: "lideranca",
    title: "Como envolver a liderança",
    blocks: [
      {
        type: "p",
        text: "Nenhuma campanha de segurança vai longe sem a liderança. O trabalhador observa o que o supervisor faz, não o que o cartaz diz. Algumas formas simples de trazer os líderes para dentro da SIPAT:",
      },
      {
        type: "ul",
        items: [
          "**Abertura pela diretoria:** uma mensagem curta (vídeo de 1 minuto) na segunda-feira mostra que o assunto importa de cima para baixo.",
          "**Líder como divulgador:** cada supervisor fala da SIPAT no DDS e lembra a equipe de jogar no intervalo.",
          "**Visibilidade da equipe:** dê ao líder a lista de quem já participou e de quem falta no dia. Ele vira aliado, não espectador.",
          "**Exemplo prático:** líderes jogam também e aparecem no ranking. Ninguém quer ficar atrás do próprio time.",
          "**Reconhecimento:** na sexta, celebre o setor campeão e o líder que mais puxou a adesão.",
        ],
      },
    ],
  },
  {
    id: "custos",
    title: "Quanto custa organizar uma SIPAT",
    blocks: [
      {
        type: "p",
        text: "O custo varia muito com o formato. Uma SIPAT presencial tradicional costuma somar palestrantes, estrutura de auditório, coffee break, material impresso, brindes e, principalmente, **horas paradas** da operação para levar as equipes até o evento. Em empresas com turnos, a mesma palestra às vezes precisa ser repetida três vezes.",
      },
      {
        type: "p",
        text: "No formato digital, o custo se concentra em três itens: a plataforma, o conteúdo (vídeos e perguntas, que podem ser produzidos pela própria CIPA ou contratados prontos) e os brindes. Como cada pessoa joga cerca de 5 minutos por dia, o impacto na produção é mínimo.",
      },
      {
        type: "p",
        text: "Para comparar opções, some tudo e divida pelo número de pessoas que **de fato participaram**. Uma SIPAT barata com 30% de adesão pode sair mais cara por participante do que uma com 80%. Veja como funcionam os [planos da SipatGo](/precos).",
      },
    ],
  },
  {
    id: "erros-comuns",
    title: "Erros comuns na SIPAT",
    blocks: [
      {
        type: "ul",
        items: [
          "**Começar a planejar uma semana antes.** Falta tempo para divulgar, comprar brindes e alinhar líderes.",
          "**Palestra longa como única atividade.** O conteúdo pode ser ótimo, mas a atenção não dura duas horas.",
          "**Tema genérico demais.** \"Segurança em primeiro lugar\" não diz nada. Conecte o tema aos riscos reais da empresa.",
          "**Esquecer os outros turnos.** Se a programação só funciona das 8h às 17h, uma parte da empresa fica de fora.",
          "**Prêmio que poucos podem ganhar.** Desanima quem acha que não tem chance.",
          "**Não registrar nada.** Sem lista de presença e relatório, fica difícil comprovar a realização.",
          "**Não avaliar.** Sem reunião de avaliação, a próxima SIPAT repete os mesmos erros.",
          "**Fazer a semana e esquecer o tema.** A SIPAT deveria ser o começo de uma conversa, não o fim.",
        ],
      },
    ],
  },
  {
    id: "como-comprovar",
    title: "Como comprovar a realização",
    blocks: [
      {
        type: "p",
        text: "Guarde evidências das três fases: **planejamento** (ata da CIPA, programação, divulgação), **execução** (listas de presença por atividade, fotos, materiais) e **avaliação** (relatório final e ata de avaliação). Defina com o SESMT ou jurídico por quanto tempo guardar.",
      },
      {
        type: "p",
        text: "Em uma SIPAT digital, boa parte disso sai pronta: a presença fica registrada a cada atividade concluída e o relatório final pode ser exportado em PDF e CSV. Detalhamos em [como comprovar a SIPAT](/blog/como-comprovar-a-sipat-nr-5).",
      },
    ],
  },
  {
    id: "checklist",
    title: "Checklist da SIPAT",
    blocks: [
      {
        type: "ul",
        items: [
          "Reunião da CIPA de planejamento registrada em ata",
          "Tema do ano e temas complementares definidos",
          "Programação de 5 dias com responsáveis",
          "Conteúdo pronto e revisado pelo SESMT",
          "Lista de participantes atualizada",
          "Brindes comprados e estoque controlado",
          "Divulgação com QR code, DDS e liderança",
          "Teste de acesso nos celulares da equipe",
          "Acompanhamento diário da adesão por setor",
          "Entrega de brindes e certificados",
          "Lista de presença e relatório final arquivados",
          "Reunião de avaliação registrada em ata",
        ],
      },
      {
        type: "cta",
        text: "Quer tudo isso pronto, com a marca da sua empresa?",
        href: "/contato",
        label: "Monte sua SIPAT",
      },
    ],
  },
];
