# SipatGo

**A SIPAT que todo mundo quer jogar.** Plataforma web (mobile-first) para rodar a SIPAT como um jogo de 5 dias: vídeo + dinâmica por dia, ranking ao vivo (individual e por setor), roleta de brindes, mural, games da família, check-in presencial por QR, certificado e relatórios para registro da NR-5.

- Especificação do produto: [`docs/PLATAFORMA_SIPAT.md`](docs/PLATAFORMA_SIPAT.md)
- Marca e site público: [`docs/SITE_SIPATGO.md`](docs/SITE_SIPATGO.md)

## Stack

Next.js 15 (App Router) + TypeScript · Tailwind CSS 4 · Postgres (Supabase) · Supabase Storage e Realtime (opcionais) · DiceBear · YouTube IFrame API · @react-pdf/renderer · qrcode / html5-qrcode · html-to-image · n8n (webhooks) · Vercel (+ Cron).

## Banco de dados e isolamento

Todo o SipatGo vive no schema Postgres **`sipatgo`**. O app fala com o banco **só pelo servidor** (`DATABASE_URL`, driver `postgres`), com nomes sempre qualificados (`sipatgo.tabela`). Assim o mesmo código funciona:

- **num projeto Supabase próprio** (recomendado para produção: isolamento total, região `sa-east-1`, LGPD mais simples), ou
- **dentro de um projeto existente (ex.: Mentorque)** sem encostar em nada dele:
  - RLS ligado em todas as tabelas **sem políticas** + `revoke` de `anon`/`authenticated` no schema → nada do SipatGo é acessível pela API pública do Supabase;
  - o login **não usa Supabase Auth** (CPF + PIN com sessão própria em cookie assinado) → nenhum usuário do SipatGo aparece no `auth.users` do outro produto;
  - buckets de Storage prefixados (`sipatgo-public`, `sipatgo-private`);
  - Realtime só via canais *broadcast* `sipatgo-*`, levando apenas um "ping" (sem dados pessoais).

Mudar de um cenário para o outro é trocar variáveis de ambiente e rodar as migrations no banco novo.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha DATABASE_URL e SESSION_SECRET
npm run db:migrate           # aplica supabase/migrations no schema sipatgo
npm run db:seed              # empresa demo "Indústria Horizonte" com 120 pessoas
npm run dev
```

- Demo: `http://localhost:3000/c/industria-horizonte`. O admin de exemplo é CPF `529.982.247-25` com nascimento `1985-05-20`: o 1º acesso cria o PIN, e admins usam PIN de 6 dígitos.
- Superadmin: `node scripts/create-superadmin.mjs "Nome" CPF AAAA-MM-DD`, depois entre em `/c/sipatgo`.
- Simular a semana: `FAKE_NOW=2026-11-11T12:30:00Z` congela o relógio da aplicação (em produção só com `ALLOW_FAKE_NOW=1`).

## Testes

```bash
npm test                                   # unitários: pontuação, calendário, dinâmicas, roleta, selos, CPF, caça-palavras
TEST_DATABASE_URL=postgres://... npm run test:integration   # semana simulada contra Postgres real (APAGA o schema sipatgo!)
npm run typecheck && npm run build
```

O teste de integração cobre:
- liberação às 08h e bloqueio de dias futuros;
- anti-pulo do vídeo;
- bônus de velocidade, refazer (50) e recuperação (50%, sem bônus);
- roleta: estoque, código e giro único;
- mural: 30 pontos uma vez por dia e vencedor do dia;
- check-in na janela de horário;
- ranking por setor;
- encerramento: pódio, time campeão e certificados.

## Estrutura

```
app/
  (site)/            site público sipatgo.com.br (landing, /sipat, blog, preços, demo...)
  c/[slug]/          login da campanha (CPF → nascimento → LGPD → avatar → PIN)
  app/               área do participante (home, dia, dinâmica, roleta, ranking, mural, família, check-in, time, perfil, pódio)
  admin/             painel do RH (dashboard, campanha, dias/dinâmicas, participantes, brindes, entregas, mural, eventos, presença, relatórios, divulgação, identidade)
  super/             superadmin (empresas e admins)
  verify/[code]/     verificação pública de certificado
  api/               jogo, auth, ranking, mural, check-in, cron, exportações e PDFs
components/          UI, dinâmicas, roleta, ranking, avatar, admin, site
lib/                 regras de negócio (calendar, scoring, activities, game, badges, prizes, wall, close, jobs, reports...)
supabase/migrations/ schema completo
scripts/             migrate, seed demo, create-superadmin
tests/               unitários + integração
```

