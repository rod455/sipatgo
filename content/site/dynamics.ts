import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Link2, Search, Sparkles, Timer } from "lucide-react";

export type PlatformDynamic = {
  slug: string;
  name: string;
  day: string;
  icon: LucideIcon;
  oneLiner: string;
  how: string;
};

/** As 5 dinâmicas da plataforma. Todas têm 5 itens e o mesmo motor de pontuação. */
export const PLATFORM_DYNAMICS: PlatformDynamic[] = [
  {
    slug: "fato-ou-fake",
    name: "Fato ou Fake",
    day: "Segunda",
    icon: CheckCircle2,
    oneLiner: "Afirmações sobre segurança: é fato ou é fake? Responda e veja a explicação na hora.",
    how: "5 afirmações, dois botões. Derruba mitos clássicos (\"EPI incomoda, então posso tirar rapidinho\").",
  },
  {
    slug: "acerte-em-tempo",
    name: "Acerte em Tempo",
    day: "Terça",
    icon: Timer,
    oneLiner: "Quiz de múltipla escolha com cronômetro de 15 segundos. Pensou demais, perdeu.",
    how: "5 perguntas, 4 alternativas, relógio correndo. Treina a resposta rápida que a rotina exige.",
  },
  {
    slug: "encontre-os-erros",
    name: "Encontre os Erros",
    day: "Quarta",
    icon: Search,
    oneLiner: "Uma cena do dia a dia com 5 riscos escondidos. Toque em cada um antes do tempo acabar.",
    how: "Imagem com áreas marcadas pelo RH. Clique fora conta como erro. Ótimo para percepção de risco.",
  },
  {
    slug: "ligue-os-pares",
    name: "Ligue os Pares",
    day: "Quinta",
    icon: Link2,
    oneLiner: "Ligue cada risco à medida de controle certa. Placa, EPI, procedimento: tudo tem par.",
    how: "Duas colunas embaralhadas com 5 pares. Toque A e depois B. Fixa conceitos sem decoreba.",
  },
  {
    slug: "novos-habitos",
    name: "Novos Hábitos",
    day: "Sexta",
    icon: Sparkles,
    oneLiner: "Situações reais, três atitudes possíveis. Qual você escolheria amanhã cedo?",
    how: "5 situações de trabalho com 3 opções. Fecha a semana levando o aprendizado para a prática.",
  },
];

export type DynamicIdea = {
  name: string;
  format: "Online" | "Presencial" | "Híbrida";
  time: string;
  description: string;
  tip?: string;
  platform?: boolean;
};

