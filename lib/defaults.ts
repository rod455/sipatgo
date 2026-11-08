import type { Sql } from "postgres";
import { addDays } from "./dates";
import type { ActivityType } from "./activities";

/**
 * Grade padrão da semana (seção 6 da especificação) com conteúdo de exemplo
 * de SST. O admin troca tudo no painel; serve para a campanha nascer jogável.
 */
export type DefaultDay = {
  day_index: number;
  title: string;
  theme: string;
  has_wheel: boolean;
  activity: { type: ActivityType; config: unknown };
  family: { type: "word_search" | "light_quiz"; config: unknown };
};

export const DEFAULT_WEEK: DefaultDay[] = [
  {
    day_index: 1,
    title: "Abertura: prevenção começa em mim",
    theme: "Tema do ano — abertura",
    has_wheel: false,
    activity: {
      type: "true_false",
      config: {
        items: [
          { statement: "Se o trabalho é rápido, não preciso usar o EPI.", answer: false, explanation: "Acidentes acontecem em segundos. O EPI vale para qualquer duração de tarefa." },
          { statement: "Quase-acidentes devem ser comunicados, mesmo sem ninguém ferido.", answer: true, explanation: "Relatar quase-acidentes ajuda a corrigir o risco antes que alguém se machuque." },
          { statement: "A CIPA é responsável só por organizar a SIPAT.", answer: false, explanation: "A CIPA atua o ano todo na prevenção: inspeções, investigação de acidentes e propostas de melhoria." },
          { statement: "Atalhos no procedimento economizam tempo sem aumentar o risco.", answer: false, explanation: "Pular etapas é uma das principais causas de acidentes. O procedimento existe por um motivo." },
          { statement: "Todo trabalhador pode recusar uma tarefa com risco grave e iminente.", answer: true, explanation: "O direito de recusa protege quem identifica risco grave e iminente. Comunique a liderança imediatamente." },
        ],
      },
    },
    family: { type: "word_search", config: { title: "Caça-palavras da prevenção", words: ["CAPACETE", "LUVA", "OCULOS", "BOTA", "CIPA", "RISCO", "ATENCAO", "PAUSA"] } },
  },
  {
    day_index: 2,
    title: "Saúde mental, respeito e prevenção ao assédio",
    theme: "Complementar 1",
    has_wheel: false,
    activity: {
      type: "timed_quiz",
      config: {
        time_limit_s: 15,
        items: [
          { question: "Qual atitude ajuda a reduzir o estresse no trabalho?", options: ["Pular o almoço para adiantar", "Fazer pausas curtas e planejadas", "Levar trabalho para casa todo dia", "Evitar conversar com a equipe"], correct_index: 1, explanation: "Pausas planejadas recuperam a atenção e reduzem erros." },
          { question: "Cansaço extremo no trabalho aumenta principalmente:", options: ["A produtividade", "O risco de acidentes", "A criatividade", "O salário"], correct_index: 1, explanation: "Fadiga reduz atenção e tempo de reação — e acidentes aumentam." },
          { question: "Percebeu um colega muito abatido há dias. O melhor é:", options: ["Ignorar, não é problema seu", "Fazer piada para animar", "Conversar e oferecer apoio", "Contar para todo mundo"], correct_index: 2, explanation: "Escuta e acolhimento fazem diferença. Indique os canais de apoio da empresa." },
          { question: "Um colega faz piadas de cunho sexual sobre uma colega, que fica constrangida. Isso é:", options: ["Brincadeira normal de equipe", "Pode ser assédio e deve ser interrompido e comunicado", "Problema só dela", "Aceitável fora do expediente"], correct_index: 1, explanation: "Comentários, piadas e insinuações indesejadas de cunho sexual podem configurar assédio. Interrompa, apoie quem foi atingido e comunique pelos canais da empresa." },
          { question: "Você sofreu ou presenciou assédio no trabalho. O melhor caminho é:", options: ["Guardar para si", "Usar o canal de denúncias ou procurar a CIPA/RH", "Expor nas redes sociais", "Esperar acontecer de novo"], correct_index: 1, explanation: "A empresa deve manter canal de denúncias com sigilo, e a CIPA atua na prevenção e no combate ao assédio e a outras formas de violência no trabalho." },
        ],
      },
    },
    family: { type: "light_quiz", config: { title: "Quiz em família: saúde", items: [
      { question: "Quantos copos de água por dia são recomendados?", options: ["1 a 2", "6 a 8", "15"], correct_index: 1 },
      { question: "Lavar as mãos evita:", options: ["Doenças", "Chuva", "Trânsito"], correct_index: 0 },
      { question: "Antes de atravessar a rua devemos:", options: ["Correr", "Olhar para os dois lados", "Mexer no celular"], correct_index: 1 },
      { question: "Dormir bem ajuda a:", options: ["Ficar mais atento", "Ficar com sono", "Nada"], correct_index: 0 },
      { question: "Remédios devem ficar:", options: ["Ao alcance das crianças", "Guardados em local alto e seguro", "Na cozinha aberta"], correct_index: 1 },
    ] } },
  },
  {
    day_index: 3,
    title: "Olhar de risco",
    theme: "Tema do ano — aprofundamento",
    has_wheel: true,
    activity: {
      type: "find_errors",
      config: {
        image_url: "/samples/encontre-os-erros.svg",
        max_wrong_clicks: 5,
        hotspots: [
          { id: "h1", x: 6, y: 18, w: 18, h: 20, label: "Trabalho em altura sem cinto", explanation: "Acima de 2 metros, o cinto de segurança tipo paraquedista ancorado é obrigatório." },
          { id: "h2", x: 32, y: 62, w: 16, h: 16, label: "Fios desencapados no chão", explanation: "Fios expostos causam choque e tropeços. Isole a área e chame a manutenção elétrica." },
          { id: "h3", x: 58, y: 20, w: 14, h: 18, label: "Extintor obstruído", explanation: "Extintores precisam estar sinalizados e com acesso livre." },
          { id: "h4", x: 74, y: 56, w: 18, h: 22, label: "Líquido derramado sem sinalização", explanation: "Piso molhado deve ser sinalizado e limpo imediatamente." },
          { id: "h5", x: 44, y: 30, w: 12, h: 16, label: "Operador sem óculos de proteção", explanation: "Esmerilhar sem óculos expõe os olhos a partículas em alta velocidade." },
        ],
      },
    },
    family: { type: "word_search", config: { title: "Caça-palavras: casa segura", words: ["TOMADA", "FOGAO", "ESCADA", "TAPETE", "REMEDIO", "GAS", "PISCINA"] } },
  },
  {
    day_index: 4,
    title: "EPI certo para cada risco",
    theme: "Complementar 2",
    has_wheel: false,
    activity: {
      type: "match_pairs",
      config: {
        pairs: [
          { left: "Ruído alto", right: "Protetor auricular", explanation: "Exposição a ruído acima do limite exige proteção auditiva." },
          { left: "Partículas no ar", right: "Óculos de segurança", explanation: "Óculos protegem os olhos de partículas e respingos." },
          { left: "Queda de objetos", right: "Capacete", explanation: "O capacete protege a cabeça contra impactos." },
          { left: "Produtos químicos", right: "Luva nitrílica", explanation: "Luvas adequadas ao produto evitam queimaduras e dermatites." },
          { left: "Trabalho em altura", right: "Cinto paraquedista", explanation: "O cinto ancorado detém a queda e salva vidas." },
        ],
      },
    },
    family: { type: "light_quiz", config: { title: "Quiz em família: no trânsito", items: [
      { question: "No carro, criança pequena vai:", options: ["No colo", "Na cadeirinha, no banco de trás", "No banco da frente"], correct_index: 1 },
      { question: "O cinto de segurança deve ser usado:", options: ["Só na estrada", "Sempre, em todos os bancos", "Só pelo motorista"], correct_index: 1 },
      { question: "Ao andar de bicicleta, use:", options: ["Capacete", "Chinelo", "Fone de ouvido alto"], correct_index: 0 },
      { question: "Sinal amarelo significa:", options: ["Acelerar", "Atenção, vai fechar", "Pode passar sempre"], correct_index: 1 },
      { question: "Celular ao volante:", options: ["Pode, se for rápido", "Nunca", "Só no trânsito parado"], correct_index: 1 },
    ] } },
  },
  {
    day_index: 5,
    title: "Encerramento: novos hábitos",
    theme: "Tema do ano — encerramento",
    has_wheel: true,
    activity: {
      type: "new_habits",
      config: {
        items: [
          { situation: "Você vai usar uma máquina e percebe que a proteção está solta.", options: ["Usa com cuidado redobrado", "Para, sinaliza e avisa a manutenção", "Pede para um colega usar"], correct_index: 1, explanation: "Máquina sem proteção não deve ser operada. Bloqueie e comunique." },
          { situation: "Um colega está sem óculos de proteção na bancada.", options: ["Avisa com respeito e oferece um par", "Finge que não viu", "Tira uma foto para zoar"], correct_index: 0, explanation: "Cuidado ativo: segurança é responsabilidade de todos." },
          { situation: "Você termina o turno muito cansado e precisa dirigir.", options: ["Toma um energético e vai", "Descansa antes ou busca outra forma de voltar", "Abre a janela e acelera"], correct_index: 1, explanation: "Sono ao volante é tão perigoso quanto álcool. Descanse." },
          { situation: "Há uma caixa pesada para levantar sozinho.", options: ["Levanta dobrando a coluna", "Pede ajuda ou usa equipamento de movimentação", "Arrasta com o pé"], correct_index: 1, explanation: "Evite sobrecarga: peça ajuda, use carrinho e dobre os joelhos." },
          { situation: "Você presenciou um quase-acidente no setor.", options: ["Comunica ao líder/CIPA", "Não fala para não complicar", "Comenta só no intervalo"], correct_index: 0, explanation: "Comunicar quase-acidentes evita o próximo acidente." },
        ],
      },
    },
    family: { type: "word_search", config: { title: "Caça-palavras: bons hábitos", words: ["CUIDADO", "EQUIPE", "SAUDE", "SONO", "AGUA", "RESPEITO", "PREVENIR"] } },
  },
];

