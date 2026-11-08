/**
 * Slides do hero da home. A palavra em destaque troca junto com a foto.
 * Imagens (opcionais) em /public/site/hero/: `{key}-cena.jpg` (fundo P&B) e
 * `{key}-pessoa.png` (recorte com fundo transparente). Prompts em
 * docs/site/hero-imagens.md. Sem as imagens, o hero usa um fundo ilustrado.
 */
export type HeroSlide = {
  key: string;
  word: string;
  segment: string;
  /** Números do cartão de exemplo do painel. */
  adesao: number;
  setor: string;
  dia: string;
};

export const HERO_SLIDES: HeroSlide[] = [
  { key: "industria", word: "SIPAT", segment: "Indústria", adesao: 91, setor: "Manutenção", dia: "Olhar de risco" },
  { key: "rural", word: "SIPATR", segment: "Rural e agro", adesao: 87, setor: "Colheita", dia: "Máquinas agrícolas" },
  { key: "mineracao", word: "SIPATMIN", segment: "Mineração", adesao: 89, setor: "Lavra", dia: "Bloqueio e etiquetagem" },
  { key: "transporte", word: "Maio Amarelo", segment: "Transporte e frotas", adesao: 93, setor: "Motoristas", dia: "Fadiga ao volante" },
  { key: "escritorio", word: "Semana da Saúde", segment: "Escritório e serviços", adesao: 88, setor: "Atendimento", dia: "Saúde mental" },
];

export const HERO_CHIPS = ["+ engajamento", "+ presença", "+ prevenção", "+ resultado"];
