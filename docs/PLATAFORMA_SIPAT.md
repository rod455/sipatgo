# SipatGo — Plataforma de Campanha Gamificada (SIPAT Digital)

> Documento de especificação para implementação via Claude Code.
> **Produto/marca:** SipatGo · domínios: `sipatgo.com.br` (principal) e `sipatgo.com` (redirect) — disponíveis em 08/11/2026, registrar antes de iniciar.
> Tagline sugerida: "A SIPAT que todo mundo quer jogar."
> Referência de mercado: Weex (weex.com.br). Escopo: tudo em uma única entrega, sem fases.
> Deadline: plataforma completa e configurada em **30/11/2026**.

---

## 1. Visão geral

Aplicação web, mobile-first, para rodar uma campanha educativa gamificada de **1 semana (segunda a sexta)** dentro de uma empresa. Cada dia libera um vídeo (YouTube) + uma dinâmica; participantes acumulam pontos, competem em ranking individual e por setor, giram roleta de brindes em dias específicos e recebem certificado no final. O RH/admin configura tudo, acompanha em tempo real e exporta relatórios para registro da SIPAT (NR-5).

**Multiempresa desde o início**: toda entidade pertence a uma `company`; cada company pode ter N `campaigns`. A primeira campanha é para 120 pessoas.

### Princípios
- Mesma estrutura todo dia (vídeo → dinâmica → roleta se houver → ranking); só o tipo de dinâmica muda.
- Pontuação máxima por dia idêntica, para nenhum dia pesar mais no ranking.
- O participante nunca sabe qual brinde ganhou; só que ganhou e deve retirar no RH.
- Admin configura a campanha sem mexer em código (datas, vídeos, perguntas, dinâmicas, brindes, cores, logo).

---

## 2. Stack

| Camada | Escolha | Observações |
|---|---|---|
| Frontend | **Next.js 15 (App Router) + TypeScript** | Server Components para admin, Client Components para jogo |
| UI | **Tailwind CSS + shadcn/ui** | Tema via CSS variables (`--brand-primary`, `--brand-secondary`, `--brand-accent`) carregadas da `company` |
| Backend/DB | **Supabase** (Postgres, Auth, Realtime, Storage, Edge Functions) | RLS em todas as tabelas |
| Auth | Supabase Auth com **custom flow**: CPF + data de nascimento (1º acesso) → define PIN; depois CPF + PIN | Implementar como e-mail sintético `{{cpf}}@{{company_slug}}.local` + senha = PIN com hash, via Edge Function `auth-cpf` |
| Realtime | Supabase Realtime (Postgres Changes) em `scores_view` / tabela `participant_scores` | Ranking ao vivo |
| Avatar | **DiceBear** (`@dicebear/core` + estilos `adventurer`, `avataaars`, `bottts`) | Avatar gerado a partir de opções escolhidas; salva o JSON de opções + SVG em Storage |
| Vídeo | **YouTube IFrame Player API** | Evento `onStateChange === ENDED` + checagem `getCurrentTime()/getDuration() >= 0.9` libera a dinâmica |
| Notificações | **n8n** via webhook | E-mail (e opcional WhatsApp) para RH em eventos de brinde e resumo diário |
| PDF | `@react-pdf/renderer` em Edge Function / route handler | Certificado e relatório final |
| QR Code | `qrcode` (npm) | Check-in presencial e kit de divulgação |
| Deploy | **Vercel** | Preview por branch |
| Jobs agendados | Supabase `pg_cron` ou Vercel Cron | Liberação diária 08h, lembretes, fechamento sexta 18h |

---

## 3. Perfis de usuário

| Perfil | Acesso |
|---|---|
| **Participante** | Jogo, ranking, mural, perfil, certificado |
| **Líder** | Tudo do participante + visão do próprio setor (adesão, quem fez/não fez) |
| **Admin/RH** | Painel completo da campanha, brindes, relatórios, moderação |
| **Super admin** | Gestão de companies (multiempresa) |