/**
 * Modelo para empresas de transporte de passageiros (fretamento, turismo,
 * transporte coletivo). Conteúdo educativo geral — revise com o SESMT.
 */
export const TRANSPORT_WEEK: DefaultDay[] = [
  {
    day_index: 1,
    title: "Abertura: segurança em todo o trajeto",
    theme: "Tema do ano — abertura",
    has_wheel: false,
    activity: {
      type: "true_false",
      config: {
        items: [
          { statement: "Em trecho curto e conhecido, dá para dispensar a checagem do veículo antes de sair.", answer: false, explanation: "A inspeção antes da viagem (pneus, freios, luzes, portas, documentos) vale para qualquer trajeto. Falhas não escolhem distância." },
          { statement: "Atender o celular segurando o aparelho enquanto dirige é infração gravíssima.", answer: true, explanation: "Segurar ou manusear o celular ao volante é infração gravíssima. Com passageiros a bordo, o risco é ainda maior." },
          { statement: "Um quase-acidente na estrada deve ser relatado mesmo que ninguém tenha se machucado.", answer: true, explanation: "Relatar quase-acidentes ajuda a corrigir rotas, horários e procedimentos antes que algo grave aconteça." },
          { statement: "Ônibus pesado precisa da mesma distância de frenagem que um carro de passeio.", answer: false, explanation: "Veículos pesados precisam de mais espaço para parar. Mantenha distância maior do veículo da frente, principalmente na chuva." },
          { statement: "Segurança é só responsabilidade do motorista; quem trabalha na garagem ou no escritório não precisa se preocupar.", answer: false, explanation: "Manutenção, escala, tráfego, limpeza e atendimento: todo mundo influencia a segurança de cada viagem." },
        ],
      },
    },
    family: { type: "word_search", config: { title: "Caça-palavras da estrada", words: ["CINTO", "FREIO", "PNEU", "FAROL", "PAUSA", "ATENCAO", "SINAL", "VIAGEM"] } },
  },
  {
    day_index: 2,
    title: "Fadiga, saúde e respeito a bordo",
    theme: "Complementar 1",
    has_wheel: false,
    activity: {
      type: "timed_quiz",
      config: {
        time_limit_s: 15,
        items: [
          { question: "Qual destes é um sinal de fadiga ao dirigir?", options: ["Bocejar e piscar com frequência", "Cantar junto com o rádio", "Conferir os retrovisores", "Reduzir a velocidade na curva"], correct_index: 0, explanation: "Bocejos, piscadas longas e não lembrar dos últimos quilômetros são alertas. Pare em local seguro." },
          { question: "Sentiu sono no meio da viagem. O que resolve de verdade?", options: ["Abrir a janela", "Tomar mais café e seguir", "Parar em local seguro e descansar", "Aumentar o volume do som"], correct_index: 2, explanation: "Café e vento só disfarçam. O único remédio para o sono é descanso." },
          { question: "Antes de uma jornada longa, o ideal é:", options: ["Dormir bem na noite anterior", "Fazer uma refeição bem pesada", "Virar a noite para adiantar", "Tomar energético no lugar do sono"], correct_index: 0, explanation: "Sono de qualidade antes da viagem é a principal prevenção contra a fadiga." },
          { question: "Um passageiro faz comentários de cunho sexual a uma passageira, que fica constrangida. O que fazer?", options: ["Ignorar, não é com você", "Intervir com respeito e comunicar conforme o procedimento da empresa", "Rir junto para não criar clima", "Só pedir para ela trocar de lugar"], correct_index: 1, explanation: "Assédio não é brincadeira. Proteja quem foi atingido, siga o procedimento da empresa e, se preciso, acione as autoridades." },
          { question: "Sofreu ou presenciou assédio entre colegas de trabalho. O melhor caminho é:", options: ["Guardar para si", "Usar o canal de denúncias ou procurar a CIPA/RH", "Expor no grupo da garagem", "Resolver na discussão"], correct_index: 1, explanation: "A empresa deve manter canal de denúncias com sigilo, e a CIPA atua na prevenção e no combate ao assédio e a outras formas de violência no trabalho." },
        ],
      },
    },
    family: { type: "light_quiz", config: { title: "Quiz em família: viagem segura", items: [
      { question: "Na viagem de ônibus, o cinto de segurança:", options: ["Deve ser usado", "É só enfeite", "Só para crianças"], correct_index: 0 },
      { question: "Ao descer do ônibus, a criança deve:", options: ["Atravessar correndo pela frente", "Esperar o ônibus sair e atravessar com um adulto", "Sair sozinha"], correct_index: 1 },
      { question: "Bagagem no corredor do ônibus:", options: ["Pode atrapalhar uma saída rápida", "Não tem problema", "Ajuda a viagem"], correct_index: 0 },
      { question: "Dormir bem antes de viajar:", options: ["Deixa a viagem mais segura", "Não faz diferença", "Atrapalha"], correct_index: 0 },
      { question: "Colocar a cabeça ou o braço para fora da janela:", options: ["É perigoso", "É divertido e seguro", "Pode se for rápido"], correct_index: 0 },
    ] } },
  },
  {
    day_index: 3,
    title: "Olho na garagem",
    theme: "Tema do ano — aprofundamento",
    has_wheel: true,
    activity: DEFAULT_WEEK[2].activity,
    family: { type: "word_search", config: { title: "Caça-palavras: oficina segura", words: ["OLEO", "MACACO", "CALCO", "LUVA", "OCULOS", "EXTINTOR", "LIMPEZA"] } },
  },
  {
    day_index: 4,
    title: "Checklist do veículo",
    theme: "Complementar 2",
    has_wheel: false,
    activity: {
      type: "match_pairs",
      config: {
        pairs: [
          { left: "Pneus", right: "Calibragem e sulcos", explanation: "Pneu careca ou mal calibrado aumenta a distância de frenagem e o risco de aquaplanagem." },
          { left: "Freios", right: "Resposta firme do pedal", explanation: "Qualquer ruído ou pedal “mole”: o veículo não sai até a manutenção liberar." },
          { left: "Luzes", right: "Faróis, setas e luz de freio", explanation: "Ver e ser visto: confira todas as luzes antes de sair." },
          { left: "Saídas de emergência", right: "Desobstruídas e sinalizadas", explanation: "Em uma emergência, cada segundo conta para tirar os passageiros." },
          { left: "Extintor", right: "Carregado e dentro da validade", explanation: "Confira o lacre, o manômetro e a validade do extintor." },
        ],
      },
    },
    family: DEFAULT_WEEK[3].family,
  },
  {
    day_index: 5,
    title: "Cuidando de quem levamos",
    theme: "Tema do ano — encerramento",
    has_wheel: true,
    activity: {
      type: "new_habits",
      config: {
        items: [
          { situation: "Um passageiro está em pé no corredor com o ônibus em movimento.", options: ["Segue a viagem normalmente", "Orienta com educação a sentar e usar o cinto", "Acelera para chegar logo"], correct_index: 1, explanation: "Passageiro sentado e com cinto é passageiro protegido. Oriente com respeito." },
          { situation: "Começa uma chuva forte na rodovia.", options: ["Mantém a velocidade", "Reduz a velocidade e aumenta a distância", "Liga o pisca-alerta e segue rápido"], correct_index: 1, explanation: "Na chuva, a aderência cai. Reduza a velocidade e aumente a distância do veículo da frente." },
          { situation: "No checklist, você percebe uma luz de freio queimada.", options: ["Sai assim mesmo", "Comunica a manutenção e só sai após o reparo", "Deixa para ver na volta"], correct_index: 1, explanation: "Veículo com item de segurança com defeito não deve sair. Comunique e aguarde a liberação." },
          { situation: "Um colega da garagem trabalha embaixo do ônibus sem calço nas rodas.", options: ["Avisa e ajuda a calçar o veículo", "Não é problema seu", "Liga o motor para testar"], correct_index: 0, explanation: "Calço nas rodas e veículo travado evitam esmagamentos. Cuidar do colega é cuidar de todos." },
          { situation: "Você percebe que está com muito sono antes de assumir a escala.", options: ["Toma energético e vai", "Avisa o tráfego/liderança antes de assumir", "Não fala para não atrapalhar a escala"], correct_index: 1, explanation: "Avisar é atitude de segurança. Uma troca de escala é muito melhor que um acidente." },
        ],
      },
    },
    family: { type: "word_search", config: { title: "Caça-palavras: bons hábitos", words: ["CUIDADO", "RESPEITO", "SONO", "AGUA", "PAUSA", "CINTO", "PREVENIR"] } },
  },
];