/** 20 dinâmicas para SIPAT (/sipat/dinamicas). As 5 primeiras são as da plataforma. */
export const DYNAMIC_IDEAS: DynamicIdea[] = [
  {
    name: "Fato ou Fake",
    format: "Online",
    time: "5 min",
    platform: true,
    description:
      "Afirmações curtas sobre o tema do dia; cada pessoa decide se é fato ou fake e recebe a explicação logo depois. Funciona muito bem para desmontar mitos sobre EPI, ergonomia e saúde mental.",
    tip: "Misture afirmações óbvias com outras que \"parecem certas\". É aí que o aprendizado acontece.",
  },
  {
    name: "Acerte em Tempo",
    format: "Online",
    time: "5 min",
    platform: true,
    description:
      "Quiz de múltipla escolha com cronômetro. A pressão do relógio aumenta a atenção e deixa o ranking mais disputado.",
    tip: "Use 15 segundos por pergunta e enunciados de até duas linhas.",
  },
  {
    name: "Encontre os Erros",
    format: "Online",
    time: "5 min",
    platform: true,
    description:
      "Uma foto ou ilustração do ambiente de trabalho com riscos escondidos: fio solto, extintor obstruído, pessoa sem EPI. Quem encontrar mais rápido pontua mais.",
    tip: "Fotografe o próprio ambiente da empresa (sem pessoas identificáveis). O reconhecimento gera conversa.",
  },
  {
    name: "Ligue os Pares",
    format: "Online",
    time: "5 min",
    platform: true,
    description:
      "Duas colunas para ligar: risco × medida de controle, placa × significado, EPI × parte do corpo. Simples e muito eficaz para fixar conceitos.",
  },
  {
    name: "Novos Hábitos",
    format: "Online",
    time: "5 min",
    platform: true,
    description:
      "Situações reais do dia a dia com três atitudes possíveis. A pessoa escolhe o que faria; a explicação mostra o porquê. Ótima para fechar a semana.",
  },
  {
    name: "Caça aos riscos",
    format: "Presencial",
    time: "30 min",
    description:
      "Equipes percorrem uma área com uma ficha e anotam condições inseguras que encontrarem. A CIPA valida as anotações e premia a equipe mais atenta. Depois, as melhorias viram plano de ação.",
    tip: "Combine antes com a liderança da área para não atrapalhar a produção.",
  },
  {
    name: "Gincana de EPIs",
    format: "Presencial",
    time: "20 min",
    description:
      "Corrida em que as equipes precisam vestir corretamente um conjunto de EPIs. Um avaliador confere ajuste, ordem e conservação. Diverte e corrige vícios de uso.",
  },
  {
    name: "Teatro de situações",
    format: "Presencial",
    time: "40 min",
    description:
      "Grupo de voluntários encena um quase-acidente e, depois, a versão segura da mesma cena. A plateia aponta o que mudou. Funciona muito bem com humor.",
  },
  {
    name: "Mural de compromissos",
    format: "Híbrida",
    time: "Semana toda",
    description:
      "Cada pessoa registra um compromisso de segurança (\"vou usar o corrimão\") num mural físico ou digital. No fim da semana, os mais votados são reconhecidos.",
    tip: "Na versão digital, a moderação do RH evita posts fora do tema.",
  },
  {
    name: "Concurso de fotos",
    format: "Online",
    time: "Semana toda",
    description:
      "Desafio fotográfico com o tema do ano: a equipe usando EPI, o setor organizado, a família lembrando do cuidado. Votação aberta e prêmio para as melhores.",
    tip: "Peça autorização de uso de imagem antes de publicar.",
  },
  {
    name: "Bingo da prevenção",
    format: "Híbrida",
    time: "30 min",
    description:
      "Cartelas com termos de segurança. Em vez de números, o apresentador lê definições; quem marcar a linha primeiro grita \"Prevenção!\".",
  },
  {
    name: "Roda de conversa com quem viveu",
    format: "Presencial",
    time: "45 min",
    description:
      "Convidado que passou por um acidente ou trabalhou no resgate conta a história com foco em prevenção. Gera muita empatia; prepare o mediador para conduzir com cuidado.",
  },
  {
    name: "Simulado de emergência",
    format: "Presencial",
    time: "30 min",
    description:
      "Treino de abandono de área ou de primeiros socorros com a brigada. Cronometre e compartilhe o resultado para melhorar no próximo.",
    tip: "Avise todos antes. Simulado surpresa pode gerar pânico e risco real.",
  },
  {
    name: "Quiz relâmpago no refeitório",
    format: "Presencial",
    time: "10 min",
    description:
      "Perguntas rápidas no horário do almoço, com brinde para quem acertar. Aproveita um momento em que todo mundo já está reunido.",
  },
  {
    name: "Caça-palavras e cruzadinha",
    format: "Híbrida",
    time: "10 min",
    description:
      "Passatempos com vocabulário de segurança. Bons para a família jogar junto em casa e para quem tem pouco tempo durante o turno.",
  },
  {
    name: "Desafio da ergonomia",
    format: "Híbrida",
    time: "15 min",
    description:
      "Profissional de fisioterapia ou ergonomia ensina pausas ativas; as equipes gravam um vídeo curto fazendo a sequência e postam no mural.",
  },
  {
    name: "Paródia da segurança",
    format: "Híbrida",
    time: "Semana toda",
    description:
      "Equipes criam uma paródia de música famosa sobre o tema do ano. Apresentação na sexta e votação geral. Ótimo para engajar quem gosta de palco.",
  },
  {
    name: "Escape room da prevenção",
    format: "Presencial",
    time: "40 min",
    description:
      "Sala com enigmas sobre normas, sinais e procedimentos. A equipe só sai quando resolve tudo. Dá trabalho para montar, mas vira assunto por meses.",
  },
  {
    name: "Check-in em pontos de segurança",
    format: "Híbrida",
    time: "Semana toda",
    description:
      "QR codes espalhados em pontos estratégicos (extintores, rotas de fuga, chuveiro de emergência). Quem escaneia aprende onde ficam e ganha pontos.",
    tip: "Na SipatGo, o check-in por QR já vem pronto e soma 100 pontos por evento.",
  },
  {
    name: "Pódio e certificado",
    format: "Online",
    time: "Sexta",
    description:
      "Encerramento com ranking final individual e por setor, premiação e certificado para quem concluiu. Fecha a semana com sensação de conquista.",
  },
];