Papel armazenado em `participants.role` (`participant` | `leader` | `admin` | `superadmin`).

---

## 4. Regras de negócio

### 4.1 Calendário
- Campanha tem `start_date` (segunda) e `end_date` (sexta), configurados pelo admin.
- Dias são `day_index` 1..5.
- **Liberação**: conteúdo do dia abre às **08:00** (timezone da company, default `America/Sao_Paulo`).
- Dias futuros aparecem **bloqueados** (cadeado) na home.
- **Recuperação**: dia anterior não feito pode ser concluído até **sexta 18:00**, valendo **50% dos pontos** e **sem bônus de velocidade**. Flag `is_makeup = true` na tentativa.
- Após sexta 18:00 a campanha entra em `status = closed`: nada mais pontua; ranking congela; pódio e certificados liberados.

### 4.2 Pontuação

| Evento | Pontos |
|---|---|
| Assistir vídeo do dia até o fim (≥90%) | **50** |
| Item da dinâmica correto na 1ª tentativa | **100** |
| Item correto após errar (refazer) | **50** |
| Bônus de velocidade por item (cronômetro 20s) | **0 a +20**, linear: `bonus = round(20 * max(0, (20 - t)) / 20)`, só na 1ª tentativa correta |
| Check-in presencial (QR) | **100** por evento |
| Post no mural aprovado | **30** (máx. 1 post/dia pontuando) |
| Post mais votado do dia | **100** |
| Games da família | **0 pontos** no ranking — só badge |
| Recuperação (makeup) | 50% dos pontos de vídeo + dinâmica, sem bônus |

**Máximo por dia (sem extras)**: 50 + 5×100 + 5×20 = **650**.
Toda dinâmica tem **5 itens**; "item" = pergunta, par, erro a encontrar ou situação.

**Refazer**: participante pode refazer um item errado quantas vezes quiser dentro do dia; só a primeira acerto pontua (50). Feedback imediato após cada item.

### 4.3 Ranking
- **Individual**: soma de todos os pontos. Desempate: menor `total_response_time_ms`.
- **Por setor**: **média** dos pontos dos participantes do setor (inclui quem não jogou, com 0 — incentiva o setor a puxar os ausentes). Desempate: maior adesão %.
- Ranking **geral** (acumulado) e **do dia**, ambos visíveis todos os dias para todos.
- Atualização em tempo real via Realtime; mostra todas as 120 pessoas com avatar, nome, setor, pontos; destaca a posição do usuário logado.

### 4.4 Roleta
- Ativa nos dias configurados com `has_wheel = true` (default: **quarta e sexta**).
- Liberada após concluir a dinâmica do dia (não na recuperação).
- **Nem todo giro ganha**: chance por giro definida pelo RH (`campaigns.wheel_win_pct`, padrão 30%), sorteada com `crypto.randomInt`. Depois, sorteio server-side (Edge Function `spin-wheel`), ponderado por `weight` e restrito a brindes com `stock_available > 0`. Brinde esgotado sai da roleta.
- A roleta no cliente mostra apenas casas genéricas ("Brinde 1"..."Brinde 8" ou ícones); o resultado real vem do servidor e o cliente só anima até a casa correspondente.
- Participante vê: "Você ganhou um brinde! Retire no RH apresentando este código: `XXXX-XXXX`". **Nunca o nome do brinde.**
- Gera registro em `prize_awards` (status `pending`), decrementa estoque, dispara webhook n8n → e-mail ao RH com nome, setor, brinde, código.
- RH marca como `delivered` no painel (ou escaneia o código).
- 1 giro por participante por dia de roleta.

### 4.5 Identificação e cadastro
- Admin importa CSV: `nome, cpf, data_nascimento, setor, email (opcional), lider (S/N)`.
- 1º acesso: digita CPF → sistema confere se existe na `participants` da campanha ativa → pede data de nascimento → se bater, mostra nome, cria avatar, define **PIN de 4–6 dígitos**.
- Acessos seguintes: CPF + PIN.
- Esqueci o PIN: admin reseta no painel (gera flag `pin_reset_required`).
- CPF armazenado normalizado (só dígitos) e com índice único por company. Exibido mascarado (`***.456.789-**`) fora do admin.
- LGPD: tela de consentimento no 1º acesso (texto configurável pela company), log em `consents`.

