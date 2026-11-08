# SipatGo — Identidade de Marca e Site Público

> Complemento do `PLATAFORMA_SIPAT.md`. Este documento cobre a **marca SipatGo** e o **site público** (sipatgo.com.br): landing, páginas institucionais, SEO e componentes.
> A área interna da campanha (`/app`, `/admin`) usa logo e cores da **empresa cliente**, não da SipatGo — a marca SipatGo aparece ali só no rodapé ("Feito com SipatGo") e na tela de login como assinatura discreta.

---

## 1. Identidade de marca

### 1.1 Posicionamento
- **O que é**: a plataforma que transforma a SIPAT em um jogo de 5 dias que todo mundo quer jogar.
- **Promessa**: adesão alta, registro automático para a NR-5 e zero trabalho manual para o RH.
- **Diferença da Weex**: simples de configurar sozinho, preço acessível para empresas de 50 a 500 pessoas, pronta em dias (não em semanas).
- **Tom de voz**: direto, energético, sem jargão de SST. Fala com o RH como colega, não como consultor. Frases curtas. Verbos de ação ("Monte", "Lance", "Acompanhe").

### 1.2 Tagline
- Principal: **"A SIPAT que todo mundo quer jogar."**
- Alternativas: "Sua SIPAT em 5 dias, 100% digital." / "Segurança que vira jogo. Jogo que vira hábito."

### 1.3 Paleta

