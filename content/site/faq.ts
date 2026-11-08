export type FaqItem = { q: string; a: string };

/** FAQ da home (seção 3.12). */
export const HOME_FAQ: FaqItem[] = [
  {
    q: "Precisa instalar algum app?",
    a: "Não. A SipatGo roda no navegador do celular ou do computador. O participante abre o link (ou lê o QR do cartaz), entra com CPF e um PIN e já começa a jogar.",
  },
  {
    q: "Funciona sem e-mail corporativo?",
    a: "Sim. O acesso é por CPF e data de nascimento no primeiro login, depois CPF e PIN. Perfeito para chão de fábrica, campo e equipes que não têm e-mail da empresa.",
  },
  {
    q: "Como fica a comprovação da SIPAT?",
    a: "A NR-5 coloca a SIPAT entre as atribuições da CIPA, com programação definida pela própria comissão (item 5.3.1 “i”). A plataforma registra quem participou de cada dia, o check-in nas ações presenciais e o aprendizado pergunta a pergunta, e gera a lista de presença e o relatório final em PDF e CSV. Esses arquivos se somam às atas da CIPA, que continuam sendo da comissão, e devem ficar guardados no estabelecimento por no mínimo 5 anos (item 5.9.2).",
  },
  {
    q: "Posso usar meus próprios vídeos?",
    a: "Pode. Você cola o link de cada vídeo do dia e a plataforma cuida do resto: libera a dinâmica só depois que a pessoa assiste até o fim.",
  },
  {
    q: "E vídeos do YouTube?",
    a: "Sim, os vídeos são do YouTube (públicos ou não listados). Use vídeos da sua empresa, de parceiros ou do nosso banco de conteúdo pronto, oferecido como adicional.",
  },
  {
    q: "Quanto tempo para colocar no ar?",
    a: "Com o conteúdo em mãos, você configura em uma tarde: importa a lista de participantes por CSV, escolhe o tema, cola os vídeos, escreve as perguntas e cadastra os brindes. Recomendamos começar duas semanas antes para divulgar com calma.",
  },
  {
    q: "Como funciona a roleta?",
    a: "Nos dias de roleta (quarta e sexta, por padrão), quem conclui a dinâmica gira e sempre ganha. O sorteio é feito no servidor, respeitando o estoque. A pessoa recebe um código para retirar o brinde no RH, e o RH é avisado na hora.",
  },
  {
    q: "É seguro (LGPD)?",
    a: "Sim. Coletamos só o necessário para a campanha, o CPF aparece mascarado fora do painel do RH, há tela de consentimento no primeiro acesso e cada empresa enxerga apenas os próprios dados.",
  },
  {
    q: "Atende várias unidades?",
    a: "Atende. Você organiza participantes por setor e unidade, acompanha a adesão de cada uma e o ranking por setor mostra quem está puxando a campanha.",
  },
  {
    q: "O que acontece se alguém perder um dia?",
    a: "Os dias anteriores ficam disponíveis para recuperação até sexta, às 18h, valendo metade dos pontos e sem bônus de velocidade. Ninguém fica de fora por causa de uma folga ou de um turno diferente.",
  },
];

/** FAQ do hub /sipat. */
export const SIPAT_FAQ: FaqItem[] = [
  {
    q: "O que significa SIPAT?",
    a: "SIPAT é a sigla de Semana Interna de Prevenção de Acidentes do Trabalho, uma semana dedicada a ações de conscientização sobre segurança e saúde no trabalho, organizada pela CIPA em conjunto com a empresa.",
  },
  {
    q: "A SIPAT é obrigatória?",
    a: "Para empresas que precisam constituir CIPA, a NR-5 inclui entre as atribuições da comissão promover a SIPAT anualmente, em conjunto com o SESMT, onde houver. Confira sempre a redação vigente da NR-5 e a situação específica da sua empresa com o seu SESMT ou assessoria de SST.",
  },
  {
    q: "Quem organiza a SIPAT?",
    a: "A CIPA define a programação e conduz a semana, com apoio do SESMT (quando a empresa tem) e da organização, que fornece os meios. Na prática, o RH costuma cuidar da logística, da comunicação e dos fornecedores.",
  },
  {
    q: "A SIPAT pode ser só online?",
    a: "A NR-5 não define o formato das ações: ela determina que a CIPA promova a SIPAT anualmente, em conjunto com o SESMT onde houver, conforme a programação que a própria CIPA definir. Nossa recomendação é uma SIPAT híbrida: a plataforma digital como eixo da semana, somada a ações presenciais (abertura, palestras, simulados) com check-in por QR, e alternativa presencial para quem não tem celular. Assim ninguém fica de fora e a comprovação fica mais robusta.",
  },
  {
    q: "Quanto tempo dura a SIPAT?",
    a: "Como o nome diz, é uma semana. O formato mais comum é de segunda a sexta, com uma atividade por dia, mas a programação é definida pela CIPA de acordo com a realidade da empresa.",
  },
  {
    q: "Como comprovar a realização da SIPAT?",
    a: "Guarde a programação, as listas de presença por atividade, os materiais usados, registros fotográficos e as atas de reunião da CIPA em que a semana foi planejada e avaliada. Uma plataforma digital gera boa parte disso automaticamente.",
  },
];

/** FAQ de cobrança (/precos). */
export const PRICING_FAQ: FaqItem[] = [
  {
    q: "Como é cobrado?",
    a: "Por campanha, de acordo com a faixa de participantes cadastrados. Uma campanha é uma semana de SIPAT completa, com a preparação antes e o acesso aos relatórios depois.",
  },
  {
    q: "Conta quem não jogou?",
    a: "A faixa considera as pessoas cadastradas na campanha. Se a sua base varia muito, conversamos para encaixar no plano certo.",
  },
  {
    q: "Tem fidelidade ou mensalidade?",
    a: "Não há mensalidade. Você contrata a campanha. Se quiser fazer mais de uma por ano (SIPAT + Outubro Rosa, por exemplo), montamos um pacote.",
  },
  {
    q: "Quais as formas de pagamento?",
    a: "Boleto ou PIX, com nota fiscal. Para empresas que exigem cadastro de fornecedor, enviamos a documentação necessária.",
  },
  {
    q: "Os brindes estão inclusos?",
    a: "Não. Os brindes são da sua empresa; a plataforma cuida do sorteio, do estoque, do aviso ao RH e do controle de entrega.",
  },
  {
    q: "Posso testar antes?",
    a: "Pode jogar a demo agora mesmo, sem cadastro. Se quiser ver o painel do RH, agende uma conversa e mostramos tudo ao vivo.",
  },
];