### 4.6 Badges (selos)

| Código | Nome | Regra |
|---|---|---|
| `first_day` | Primeiro passo | Concluiu dia 1 |
| `streak_3` | Três seguidos | 3 dias consecutivos no dia certo (não makeup) |
| `streak_5` | Semana perfeita | 5 dias no dia certo |
| `perfect_day` | Gabaritou | 5/5 na 1ª tentativa em um dia |
| `perfect_week` | Nota máxima | 25/25 na 1ª tentativa |
| `speedster` | Relâmpago | Bônus de velocidade ≥ 80 em um dia |
| `early_bird` | Madrugador | Concluiu antes das 09:00 em qualquer dia |
| `social` | Influência | Post aprovado no mural |
| `top_post` | Destaque | Post mais votado do dia |
| `family` | Em família | Concluiu um game da família |
| `family_week` | Família completa | 5 games da família |
| `present` | Presente | Check-in presencial |
| `podium` | Pódio | Top 3 final |
| `team_winner` | Time campeão | Setor vencedor |

Badges calculados por trigger/Edge Function ao final de cada ação relevante; exibidos no perfil e no ranking (ícones pequenos).

### 4.7 Mural social
- Desafio da semana configurado pelo admin (ex.: "Foto da sua equipe com o tema do ano").
- Post = imagem (Storage, máx 5 MB, redimensionada) + legenda (≤ 280 chars).
- Post entra em `status = pending`; **RH aprova ou rejeita** no painel. Só aprovados aparecem.
- Votação: 1 voto por participante por post (toggle). Encerra quinta 23:59.
- Pontuação conforme 4.2. "Mais votado do dia" calculado por job às 00:00 do dia seguinte (desempate: aprovado primeiro).

### 4.8 Games da família
- 1 por dia, tema do dia, liberados junto com o conteúdo:
  - **Caça-palavras** (grade 10×10, 6–8 palavras configuráveis).
  - **Quiz leve** (5 perguntas de múltipla escolha, sem cronômetro).
- Não pontuam no ranking. Concluir qualquer um conta para badge `family` / `family_week`.
- Acessível sem login via link compartilhável? **Não** — fica dentro da conta do participante (ele joga com a família no celular dele). Simplifica.

### 4.9 Check-in presencial
- Admin cria `events` (nome, dia, janela de horário, pontos default 100).
- Gera QR code com token assinado (`event_id` + `hmac`), exibido/impresso no local.
- Participante escaneia (câmera via `html5-qrcode`) ou digita código de 6 chars → valida janela de horário → registra `checkins` → +100.
- 1 check-in por participante por evento.

### 4.10 Papel da liderança
- Líder vê aba "Meu time": lista do setor com status do dia (feito / pendente / makeup), adesão % do setor, posição no ranking por setor.
- Pode disparar "lembrete" (webhook n8n → e-mail para os pendentes do setor, máx. 1/dia).
- Abertura da campanha: admin pode subir vídeo/mensagem da liderança exibida na segunda antes do conteúdo (`campaign.opening_message`, `campaign.opening_video_url`).

### 4.11 Certificado
- Liberado após `status = closed` para quem concluiu **≥ 3 dias** (configurável `min_days_for_certificate`).
- PDF A4 paisagem com logo da company, nome do participante, tema da campanha, datas, carga horária estimada (soma dos vídeos + 10 min/dia), código de verificação. Rota pública `/verify/{{code}}`.

### 4.12 Materiais de apoio
- Por dia: lista de `materials` (PDF em Storage ou link externo) com título. Exibidos abaixo do vídeo.

