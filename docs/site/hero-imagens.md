# Imagens do hero da home (SipatGo)

O hero da home troca a palavra em destaque ("A **SIPAT** que todo mundo quer jogar.")
a cada 3,6 s. A foto ao lado troca junto. Cada slide usa **duas imagens**:

| Arquivo | O que é | Formato |
|---|---|---|
| `{slug}-cena.jpg` | Fundo do ambiente de trabalho. O site já aplica o preto e branco. | JPG, 1600×1280 (5:4), até 350 KB |
| `{slug}-pessoa.png` | A pessoa recortada, com **fundo transparente**. Aparece colorida e com a cabeça saindo da moldura. | PNG transparente, 1200×1500 (4:5), até 600 KB |

Salve em `public/site/hero/`. O site detecta sozinho: **sem as imagens, mostra o
fundo ilustrado atual**. Então dá para subir um slide de cada vez.

## Slides

| Slug | Palavra | Segmento | Pessoa |
|---|---|---|---|
| `industria` | SIPAT | Indústria | Mulher, operadora de fábrica |
| `rural` | SIPATR | Rural e agro | Homem, trabalhador rural |
| `mineracao` | SIPATMIN | Mineração | Homem, técnico de mineração |
| `transporte` | Maio Amarelo | Transporte e frotas | Mulher, motorista de ônibus/caminhão |
| `escritorio` | Semana da Saúde | Escritório e serviços | Homem ou mulher 50+, administrativo |

Para mudar palavras, segmentos ou a ordem, edite `content/site/hero.ts`.

## Regras para todas as imagens (para parecerem da mesma campanha)

- Fotografia realista, editorial, luz natural suave. Nada de cara de banco de imagens.
- Pessoas brasileiras reais e diversas em idade, gênero e etnia. Expressão confiante ou sorriso leve.
- A pessoa **segura um celular ou tablet**, olhando para a tela ou para a câmera. É a "pessoa jogando a SIPAT".
- EPI **correto e completo** para o ambiente. Isso é um site de segurança do trabalho: nada de EPI faltando ou mal usado.
- **Sem logos ou marcas reais** nos uniformes, crachás, veículos e equipamentos. Uniformes lisos ou com faixa refletiva.
- Sem texto legível na cena (placas, cartazes).
- Enquadramento da pessoa: da cintura ou do meio da coxa para cima, centralizada, com espaço livre acima da cabeça.
- Cena: profundidade de campo, fundo levemente desfocado e sem pessoas em destaque.

## Prompts (ChatGPT / gpt-image)

Gere **primeiro a pessoa** e depois a cena, no mesmo chat, para manter luz e ângulo coerentes.
Para a pessoa, peça explicitamente o **fundo transparente** (PNG). Se vier com fundo,
remova com a ferramenta de recorte do próprio ChatGPT, do Canva ou do remove.bg.

### 1. `industria` (SIPAT)

**Pessoa:**
> Fotografia realista de uma operadora de fábrica brasileira, mulher negra de cerca de 35 anos, sorriso confiante, de pé, segurando um tablet robusto com as duas mãos e olhando para a câmera. Usa óculos de proteção na testa, colete laranja refletivo sobre camisa azul de manga longa, protetor auricular tipo plug pendurado no pescoço e luvas na cintura. Sem logos ou textos no uniforme. Enquadramento da cintura para cima, centralizada, com espaço acima da cabeça. Luz suave de estúdio, estilo editorial. Fundo totalmente transparente, PNG, proporção 4:5.

**Cena:**
> Fotografia realista do interior de uma fábrica brasileira moderna, com máquinas, esteiras e estrutura metálica, faixas de piso amarelas demarcando a circulação. Profundidade de campo rasa e fundo desfocado. Sem pessoas em primeiro plano, sem logos e sem textos legíveis. Luz natural entrando por janelas altas. Proporção 5:4, horizontal.

### 2. `rural` (SIPATR)

