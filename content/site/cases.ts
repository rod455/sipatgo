export type CaseStudy = {
  slug: string;
  /** true = caso fictício, apenas para ilustrar o formato. Exibe selo "Exemplo ilustrativo". */
  illustrative: boolean;
  company: string;
  sector: string;
  people: number;
  city: string;
  summary: string;
  brand: { primary: string; secondary: string };
  challenge: string[];
  whatWeDid: { day: string; theme: string; dynamic: string; extra?: string }[];
  results: { label: string; value: string; note?: string }[];
  testimonial?: { quote: string; author: string; role: string };
  wallNote: string;
};

/**
 * Cases. Por enquanto, só um exemplo ilustrativo (dados fictícios).
 * Substitua pelo case real do 1º cliente quando houver autorização.
 */
export const CASES: CaseStudy[] = [
  {
    slug: "exemplo-industria-horizonte",
    illustrative: true,
    company: "Indústria Horizonte",
    sector: "Indústria metalúrgica",
    people: 120,
    city: "Interior de SP",
    summary: "Como seria a SIPAT de uma fábrica com 3 turnos: jogo de 5 dias no celular somado às ações presenciais da CIPA.",
    brand: { primary: "#15803D", secondary: "#1D4ED8" },
    challenge: [
      "Três turnos e uma palestra única no refeitório: metade da fábrica nunca participava.",
      "Lista de presença em papel, digitada depois pelo RH.",
      "Nenhuma forma de saber se a mensagem tinha sido entendida.",
    ],
    whatWeDid: [
      { day: "Seg", theme: "Mãos seguras: abertura", dynamic: "Fato ou Fake", extra: "Mensagem do diretor" },
      { day: "Ter", theme: "Ergonomia na linha", dynamic: "Acerte em Tempo", extra: "Check-in na palestra" },
      { day: "Qua", theme: "Pontos de esmagamento", dynamic: "Encontre os Erros", extra: "Roleta" },
      { day: "Qui", theme: "Saúde mental", dynamic: "Ligue os Pares", extra: "Votação do mural" },
      { day: "Sex", theme: "Mãos seguras: compromisso", dynamic: "Novos Hábitos", extra: "Roleta + pódio" },
    ],
    results: [
      { label: "Adesão", value: "—", note: "a preencher com dados reais" },
      { label: "Acerto médio na 1ª tentativa", value: "—", note: "a preencher" },
      { label: "Brindes entregues", value: "—", note: "a preencher" },
      { label: "Posts no mural", value: "—", note: "a preencher" },
    ],
    testimonial: {
      quote: "Espaço reservado para o depoimento do RH do primeiro cliente, com autorização.",
      author: "Nome do responsável",
      role: "Cargo · Empresa",
    },
    wallNote: "Galeria do mural publicada somente com autorização de uso de imagem dos participantes.",
  },
];
