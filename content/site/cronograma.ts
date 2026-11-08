export type ScheduleRow = {
  dia: string;
  tema: string;
  abertura: string;
  atividadePrincipal: string;
  dinamica: string;
  extra: string;
  responsavel: string;
};

/** Modelo de cronograma de SIPAT de 5 dias (/sipat/cronograma). Ajuste à realidade da empresa. */
export const SCHEDULE: ScheduleRow[] = [
  {
    dia: "Segunda",
    tema: "Abertura do tema do ano",
    abertura: "Mensagem da liderança (vídeo de 1 min) e lançamento oficial",
    atividadePrincipal: "Vídeo de abertura (até 2 min)",
    dinamica: "Fato ou Fake (5 afirmações)",
    extra: "Criação do avatar · Mural abre · Game da família",
    responsavel: "CIPA + RH + diretoria",
  },
  {
    dia: "Terça",
    tema: "Tema complementar 1 (ex.: ergonomia)",
    abertura: "Lembrete nos grupos e no DDS",
    atividadePrincipal: "Vídeo do dia (até 2 min) + palestra presencial opcional",
    dinamica: "Acerte em Tempo (5 perguntas, 15 s)",
    extra: "Check-in presencial por QR · Game da família",
    responsavel: "CIPA + SESMT",
  },
  {
    dia: "Quarta",
    tema: "Aprofundamento do tema do ano",
    abertura: "Ranking parcial divulgado",
    atividadePrincipal: "Vídeo do dia (até 2 min)",
    dinamica: "Encontre os Erros (5 riscos na imagem)",
    extra: "Roleta de brindes 1 · Game da família",
    responsavel: "CIPA + RH",
  },
  {
    dia: "Quinta",
    tema: "Tema complementar 2 (ex.: saúde mental)",
    abertura: "Lembrete de recuperação para quem perdeu algum dia",
    atividadePrincipal: "Vídeo do dia (até 2 min) + roda de conversa opcional",
    dinamica: "Ligue os Pares (5 pares)",
    extra: "Votação do mural encerra às 23h59 · Game da família",
    responsavel: "CIPA + RH + liderança",
  },
  {
    dia: "Sexta",
    tema: "Encerramento do tema do ano",
    abertura: "Último dia de recuperação (até 18h)",
    atividadePrincipal: "Vídeo de encerramento (até 2 min)",
    dinamica: "Novos Hábitos (5 situações)",
    extra: "Roleta de brindes 2 · Pódio · Certificados · Game da família",
    responsavel: "CIPA + RH + diretoria",
  },
];

export const SCHEDULE_COLUMNS: { key: keyof ScheduleRow; label: string }[] = [
  { key: "dia", label: "Dia" },
  { key: "tema", label: "Tema" },
  { key: "abertura", label: "Abertura / comunicação" },
  { key: "atividadePrincipal", label: "Atividade principal" },
  { key: "dinamica", label: "Dinâmica" },
  { key: "extra", label: "Extras" },
  { key: "responsavel", label: "Responsável" },
];

export const PREP_CHECKLIST: { when: string; items: string[] }[] = [
  {
    when: "4 a 6 semanas antes",
    items: [
      "Reunião da CIPA para definir tema do ano e programação (registre em ata)",
      "Levantar orçamento e brindes",
      "Escolher formato: presencial, online ou híbrido",
    ],
  },
  {
    when: "2 a 3 semanas antes",
    items: [
      "Fechar palestrantes e fornecedores",
      "Gravar ou selecionar os 5 vídeos curtos",
      "Escrever as perguntas das dinâmicas e revisar com o SESMT",
      "Importar a lista de participantes",
    ],
  },
  {
    when: "1 semana antes",
    items: [
      "Divulgar: cartazes com QR, e-mail, grupos, DDS",
      "Alinhar com a liderança o papel de cada líder",
      "Testar o acesso em celulares diferentes",
    ],
  },
  {
    when: "Depois da semana",
    items: [
      "Entregar brindes e certificados",
      "Exportar lista de presença e relatório final",
      "Reunião da CIPA para avaliar resultados (registre em ata)",
    ],
  },
];