**Pessoa:**
> Fotografia realista de um trabalhador rural brasileiro, homem branco de cerca de 45 anos com barba por fazer, camisa xadrez de manga longa, boné, segurando um tablet e olhando para a tela com expressão concentrada e tranquila. Usa luvas de proteção presas no bolso e chapéu/boné com proteção de nuca. Sem logos. Enquadramento do meio da coxa para cima, centralizado, espaço acima da cabeça. Luz de fim de tarde suave. Fundo totalmente transparente, PNG, proporção 4:5.

**Cena:**
> Fotografia realista de uma lavoura brasileira (café ou cana) ao entardecer, com um trator ao fundo desfocado e uma estrada de terra. Profundidade de campo rasa, sem pessoas em primeiro plano, sem marcas ou textos visíveis. Proporção 5:4, horizontal.

### 3. `mineracao` (SIPATMIN)

**Pessoa:**
> Fotografia realista de um técnico de mineração brasileiro, homem negro de cerca de 40 anos, capacete branco liso sem logo, óculos de segurança, protetor auricular tipo concha no capacete, camisa azul-marinho de manga longa com faixas refletivas, segurando um tablet robusto e olhando para a tela. Sem logos ou nomes de empresa. Enquadramento do meio da coxa para cima, centralizado, espaço acima do capacete. Luz natural difusa. Fundo totalmente transparente, PNG, proporção 4:5.

**Cena:**
> Fotografia realista de uma mina a céu aberto no Brasil, com bancadas escalonadas de terra avermelhada, um caminhão fora de estrada pequeno e desfocado ao fundo, céu claro. Profundidade de campo rasa, sem pessoas em primeiro plano, sem logos e sem textos. Proporção 5:4, horizontal.

### 4. `transporte` (Maio Amarelo)

**Pessoa:**
> Fotografia realista de uma motorista profissional brasileira, mulher parda de cerca de 30 anos, cabelo preso, camisa polo azul-marinho lisa e colete amarelo refletivo, sorriso leve, segurando um celular na horizontal como quem joga, olhando para a câmera. Sem logos. Enquadramento da cintura para cima, centralizada, espaço acima da cabeça. Luz natural suave. Fundo totalmente transparente, PNG, proporção 4:5.

**Cena:**
> Fotografia realista de uma garagem de ônibus e caminhões no Brasil, com veículos estacionados lado a lado, desfocados, faixas de piso amarelas e luz da manhã. Sem pessoas em primeiro plano, sem marcas, placas legíveis ou logos. Proporção 5:4, horizontal.

### 5. `escritorio` (Semana da Saúde)

**Pessoa:**
> Fotografia realista de um profissional administrativo brasileiro, homem de cerca de 55 anos, cabelos grisalhos, camisa social clara sem gravata, crachá sem texto, sorriso tranquilo, segurando um celular e olhando para a câmera. Enquadramento da cintura para cima, centralizado, espaço acima da cabeça. Luz suave de escritório. Fundo totalmente transparente, PNG, proporção 4:5.

**Cena:**
> Fotografia realista de um escritório brasileiro claro e moderno, com estações de trabalho, plantas e janelas amplas, desfocado. Sem pessoas em primeiro plano, sem logos e sem textos legíveis. Proporção 5:4, horizontal.

## Checklist antes de subir

- [ ] Nomes exatamente como na tabela (`industria-cena.jpg`, `industria-pessoa.png`…).
- [ ] O PNG da pessoa tem fundo transparente de verdade (não é branco nem xadrez "pintado").
- [ ] Cabeça perto do topo do PNG e corpo cortado na base. O site alinha a pessoa pela base da moldura.
- [ ] EPI correto para o ambiente e nenhuma marca real aparecendo.
- [ ] Tamanhos dentro do limite. Se passar, comprima em squoosh.app.

Depois de subir as imagens em `public/site/hero/`, faça o commit. O deploy da Vercel já publica.
Se preferir, mande as imagens aqui no chat que eu coloco no lugar e ajusto o enquadramento.