export const CAMPAIGN_TEMPLATES = {
  industria: { label: "Indústria / geral", week: DEFAULT_WEEK },
  transporte: { label: "Transporte de passageiros", week: TRANSPORT_WEEK },
} as const;
export type CampaignTemplate = keyof typeof CAMPAIGN_TEMPLATES;

export const DEFAULT_PRIZES = [
  { internal_name: "Garrafa térmica", stock_total: 10, weight: 2 },
  { internal_name: "Kit chocolate", stock_total: 20, weight: 4 },
  { internal_name: "Caneca personalizada", stock_total: 15, weight: 3 },
  { internal_name: "Vale-lanche", stock_total: 10, weight: 2 },
  { internal_name: "Fone de ouvido", stock_total: 3, weight: 1 },
];

/** Cria campanha + 5 dias (seg–sex a partir de start_date) + dinâmicas e games padrão. */
export async function createCampaignWithDefaults(
  sql: Sql,
  companyId: string,
  input: { name: string; theme: string; start_date: string; status?: string; withPrizes?: boolean; template?: CampaignTemplate },
): Promise<string> {
  return sql.begin(async (tx) => {
    const [c] = await tx<{ id: string }[]>`
      insert into sipatgo.campaigns (company_id, name, theme, start_date, end_date, status, wall_challenge, opening_message)
      values (${companyId}, ${input.name}, ${input.theme}, ${input.start_date}, ${addDays(input.start_date, 4)},
              ${input.status ?? "draft"},
              ${"Poste uma foto da sua equipe mostrando o tema da SIPAT no dia a dia!"},
              ${"Bem-vindos à nossa SIPAT! Durante 5 dias, cada um de nós vai aprender, jogar e mostrar que segurança se faz junto."})
      returning id`;
    const week = CAMPAIGN_TEMPLATES[input.template ?? "industria"].week;
    for (const d of week) {
      const [day] = await tx<{ id: string }[]>`
        insert into sipatgo.campaign_days (campaign_id, day_index, date, title, theme, has_wheel)
        values (${c.id}, ${d.day_index}, ${addDays(input.start_date, d.day_index - 1)}, ${d.title}, ${d.theme}, ${d.has_wheel})
        returning id`;
      await tx`insert into sipatgo.activities (campaign_day_id, type, config) values (${day.id}, ${d.activity.type}, ${tx.json(d.activity.config as never)})`;
      await tx`insert into sipatgo.family_games (campaign_day_id, type, config) values (${day.id}, ${d.family.type}, ${tx.json(d.family.config as never)})`;
    }
    if (input.withPrizes) {
      for (const p of DEFAULT_PRIZES) {
        await tx`insert into sipatgo.prizes (campaign_id, internal_name, stock_total, stock_available, weight)
                 values (${c.id}, ${p.internal_name}, ${p.stock_total}, ${p.stock_total}, ${p.weight})`;
      }
    }
    return c.id;
  });
}