### 4.13 Kit de divulgação
- Página admin "Divulgação" gera: link da campanha, QR code (PNG/SVG), e 3 peças em HTML prontas para print (cartaz A4, banner e-mail, post quadrado) com logo, cores, tema e data. Botão "Baixar PNG" (html-to-image).

---

## 5. Dinâmicas (tipos)

Todas têm exatamente **5 itens** e usam o mesmo motor de pontuação (item correto / refazer / bônus de tempo). Estrutura comum em `activities` com `type` e `config` (JSONB).

| `type` | Nome | Interação | `config` |
|---|---|---|---|
| `true_false` | Fato ou Fake | 5 afirmações, botões Fato/Fake | `items: [{statement, answer: bool, explanation}]` |
| `timed_quiz` | Acerte em Tempo | 5 perguntas múltipla escolha, cronômetro **15s** (estourou = erro) | `items: [{question, options[4], correct_index, explanation}], time_limit_s: 15` |
| `find_errors` | Encontre os Erros | Imagem com 5 hotspots; usuário toca nas áreas; clique fora de hotspot = erro | `image_url, hotspots: [{id, x, y, w, h (% da imagem), label, explanation}], max_wrong_clicks: 5` |
| `match_pairs` | Ligue os Pares | 5 pares embaralhados em duas colunas; liga arrastando ou tocando A→B | `pairs: [{left, right, explanation}]` |
| `new_habits` | Novos Hábitos | 5 situações, 3 atitudes cada, escolher a correta | `items: [{situation, options[3], correct_index, explanation}]` |

**Editor no admin**: formulário por tipo. Para `find_errors`, upload da imagem e marcação dos hotspots arrastando retângulos sobre a imagem (canvas simples), salvando em percentual para responsividade.

**Cronômetro de bônus** (20s) existe em todos os tipos; em `timed_quiz` o limite de 15s é de corte, o bônus segue a fórmula padrão.

---

## 6. Grade padrão da semana (seed da 1ª campanha)

| Dia | Tema | Vídeo | Dinâmica | Extras |
|---|---|---|---|---|
| **Seg** | Tema do ano — abertura | V1 ≤ 2 min | Fato ou Fake | Avatar no 1º acesso, mural abre, game família 1, mensagem da liderança |
| **Ter** | Complementar 1 | V2 ≤ 2 min | Acerte em Tempo | Check-in presencial (se houver evento), game família 2 |
| **Qua** | Tema do ano — aprofundamento | V3 ≤ 2 min | Encontre os Erros | **Roleta 1**, badges `streak_3`, game família 3 |
| **Qui** | Complementar 2 | V4 ≤ 2 min | Ligue os Pares | Votação do mural encerra 23:59, lembrete de recuperação, game família 4 |
| **Sex** | Tema do ano — encerramento | V5 ≤ 2 min | Novos Hábitos | **Roleta 2**, recuperação até 18h, pódio individual e setor, certificado, badges finais, game família 5 |

Admin pode trocar a dinâmica de qualquer dia e ligar/desligar a roleta por dia.

---

## 7. Modelo de dados (Supabase / Postgres)