Fugimos do roxo da Weex (#411787) e dos azuis frios de software corporativo. Base em **azul-marinho profundo** (confiança, SST) + **laranja de segurança** (energia, ação, cones e coletes) + **amarelo capacete** como acento.

| Token | Hex | Uso |
|---|---|---|
| `--sg-navy-900` | `#0B1F33` | Fundo de hero, rodapé, textos em fundo claro |
| `--sg-navy-700` | `#13385C` | Títulos, botões secundários |
| `--sg-navy-500` | `#1F5A8C` | Links, ícones |
| `--sg-orange-500` | `#FF6A13` | **Cor primária de ação**: CTA, destaques, "Go" do logo |
| `--sg-orange-600` | `#E5570A` | Hover de CTA |
| `--sg-yellow-400` | `#FFC628` | Acento: badges, selos, pontuação, roleta |
| `--sg-green-500` | `#22C55E` | Sucesso, acerto, check |
| `--sg-red-500` | `#EF4444` | Erro, alerta |
| `--sg-sand-50` | `#FAF7F2` | Fundo de seções claras (quente, não branco puro) |
| `--sg-sand-100` | `#F1EBE1` | Cards em fundo claro |
| `--sg-gray-600` | `#5B6B7B` | Texto secundário |
| `--sg-white` | `#FFFFFF` | Texto em fundo escuro, cards em hero |

Regras: laranja nunca em grandes áreas de fundo (só CTA e detalhes); navy para fundo de hero e rodapé; seções alternam `sand-50` e branco. Contraste mínimo AA em todos os pares texto/fundo.

### 1.4 Tipografia (Google Fonts)
- **Títulos**: `Sora` (700 / 800) — geométrica, moderna, boa em cartaz.
- **Texto**: `Inter` (400 / 500 / 600).
- **Números de pontuação/ranking** (área interna): `Sora` 800 tabular.

Escala: H1 56/64 desktop, 36/44 mobile · H2 40/48 · H3 28/36 · body 18/28 · small 14/20.

### 1.5 Logo
- **Wordmark**: "Sipat" em `Sora 800` navy-900 + "Go" em orange-500, sem espaço: **SipatGo**.
- **Símbolo**: seta/play (▶) inclinada embutida no "o" final ou um chevron duplo (») à direita, em laranja — ideia de avanço diário.
- Versões: horizontal (padrão), símbolo isolado (favicon, app icon), monocromática branca (fundo navy), monocromática navy (fundo claro).
- Área de respiro: altura do "S" em volta. Tamanho mínimo: 24 px de altura.
- Entregar em SVG + PNG @1x/@2x/@3x. Criar no Canva ou Figma a partir desta spec.

### 1.6 Ilustração e imagem
- Ilustrações flat com personagens diversos em ambiente de trabalho (fábrica, escritório, obra, hospital), paleta da marca, traços simples. Evitar fotos de banco genéricas.
- Mockups de celular mostrando a plataforma com uma **marca fictícia de cliente** ("Indústria Horizonte", cores verde/azul) para deixar claro que o cliente customiza.
- Ícones: `lucide-react`, stroke 2, cor navy-500 ou orange-500.

---

## 2. Arquitetura do site (sitemap)

```
sipatgo.com.br
├── /                         Landing (home)
├── /como-funciona            Jornada da campanha em 5 dias, passo a passo
├── /funcionalidades          Dinâmicas, roleta, ranking, mural, relatórios (âncoras)
├── /para-quem                Segmentos: indústria, logística, saúde, varejo, escritório, agro
├── /sipat                    Guia SEO: o que é SIPAT, NR-5, como organizar (hub de conteúdo)
│   ├── /sipat/temas          Lista de temas para SIPAT (conteúdo evergreen)
│   ├── /sipat/dinamicas      Dinâmicas para SIPAT online e presencial
│   ├── /sipat/cronograma     Modelo de cronograma de 5 dias (download)
│   └── /sipat/nr-5           O que a NR-5 exige e como registrar
├── /cases                    Resultados de clientes (começa com o 1º cliente)
│   └── /cases/[slug]
├── /blog                     Artigos (SEO de cauda longa)
│   └── /blog/[slug]
├── /precos                   Planos por faixa de participantes
├── /sobre                    Quem está por trás, missão
├── /contato                  Formulário + WhatsApp
├── /demo                     Campanha de demonstração jogável (3 itens, sem login)
├── /materiais                Downloads: cartaz editável, modelo de cronograma, checklist NR-5
├── /verify/[code]            Verificação pública de certificado (já no app)
├── /privacidade              Política de privacidade (LGPD)
├── /termos                   Termos de uso
└── /login                    Redireciona para {empresa}.sipatgo.com.br
```

Rotas da campanha ficam em subdomínio: `{empresa}.sipatgo.com.br/app` e `/admin`.

---

## 3. Landing page (/) — seção por seção

Estrutura espelha a Weex (hero → prova social → como funciona → conteúdo/dinâmicas → recursos → método → antes/depois → resultados → FAQ → contato), adaptada ao nosso tom e escala.

### 3.1 Header (sticky)
- Logo SipatGo · links: Como funciona · Funcionalidades · Para quem · Cases · Preços · Blog
- CTA primário (laranja): **"Monte sua SIPAT"** → /contato
- CTA secundário (ghost): **"Ver demo"** → /demo
- Mobile: menu hambúrguer, CTA primário sempre visível.

### 3.2 Hero (fundo navy-900)
- **H1**: "A SIPAT que todo mundo quer jogar."
- **Sub**: "Transforme a Semana de Prevenção em um jogo de 5 dias: vídeo, desafio e ranking ao vivo. Pronto em dias, com registro automático para a NR-5."
- CTAs: "Monte sua SIPAT" (laranja) · "Ver demo em 2 min" (ghost branco)
- Microprova: "Sem instalar nada · Funciona no celular · Com a marca da sua empresa"
- Visual: mockup de celular (tela do dia com cards seg–sex, um desbloqueado) + ao lado, mini ranking ao vivo com avatares. Rotação de 3 telas (dia, dinâmica, roleta).

### 3.3 Barra de confiança
- "Feito para empresas de 50 a 5.000 pessoas" · ícones: NR-5 · LGPD · 100% web · Multiunidade
- (Quando houver) logos de clientes em escala de cinza.

### 3.4 Como funciona — "Sua semana em 5 dias"
- Timeline horizontal seg→sex (vertical no mobile). Cada dia: ícone, tema, dinâmica.
  - Seg · Fato ou Fake · Abertura do tema do ano
  - Ter · Acerte em Tempo · Tema complementar
  - Qua · Encontre os Erros · 🎡 Roleta
  - Qui · Ligue os Pares · Votação do mural
  - Sex · Novos Hábitos · 🎡 Roleta + Pódio + Certificado
- Texto: "Todo dia a mesma regra: assiste o vídeo, joga o desafio, sobe no ranking. Dias futuros ficam bloqueados; quem perdeu recupera até sexta."
- CTA: "Ver a jornada completa" → /como-funciona

### 3.5 Dinâmicas — "5 jogos, 5 dias, zero monotonia"
- Grid de 5 cards com ícone, nome, descrição de uma linha e GIF curto:
  - Fato ou Fake · Acerte em Tempo · Encontre os Erros · Ligue os Pares · Novos Hábitos
- Rodapé da seção: "Cada acerto vale 100 pontos. Errou? Refaz e ganha 50. Respondeu rápido? Bônus."

### 3.6 Engajamento — "O que faz a galera voltar todo dia"
- 3 colunas: **Ranking ao vivo** (individual e por setor) · **Roleta de brindes** (RH avisado na hora) · **Avatar e selos** (14 badges)
- Linha abaixo: Mural social com votação · Games para a família · Check-in presencial por QR

### 3.7 Para o RH — "Você configura. A plataforma faz o resto."
- Mockup do painel admin (dashboard de adesão por setor).
- Lista de recursos com ícones: importação por CSV · lista de presença automática · certificado automático · dashboard em tempo real · gestão de brindes e entregas · relatório final para auditoria · kit de divulgação com QR · marca da empresa em tudo
- CTA: "Ver todas as funcionalidades" → /funcionalidades

### 3.8 Antes e depois (inspirado na Weex, mais curto)
- Duas colunas: **SIPAT de sempre** (palestra única, lista de presença no papel, 30% de adesão, ninguém lembra na semana seguinte) vs **SIPAT com SipatGo** (5 dias no celular, presença automática, 80%+ de adesão, aprendizado medido pergunta a pergunta).

### 3.9 Para quem
- Chips/cards por segmento com ilustração: Indústria · Logística · Saúde · Varejo · Escritório/Home office · Agro · Construção · Setor público
- Nota: "Funciona onde celular é proibido? Sim: totens, QR em pontos fixos e janela de recuperação."

### 3.10 Resultados (quando houver)
- Cards estilo Weex: logo do cliente · nº de trabalhadores · % adesão · acerto médio. Começa com o case do 1º cliente.
- Depoimento em vídeo (YouTube embed) do RH.

### 3.11 Preços (resumo)
- 3 cards: Até 150 · Até 500 · Acima de 500 participantes. "A partir de R$ X / campanha". CTA "Ver planos" → /precos. (Valores a definir.)

### 3.12 FAQ (acordeão, schema FAQPage)
- Precisa instalar app? · Funciona sem e-mail corporativo? · Como fica o registro da NR-5? · Posso usar meus próprios vídeos? · E vídeos do YouTube? · Quanto tempo para colocar no ar? · Como funciona a roleta? · É seguro (LGPD)? · Atende várias unidades? · O que acontece se alguém perder um dia?

### 3.13 CTA final (fundo navy)
- "Sua próxima SIPAT pode ser a melhor da história da empresa." · "Monte sua SIPAT" · "Falar no WhatsApp"
- Formulário curto embutido: nome, e-mail corporativo, empresa, nº de pessoas, mês da SIPAT.

### 3.14 Rodapé
- Logo · tagline · colunas: Produto (como funciona, funcionalidades, preços, demo) · Conteúdo (guia SIPAT, temas, dinâmicas, blog, materiais) · Empresa (sobre, cases, contato) · Legal (privacidade, termos) · redes · "© SipatGo 2026 · CNPJ".

---

## 4. Páginas internas do site — conteúdo mínimo

### /como-funciona
Passo a passo em 4 etapas (espelha "Marco Zero → Passo 4" da Weex): **1. Configure** (CSV, tema, vídeos, perguntas, brindes, cores — 1 tarde) · **2. Divulgue** (kit com QR e cartazes) · **3. Jogue** (a semana, dia a dia, com screenshots) · **4. Encerre e comprove** (pódio, certificados, relatório NR-5). Vídeo explicativo de 90s. CTA.

### /funcionalidades
Página longa com âncoras: Dinâmicas · Pontuação e ranking · Roleta e brindes · Avatar e selos · Mural · Família · Check-in presencial · Liderança · Admin e relatórios · Marca da empresa · Segurança e LGPD. Cada bloco: screenshot + 3 bullets. Tabela comparativa SipatGo × SIPAT presencial × "plataforma tradicional".

### /para-quem
Um bloco por segmento com dor específica, exemplo de tema do ano e print da plataforma com cores daquele setor fictício.

### /sipat (hub SEO)
Guia completo: o que é SIPAT, quem organiza (CIPA/SESMT), o que a NR-5 pede, como montar em 5 dias, erros comuns, checklist. 2.000+ palavras, índice lateral, links para subpáginas. É a página que mira "sipat", "o que é sipat", "como organizar sipat".
- `/sipat/temas`: 50+ temas organizados por categoria, com "tema do ano" sugerido. Mira "temas para sipat".
- `/sipat/dinamicas`: 20 dinâmicas (online e presenciais), com as 5 da plataforma em destaque. Mira "dinâmicas para sipat".
- `/sipat/cronograma`: modelo de cronograma seg–sex para baixar (lead magnet). Mira "cronograma sipat".
- `/sipat/nr-5`: o que a norma exige, como comprovar, o que a plataforma gera. Mira "sipat nr 5".

### /cases e /cases/[slug]
Template: logo, setor, nº de pessoas, desafio, o que foi feito (grade da semana), resultados (adesão, acertos, brindes, posts), depoimento, galeria do mural (com autorização).

### /blog
Artigos de cauda longa ("frases para sipat", "como engajar o chão de fábrica", "sipat online funciona?"). Categorias: SIPAT · Engajamento · NR-5 · Cases.

### /precos
Tabela por faixa de participantes; o que está incluso em todos (tudo); add-ons: conteúdo pronto (banco de vídeos/perguntas), unidades extras, suporte dedicado na semana. FAQ de cobrança. CTA para orçamento.

### /demo
Mini campanha jogável sem login: 1 vídeo de 60s + Fato ou Fake com 3 itens + roleta falsa + ranking com personagens fictícios. Ao final: "Gostou? Monte a sua." + formulário.

### /materiais
Lead magnets: cartaz editável (Canva), modelo de cronograma, checklist NR-5, planilha de controle de brindes. Captura e-mail (n8n → lista).

### /sobre
História curta, missão ("segurança do trabalho que as pessoas querem participar"), quem faz, contato.

### /contato
Formulário (nome, e-mail, empresa, cargo, nº de pessoas, mês previsto, mensagem) → n8n → e-mail + CRM. Botão WhatsApp. "Resposta em até 1 dia útil."

---

## 5. SEO

### 5.1 Metadados por página

| Página | Title (≤60) | H1 | Palavras-alvo |
|---|---|---|---|
| / | SipatGo — SIPAT online gamificada em 5 dias | A SIPAT que todo mundo quer jogar | sipat online, sipat gamificada, plataforma sipat |
| /como-funciona | Como funciona a SIPAT digital da SipatGo | Sua SIPAT em 4 passos | sipat digital, como fazer sipat online |
| /funcionalidades | Funcionalidades — ranking, roleta, relatórios NR-5 | Tudo que sua SIPAT precisa | plataforma sipat, sipat interativa |
| /sipat | O que é SIPAT e como organizar em 2026 — guia completo | O que é SIPAT | sipat, o que é sipat, como organizar sipat, sipat 2026 |
| /sipat/temas | 50 temas para SIPAT 2026 (por categoria) | Temas para SIPAT | temas para sipat, tema sipat 2026 |
| /sipat/dinamicas | 20 dinâmicas para SIPAT online e presencial | Dinâmicas para SIPAT | dinâmicas para sipat, gincana sipat |
| /sipat/cronograma | Modelo de cronograma de SIPAT (5 dias) para baixar | Cronograma de SIPAT | cronograma sipat, programação sipat |
| /sipat/nr-5 | SIPAT e NR-5: o que a norma exige | SIPAT na NR-5 | sipat nr 5, sipat obrigatória |
| /precos | Preços — SipatGo | Planos por tamanho de empresa | sipat preço, quanto custa sipat online |

### 5.2 Técnico
- Next.js com SSG/ISR para todas as páginas públicas; `sitemap.xml` e `robots.txt` automáticos.
- Schema.org: `Organization`, `SoftwareApplication`, `FAQPage` (home e /sipat), `Article` (blog), `BreadcrumbList`.
- Open Graph por página com imagem gerada (`@vercel/og`) no padrão da marca.
- Core Web Vitals: imagens `next/image` WebP, fontes com `next/font`, LCP do hero < 2,5s.
- Blog e hub /sipat publicados **antes** da temporada (agosto) nos próximos anos; para 2026, publicar o hub junto com o site.
- GA4 + Vercel Analytics; eventos: clique em CTA, envio de formulário, início/conclusão da demo.

---

## 6. Componentes do site (design system público)

Implementar em `apps/web/components/site/`:
- `SiteHeader`, `SiteFooter`, `CtaButton` (variantes primary/ghost/white), `SectionHeading` (eyebrow + h2 + lead)
- `PhoneMockup` (frame + slot de tela, rotação automática), `AdminMockup`
- `WeekTimeline` (seg–sex, responsivo), `DynamicCard` (ícone + nome + gif), `FeatureGrid`
- `BeforeAfter`, `SegmentChips`, `CaseCard`, `StatCard`, `Testimonial`
- `PricingCard`, `FaqAccordion` (gera FAQPage schema), `LeadForm` (react-hook-form + zod → n8n webhook), `WhatsAppButton` (flutuante)
- `DemoPlayer` (reaproveita componentes `TrueFalse` e `Wheel` da área interna em modo sem persistência)

Tokens em `apps/web/styles/brand-sipatgo.css` (`:root` com os `--sg-*`). Os tokens `--brand-*` da área interna continuam vindo da `company`; nunca misturar.

---

## 7. Textos-chave (copy pronta)

- **Hero**: "A SIPAT que todo mundo quer jogar." / "Transforme a Semana de Prevenção em um jogo de 5 dias: vídeo, desafio e ranking ao vivo. Pronto em dias, com registro automático para a NR-5."
- **CTA primário**: "Monte sua SIPAT" · **secundário**: "Ver demo em 2 min"
- **Como funciona**: "Todo dia a mesma regra: assiste, joga, sobe no ranking."
- **Dinâmicas**: "5 jogos, 5 dias, zero monotonia."
- **RH**: "Você configura em uma tarde. A plataforma cuida da semana."
- **Antes/depois**: "Da palestra que ninguém lembra para a semana que todo mundo comenta."
- **CTA final**: "Sua próxima SIPAT pode ser a melhor da história da empresa."
- **Rodapé interno (área do cliente)**: "Feito com SipatGo"

---

## 8. Ordem de implementação do site

1. Tokens de marca + fontes + `SiteHeader`/`SiteFooter`.
2. Landing (/) completa com conteúdo placeholder de mockups.
3. /contato + /precos + `LeadForm` → n8n.
4. /como-funciona, /funcionalidades, /para-quem.
5. Hub /sipat e 4 subpáginas (conteúdo pode ser gerado e revisado em paralelo ao código).
6. /demo (reaproveita componentes internos).
7. /cases (template) + /blog (MDX) + /materiais.
8. SEO técnico (sitemap, schema, OG), analytics.
9. /sobre, /privacidade, /termos.

Prioridade para 30/11: itens 1–3 e 8 (a empresa cliente e o RH vão abrir o site); o resto pode entrar em dezembro sem impactar a campanha.

---

## 9. Pendências
- Criar o logo (Canva/Figma) a partir da seção 1.5.
- Definir preços.
- Fotos/depoimento do 1º cliente para o primeiro case (pedir autorização já no contrato).
- CNPJ e textos legais (privacidade/termos) revisados.
- Vídeo explicativo de 90s para /como-funciona (pode ser screencast narrado).
