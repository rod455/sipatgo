export type ThemeCategory = {
  slug: string;
  name: string;
  intro: string;
  themes: { title: string; hint: string }[];
};

export const THEME_OF_THE_YEAR = {
  title: "Eu cuido, você cuida, todo mundo volta para casa",
  why: "Funciona em qualquer segmento, conversa com segurança física e saúde mental e permite um tema complementar por dia: EPI, ergonomia, trânsito, emoções e família.",
};

/** Temas para SIPAT por categoria (/sipat/temas). Total: 56. */
export const THEME_CATEGORIES: ThemeCategory[] = [
  {
    slug: "seguranca-operacional",
    name: "Segurança operacional",
    intro: "O básico bem feito. Temas que conversam direto com o risco do dia a dia.",
    themes: [
      { title: "EPI: proteção que só funciona no corpo", hint: "Uso correto, conservação e troca." },
      { title: "Mãos seguras: cada dedo conta", hint: "Prensas, lâminas, pontos de esmagamento." },
      { title: "Bloqueio e etiquetagem: energia zero antes de mexer", hint: "LOTO na manutenção." },
      { title: "Trabalho em altura sem improviso", hint: "Ancoragem, inspeção do cinto, permissão de trabalho." },
      { title: "Máquinas e equipamentos: proteção não se remove", hint: "Dispositivos de segurança e intertravamentos." },
      { title: "Empilhadeira e pedestre: cada um no seu caminho", hint: "Faixas, pontos cegos, velocidade." },
      { title: "Espaço confinado: entrar só com autorização", hint: "Atmosfera, vigia, resgate." },
      { title: "Eletricidade: respeito antes de tudo", hint: "Choque, arco elétrico, extensões improvisadas." },
      { title: "Produtos químicos: leia antes de usar", hint: "Rotulagem, FDS, armazenamento." },
      { title: "5S: ambiente organizado é ambiente seguro", hint: "Arrumação, limpeza e padrão." },
    ],
  },
  {
    slug: "saude-e-bem-estar",
    name: "Saúde e bem-estar",
    intro: "Prevenção também é cuidar do corpo fora da linha de produção.",
    themes: [
      { title: "Ergonomia: seu corpo é sua ferramenta de trabalho", hint: "Postura, levantamento de carga, pausas." },
      { title: "Coluna em dia", hint: "Lombalgia, alongamento, levantamento correto." },
      { title: "Audição: barulho que não se ouve depois", hint: "Protetor auricular e PAIR." },
      { title: "Visão e proteção ocular", hint: "Partículas, respingos, telas." },
      { title: "Sono e fadiga: atenção que se recarrega", hint: "Turnos, descanso e acidentes." },
      { title: "Alimentação e hidratação no trabalho", hint: "Calor, energia e concentração." },
      { title: "Sedentarismo: levante e mexa-se", hint: "Ginástica laboral e pausas ativas." },
      { title: "Prevenção ao câncer de pele", hint: "Trabalho ao ar livre e protetor solar." },
      { title: "Vacinação em dia", hint: "Calendário do adulto e campanhas." },
      { title: "Álcool, drogas e trabalho não combinam", hint: "Riscos e onde buscar ajuda." },
    ],
  },
  {
    slug: "saude-mental",
    name: "Saúde mental e relações",
    intro: "Temas cada vez mais pedidos, e com respaldo legal desde que a CIPA incorporou a prevenção ao assédio.",
    themes: [
      { title: "Saúde mental também é segurança", hint: "Sinais de alerta e rede de apoio." },
      { title: "Estresse e ansiedade: como reconhecer e agir", hint: "Técnicas simples e quando procurar ajuda." },
      { title: "Prevenção ao assédio moral e sexual", hint: "O que é, como denunciar, canais da empresa." },
      { title: "Respeito e diversidade no trabalho", hint: "Convivência e inclusão." },
      { title: "Comunicação não violenta na equipe", hint: "Feedback e conflitos." },
      { title: "Burnout: quando o cansaço passa do limite", hint: "Sinais, prevenção e acolhimento." },
      { title: "Setembro Amarelo o ano todo", hint: "Valorização da vida e escuta." },
    ],
  },
  {
    slug: "comportamento",
    name: "Comportamento e cultura",
    intro: "Para quem quer ir além da regra e mexer no hábito.",
    themes: [
      { title: "Eu cuido, você cuida, todo mundo volta para casa", hint: "Cuidado ativo e coletivo." },
      { title: "Percepção de risco: o perigo que a rotina esconde", hint: "Excesso de confiança." },
      { title: "Quase acidente: o aviso que não pode ser ignorado", hint: "Relatar sem medo." },
      { title: "Direito de recusa: parar também é seguro", hint: "Quando e como interromper uma tarefa." },
      { title: "Pressa é inimiga da segurança", hint: "Prazo, atalho e consequência." },
      { title: "Liderança que dá o exemplo", hint: "O papel do líder na prevenção." },
      { title: "Segurança é valor, não prioridade", hint: "Prioridade muda; valor, não." },
      { title: "Celular e distração no trabalho", hint: "Atenção plena na tarefa." },
    ],
  },
  {
    slug: "emergencias",
    name: "Emergências e primeiros socorros",
    intro: "O que fazer nos primeiros minutos faz toda a diferença.",
    themes: [
      { title: "Primeiros socorros: o que fazer até a ajuda chegar", hint: "RCP, engasgo, hemorragias." },
      { title: "Prevenção e combate a incêndio", hint: "Classes de fogo e extintores." },
      { title: "Rota de fuga: você sabe onde fica?", hint: "Abandono de área e ponto de encontro." },
      { title: "Brigada de emergência: quem são e como ajudar", hint: "Papéis em uma emergência." },
      { title: "Choque elétrico: como socorrer sem virar vítima", hint: "Desligar antes de tocar." },
      { title: "Plano de emergência da sua unidade", hint: "Telefones, alarmes e responsáveis." },
    ],
  },
  {
    slug: "transito-e-trajeto",
    name: "Trânsito e trajeto",
    intro: "Boa parte dos acidentes acontece no caminho de ida e volta.",
    themes: [
      { title: "Trajeto seguro: do portão de casa ao portão da empresa", hint: "Acidente de trajeto." },
      { title: "Motociclista: visível e protegido", hint: "Capacete, roupa, distância." },
      { title: "Celular ao volante: a mensagem pode esperar", hint: "Distração e estatísticas." },
      { title: "Maio Amarelo: atenção pela vida", hint: "Campanha nacional de trânsito." },
      { title: "Direção defensiva para quem dirige a trabalho", hint: "Fadiga, jornada, revisão." },
    ],
  },
  {
    slug: "meio-ambiente-e-familia",
    name: "Meio ambiente, família e comunidade",
    intro: "Leve a prevenção para além do portão.",
    themes: [
      { title: "Segurança em casa: acidentes domésticos", hint: "Quedas, queimaduras, crianças." },
      { title: "Família na SIPAT", hint: "Quem espera você em casa." },
      { title: "Descarte correto e meio ambiente", hint: "Resíduos, coleta seletiva, vazamentos." },
      { title: "Calor e mudanças climáticas no trabalho", hint: "Estresse térmico e hidratação." },
      { title: "Prevenção à dengue e outras arboviroses", hint: "Água parada no trabalho e em casa." },
      { title: "Outubro Rosa e Novembro Azul", hint: "Prevenção do câncer de mama e de próstata." },
      { title: "Educação financeira e saúde emocional", hint: "Dívida também tira o sono." },
      { title: "Voluntariado e segurança na comunidade", hint: "Ações fora da empresa." },
      { title: "Sustentabilidade: segurança para as próximas gerações", hint: "Prevenção de longo prazo." },
      { title: "Segurança digital: golpes no celular", hint: "Phishing, PIX falso, senhas." },
    ],
  },
];

export const THEMES_TOTAL = THEME_CATEGORIES.reduce((n, c) => n + c.themes.length, 0);