```sql
-- Multiempresa
companies (
  id uuid pk, slug text unique, name text,
  logo_url text, primary_color text, secondary_color text, accent_color text,
  timezone text default 'America/Sao_Paulo',
  consent_text text, created_at
)

campaigns (
  id uuid pk, company_id fk, name text, theme text,
  start_date date, end_date date,
  release_time time default '08:00', makeup_deadline timestamptz,
  makeup_factor numeric default 0.5,
  min_days_for_certificate int default 3,
  opening_message text, opening_video_url text,
  wall_challenge text,
  status text check (status in ('draft','scheduled','active','closed')),
  created_at
)

campaign_days (
  id uuid pk, campaign_id fk, day_index int (1..5), date date,
  title text, theme text, youtube_video_id text, video_duration_s int,
  has_wheel bool default false,
  unique (campaign_id, day_index)
)

activities (
  id uuid pk, campaign_day_id fk,
  type text check (type in ('true_false','timed_quiz','find_errors','match_pairs','new_habits')),
  config jsonb, -- ver seção 5
  points_per_item int default 100, retry_points int default 50,
  bonus_max int default 20, bonus_window_s int default 20
)

family_games (
  id uuid pk, campaign_day_id fk,
  type text check (type in ('word_search','light_quiz')),
  config jsonb
)

materials (id uuid pk, campaign_day_id fk, title text, url text, kind text ('pdf'|'link'), sort int)

-- Pessoas
participants (
  id uuid pk, company_id fk, campaign_id fk, auth_user_id uuid null,
  name text, cpf text, birth_date date, email text null, sector text,
  role text check (role in ('participant','leader','admin','superadmin')) default 'participant',
  avatar_config jsonb, avatar_url text,
  pin_set bool default false, pin_reset_required bool default false,
  consent_at timestamptz null, first_login_at timestamptz null,
  unique (company_id, cpf)
)

consents (id, participant_id fk, text_version text, accepted_at)

-- Progresso
video_views (
  id, participant_id fk, campaign_day_id fk,
  watched_pct numeric, completed_at timestamptz, is_makeup bool,
  unique (participant_id, campaign_day_id)
)

attempts (
  id, participant_id fk, activity_id fk, item_index int,
  attempt_no int, is_correct bool, response_time_ms int,
  points_awarded int, bonus_awarded int, is_makeup bool, created_at
)

day_completions (
  id, participant_id fk, campaign_day_id fk, completed_at, is_makeup bool,
  total_points int, total_time_ms int, correct_first_try int,
  unique (participant_id, campaign_day_id)
)

participant_scores (  -- materializado por trigger, fonte do ranking realtime
  participant_id pk fk, campaign_id fk,
  total_points int default 0, total_time_ms bigint default 0,
  days_completed int default 0, updated_at
)

badges (code text pk, name text, description text, icon text)
participant_badges (participant_id fk, badge_code fk, awarded_at, pk (participant_id, badge_code))

-- Roleta e brindes
prizes (
  id, campaign_id fk, internal_name text, stock_total int, stock_available int,
  weight int default 1, active bool default true
)

wheel_spins (id, participant_id fk, campaign_day_id fk, prize_id fk, created_at, unique (participant_id, campaign_day_id))

prize_awards (
  id, participant_id fk, prize_id fk, wheel_spin_id fk,
  code text unique, status text check (status in ('pending','delivered','cancelled')),
  delivered_at timestamptz null, delivered_by uuid null, created_at
)

-- Mural
wall_posts (
  id, campaign_id fk, participant_id fk, image_url text, caption text,
  status text check (status in ('pending','approved','rejected')),
  reviewed_by uuid null, reviewed_at, day_index int, created_at
)
wall_votes (post_id fk, participant_id fk, created_at, pk (post_id, participant_id))
wall_daily_winners (campaign_id fk, day_index int, post_id fk, pk (campaign_id, day_index))

-- Presencial
events (id, campaign_id fk, campaign_day_id fk, name text, starts_at, ends_at, points int default 100, secret text)
checkins (id, event_id fk, participant_id fk, created_at, unique (event_id, participant_id))

-- Família
family_game_completions (participant_id fk, family_game_id fk, completed_at, pk)

-- Certificados
certificates (id, participant_id fk, campaign_id fk, code text unique, hours numeric, issued_at, pdf_url text)

-- Notificações
notification_log (id, company_id fk, type text, payload jsonb, status text, created_at)
```

**Views**
- `v_ranking_individual(campaign_id)`: `participant_scores` join `participants` + badges agregados, ordenado por `total_points desc, total_time_ms asc`.
- `v_ranking_sector(campaign_id)`: avg(total_points) por `sector` sobre todos os participants da campanha, adesão %.
- `v_ranking_daily(campaign_id, day_index)`: soma de pontos de `attempts` + `video_views` do dia.
- `v_attendance(campaign_id)`: matriz participante × dia (feito / makeup / não).