## Jobs agendados

Há um único endpoint idempotente, `GET /api/cron/tick` (com `Authorization: Bearer $CRON_SECRET`). `vercel.json` o chama de hora em hora. Cada empresa é avaliada no próprio fuso:

| Horário | O que faz |
|---|---|
| 08h | `day.released` (liberação do dia) |
| 14h | `reminder.pending` |
| 20h | `daily.summary` |
| 00h | elege o post mais votado do mural |
| Sexta 18h | encerramento da campanha |

Cada disparo tem `dedupe_key`, então rodar várias vezes não duplica nada. Sem a Vercel, o mesmo endpoint pode ser chamado por `pg_cron`/`pg_net` ou pelo n8n. O encerramento também acontece de forma "preguiçosa" quando alguém acessa o app depois do prazo.

> Vercel Hobby só permite crons diários. Para a frequência horária use o plano Pro ou um agendador externo (n8n/pg_cron).

## Webhooks (n8n)

O payload é `{ event, company_id, campaign_id, data, occurred_at }` e vai para a URL da empresa (painel → Identidade) ou para `NOTIFICATIONS_WEBHOOK_URL`.

Eventos: `prize.awarded`, `day.released`, `reminder.pending`, `leader.nudge`, `wall.post_pending`, `campaign.closed`, `daily.summary`. Os eventos de lembrete trazem `data.recipients` (nome + e-mail) para o n8n iterar.

Tudo fica registrado em `sipatgo.notification_log`, e as últimas notificações aparecem em `/super`. Os leads do site vão para `LEADS_WEBHOOK_URL`.

## Diferenças em relação à especificação (decisões técnicas)

| Spec | Implementado | Por quê |
|---|---|---|
| Supabase Auth com e-mail sintético `{cpf}@{slug}.local` | Sessão própria (JWT HS256 em cookie httpOnly, PIN com bcrypt, bloqueio após 5 erros) | Isolamento total ao dividir projeto com outro produto; menos peças |
| Edge Functions (Deno) | Route handlers / server actions do Next + transações SQL | Uma base de código só, testável localmente; mesma garantia de "nunca confiar no cliente" |
| Realtime via Postgres Changes | Broadcast "ping" + polling de 20s | Não expõe tabelas ao Realtime; funciona mesmo sem Supabase configurado |
| Avatar: SVG salvo no Storage | Só o JSON de opções; SVG gerado na hora | Determinístico, zero armazenamento |
| `start-item` separado do relógio | Relógio por participante/dinâmica no servidor (`activity_clocks`); reinicia a cada item | Tempo e bônus medidos 100% no servidor |
| Encontre os Erros: clique fora = erro | Clique conferido no servidor (os hotspots nunca vão ao cliente); após N erros aparece uma área de dica | Anti-fraude + não travar ninguém |
| URL por cliente | Ambos: `{slug}.sipatgo.com.br` (middleware) e `sipatgo.com.br/c/{slug}` | Subdomínio no cartaz; caminho como fallback |

## Variáveis de ambiente

Veja [`.env.example`](.env.example). Mínimo para rodar: `DATABASE_URL` e `SESSION_SECRET`. Para uploads (mural, logo, imagens, PDFs) e ranking ao vivo instantâneo, configure também as chaves do Supabase.

## Deploy (Vercel)

1. Importe o repositório na Vercel e configure as variáveis.
2. Rode `npm run db:migrate` apontando para o banco de produção.
3. Domínios: `sipatgo.com.br` e o wildcard `*.sipatgo.com.br` no projeto; `sipatgo.com` com 301 para `.com.br`. Defina `ROOT_DOMAIN=sipatgo.com.br` e `APP_BASE_URL=https://sipatgo.com.br`.
4. Crie o superadmin e, em `/super`, a empresa e o admin do RH.