**RLS (resumo)**
- Participante: lê a própria linha e dados públicos da campanha ativa (days liberados, rankings, posts aprovados); escreve apenas `attempts`, `video_views`, `wall_posts`, `wall_votes`, `checkins`, `family_game_completions` próprios.
- Liberação de dia e pontuação são validadas em **Edge Functions / RPCs `security definer`** (nunca confiar no cliente para pontos ou tempo).
- Admin: tudo dentro da própria `company_id`.
- Superadmin: tudo.

**Triggers**
- `after insert on attempts / video_views / checkins / wall_*` → recalcula `participant_scores` e avalia badges.
- `after insert on day_completions` → avalia `streak_*`, `perfect_day`, `early_bird`.

---

## 8. Edge Functions / RPCs

| Nome | Responsabilidade |
|---|---|
| `auth-cpf` | 1º acesso (CPF + nascimento → cria auth user, retorna sessão temporária para definir PIN) e login (CPF + PIN) |
| `set-pin` | Define/altera PIN |
| `get-today` | Retorna estado da campanha para o participante: dias, qual liberado, progresso, prazos, se roleta disponível |
| `complete-video` | Valida `watched_pct ≥ 0.9` e horário; grava `video_views` e pontos |
| `submit-item` | Recebe `activity_id, item_index, answer, client_elapsed_ms`; valida no servidor (tempo medido entre `start-item` e `submit-item`), calcula pontos, grava `attempts`, retorna correção + explicação |
| `start-item` | Marca `server_started_at` do item para medir tempo |
| `complete-day` | Fecha o dia, grava `day_completions`, dispara badges |
| `spin-wheel` | Sorteio ponderado, decrementa estoque, cria `prize_awards`, chama n8n |
| `deliver-prize` | Admin marca entrega |
| `checkin` | Valida token/janela e grava |
| `wall-moderate` | Aprova/rejeita post |
| `close-campaign` | Job sexta 18h: status closed, calcula pódio, `team_winner`, `podium`, emite certificados |
| `daily-release` | Job 08h: marca dia como liberado, envia lembrete n8n |
| `daily-wall-winner` | Job 00h: elege mais votado do dia anterior |
| `generate-certificate` | PDF sob demanda |
| `export-report` | CSV/PDF do relatório final |

**Anti-fraude básico**: tempo medido no servidor; 1 tentativa correta pontua por item; rate limit em `submit-item`; `is_makeup` decidido no servidor pela data.

---

## 9. Telas

### 9.1 Participante (`/app`)
1. **Login** — CPF (máscara) → PIN ou fluxo de 1º acesso (nascimento → consentimento → avatar → PIN).
2. **Criar avatar** — seletor DiceBear por categorias (pele, cabelo, olhos, acessórios, roupa, fundo com cores da empresa). Preview grande. Pode editar depois no perfil.
3. **Home** — logo da empresa, tema do ano, saudação com avatar, 5 cards dos dias (bloqueado / disponível / feito / recuperar), posição atual no ranking, badges recentes, atalhos: Ranking, Mural, Família, Meu time (se líder).
4. **Dia** — player YouTube (16:9, sem sugestões `rel=0`, `modestbranding`), barra de progresso do vídeo, materiais de apoio, botão "Ir para a dinâmica" (habilita após ≥90%).
5. **Dinâmica** — tela por tipo (seção 5), cronômetro visível, feedback por item com explicação, botão "Tentar de novo" em erro, placar do dia.
6. **Resultado do dia** — pontos do dia detalhados (vídeo, itens, bônus), badges ganhos, posição no ranking; CTA para roleta se houver.
7. **Roleta** — animação da roda com casas genéricas, botão girar, resultado "Você ganhou um brinde!" + código + instrução de retirada.
8. **Ranking** — tabs: Geral / Hoje / Por setor. Lista completa com avatar, nome, setor, pontos, badges; usuário destacado e fixado no topo; atualização ao vivo.
9. **Mural** — feed de posts aprovados com voto; botão postar (câmera/galeria + legenda); meus posts com status.
10. **Família** — game do dia (caça-palavras / quiz leve) + histórico.
11. **Check-in** — câmera para QR ou campo de código.
12. **Meu time** (líder) — lista do setor com status do dia, adesão, botão lembrete.
13. **Perfil** — avatar, badges, histórico de pontos por dia, meus brindes (código + status), certificado (após encerramento), alterar PIN.
14. **Pódio** (sexta após 18h) — top 3 individual com confete, setor campeão, estatísticas da campanha, link para certificado.
15. **Verificação pública** `/verify/{{code}}` — valida certificado.

### 9.2 Admin (`/admin`)
1. **Dashboard** — adesão geral e por setor (hoje / acumulado), funil do dia (acessou → vídeo → dinâmica → roleta), acertos por item (identifica pergunta mal formulada), brindes pendentes, posts pendentes. Realtime.
2. **Campanha** — datas, tema, horário de liberação, prazo de recuperação, mensagem/vídeo da liderança, desafio do mural, mínimo de dias para certificado, status (rascunho → agendada → ativa → encerrada).
3. **Dias** — 5 abas: título, tema, link YouTube (extrai ID e duração via oEmbed/Data API), roleta on/off, dinâmica (seletor de tipo + editor), game da família, materiais.
4. **Editor de dinâmica** — formulário por tipo; `find_errors` com canvas de marcação de hotspots; preview "jogar como participante".
5. **Participantes** — importar CSV (preview + validação de CPF e duplicidade), lista com filtros, editar setor/papel, resetar PIN, excluir.
6. **Brindes** — CRUD (nome interno, estoque, peso), estoque disponível.
7. **Entregas** — brindes ganhos: participante, setor, brinde, código, status; buscar por código; marcar entregue.
8. **Mural — Moderação** — fila de pendentes com aprovar/rejeitar, posts aprovados, vencedores do dia.
9. **Eventos presenciais** — CRUD, gerar/imprimir QR, lista de check-ins.
10. **Presença** — matriz participante × dia; exportar CSV/PDF (registro SIPAT).
11. **Relatórios** — relatório final: adesão, aprendizado (acerto 1ª tentativa por item/dia), ranking final, setores, brindes entregues, certificados emitidos; exportar PDF e CSV.
12. **Divulgação** — link, QR, peças (cartaz A4, banner, post) com download PNG.
13. **Identidade** — logo, cores, texto de consentimento, timezone.

### 9.3 Super admin (`/super`)
- Lista de companies, criar company, criar admin inicial, ver campanhas.

---

## 10. Integrações n8n (webhooks)

Payload padrão: `{ event, company_id, campaign_id, data, occurred_at }`. URL em `NOTIFICATIONS_WEBHOOK_URL` por company (override) ou env global.

| `event` | Quando | Ação sugerida no n8n |
|---|---|---|
| `prize.awarded` | Giro da roleta | E-mail ao RH: nome, setor, brinde, código |
| `day.released` | 08h | E-mail/WhatsApp lembrete geral (opcional) |
| `reminder.pending` | 14h, para quem não fez | E-mail individual (se tiver e-mail) |
| `leader.nudge` | Líder clica lembrete | E-mail aos pendentes do setor |
| `wall.post_pending` | Novo post | Avisar RH para moderar |
| `campaign.closed` | Sexta 18h | E-mail ao RH com pódio e link do relatório |
| `daily.summary` | 20h | Resumo do dia para RH |

---

## 11. Estrutura do repositório (sugerida)

```
/apps/web                 # Next.js
  /app
    /(auth)/login
    /(app)/home, day/[i], activity/[id], wheel, ranking, wall, family, checkin, team, profile, podium
    /admin/...
    /super/...
    /verify/[code]
    /api/...               # route handlers (pdf, export, youtube-meta)
  /components
    /activities/TrueFalse, TimedQuiz, FindErrors, MatchPairs, NewHabits
    /wheel, /avatar, /ranking, /player
  /lib/supabase, /lib/scoring, /lib/theme
/supabase
  /migrations
  /functions/auth-cpf, submit-item, spin-wheel, close-campaign, ...
  /seed/campaign-default.sql   # grade da seção 6
/docs/PLATAFORMA_SIPAT.md
```

---

## 12. Variáveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NOTIFICATIONS_WEBHOOK_URL=
YOUTUBE_API_KEY=            # opcional, para duração do vídeo
CHECKIN_HMAC_SECRET=
APP_BASE_URL=
```

---

## 13. Plano de implementação (ordem para o Code)

1. **Fundação**: repo Next.js + Supabase, schema completo (seção 7), RLS, seed da grade padrão, tema por company.
2. **Auth CPF/PIN** + importação CSV + avatar.
3. **Home + Dia + Player** com liberação por horário e makeup.
4. **Motor de dinâmicas** (`start-item`/`submit-item`) + os 5 tipos de UI + editor admin (inclusive hotspots).
5. **Pontuação, `participant_scores`, badges, ranking realtime** (geral/dia/setor).
6. **Roleta + brindes + entregas + webhook n8n.**
7. **Mural** (post, moderação, voto, vencedor do dia).
8. **Check-in QR + eventos.**
9. **Games da família.**
10. **Líder — Meu time + lembrete.**
11. **Jobs**: liberação 08h, lembretes, fechamento sexta 18h, vencedor do mural.
12. **Pódio, certificados, verificação pública.**
13. **Admin: dashboard realtime, presença, relatório final, divulgação, identidade.**
14. **Super admin.**
15. **QA**: simular a semana com `start_date` no passado e clock fake; testes dos cálculos de pontos; carga com 120 usuários simultâneos no ranking.

---

## 14. Cronograma até 30/11

| Período | Entrega |
|---|---|
| 08–12/11 | Itens 1–4 |
| 13–17/11 | Itens 5–8 |
| 18–22/11 | Itens 9–13 |
| 23–26/11 | Item 14, QA, ajustes de UX mobile, textos |
| 27–29/11 | Configuração real da campanha (vídeos, perguntas, brindes, CSV, cores) + ensaio com 5 pessoas do RH |
| 30/11 | Plataforma completa e campanha agendada; kit de divulgação entregue (cartazes já no final de novembro) |

---

## 15. Marca e domínio (SipatGo)

- Registrar `sipatgo.com.br` (Registro.br) e `sipatgo.com`; apontar ambos para a Vercel, `.com` → 301 para `.com.br`.
- URL por cliente: `{{company_slug}}.sipatgo.com.br` (subdomínio wildcard na Vercel) ou `sipatgo.com.br/{{company_slug}}` — decidir no passo 1; subdomínio é mais limpo no cartaz.
- Reservar @sipatgo no Instagram e LinkedIn; consulta de marca no INPI antes de divulgar externamente.
- Identidade da marca SipatGo aparece só na landing pública e no rodapé ("Feito com SipatGo"); dentro da campanha prevalecem logo e cores da empresa cliente.
- Landing `sipatgo.com.br`: o que é, como funciona (5 dias), dinâmicas, roleta, ranking, relatórios NR-5, formulário de contato. Base para SEO em "sipat online", "sipat gamificada", "plataforma sipat".

## 16. Pendências a confirmar com a empresa

- Semana exata da campanha (datas).
- Tema do ano e os 2 temas complementares.
- Os 5 vídeos (links YouTube) — autorais ou terceiros; confirmar com SESMT/jurídico se a SIPAT exige algo específico (NR-5).
- Lista dos 120 funcionários com CPF, nascimento, setor e quem é líder.
- Brindes: nomes internos e quantidades.
- Logo (SVG/PNG fundo transparente) e paleta de cores.
- Haverá ação presencial na semana? (para check-in).
- E-mail do RH para notificações; se desejam WhatsApp.
- Texto de consentimento LGPD aprovado pelo jurídico.
