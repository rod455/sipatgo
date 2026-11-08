import type { GuideSection } from "./blocks";
import { CNPJ, CONTACT_EMAIL, PRIVACY_EMAIL } from "./site";

export const LEGAL_UPDATED_AT = "2026-11-08";

export const LEGAL_REVIEW_NOTE =
  "Minuta em revisão. Este texto é um rascunho orientado pela LGPD e ainda deve ser revisado pela assessoria jurídica antes da publicação definitiva. Itens entre colchetes são placeholders.";

/** Política de privacidade (rascunho LGPD — revisar com o jurídico). */
export const PRIVACY_SECTIONS: GuideSection[] = [
  {
    id: "quem-somos",
    title: "1. Quem somos",
    blocks: [
      {
        type: "p",
        text: `A SipatGo ([razão social a definir], ${CNPJ}, com sede em [endereço a definir]) oferece uma plataforma digital para campanhas de prevenção, como a SIPAT. Esta política explica como tratamos dados pessoais no site sipatgo.com.br e na plataforma.`,
      },
      {
        type: "p",
        text: "Na plataforma de campanha, a **empresa cliente** (empregadora) é, em regra, a **controladora** dos dados dos seus colaboradores, e a SipatGo atua como **operadora**, tratando os dados conforme as instruções do cliente e o contrato. No site público (formulários de contato, demo, materiais), a SipatGo é a controladora.",
      },
    ],
  },
  {
    id: "dados",
    title: "2. Quais dados tratamos",
    blocks: [
      { type: "h3", text: "No site público" },
      {
        type: "ul",
        items: [
          "Dados que você informa nos formulários: nome, e-mail, empresa, cargo, número de pessoas, mês previsto da SIPAT e mensagem.",
          "Dados de navegação: páginas visitadas, dispositivo, navegador e origem do acesso, inclusive via cookies de análise, quando habilitados.",
          "A demo jogável não exige cadastro e não armazena suas respostas.",
        ],
      },
      { type: "h3", text: "Na plataforma de campanha" },
      {
        type: "ul",
        items: [
          "Dados cadastrais enviados pela empresa cliente: nome, CPF, data de nascimento, setor, unidade e, opcionalmente, e-mail.",
          "Dados de uso: participação por dia, respostas, pontuação, tempo de resposta, selos, brindes ganhos e check-ins.",
          "Conteúdo enviado pelo participante, como fotos e legendas no mural (sujeitos a moderação da empresa).",
          "Registro de consentimento e logs técnicos de acesso e segurança.",
        ],
      },
    ],
  },
  {
    id: "finalidades",
    title: "3. Para que usamos e com qual base legal",
    blocks: [
      {
        type: "ul",
        items: [
          "**Responder contatos e enviar propostas** (procedimentos preliminares a contrato e legítimo interesse).",
          "**Enviar materiais solicitados e comunicações sobre a SipatGo**, com opção de descadastro a qualquer momento (consentimento ou legítimo interesse, conforme o caso).",
          "**Operar a campanha**: autenticação, pontuação, ranking, sorteio de brindes, certificados e relatórios para o cliente (execução de contrato com o cliente e instruções do controlador).",
          "**Cumprir obrigações legais e regulatórias** e exercer direitos em processos (cumprimento de obrigação legal e exercício regular de direitos).",
          "**Segurança e prevenção a fraudes** (legítimo interesse).",
          "**Melhorar o site e o produto** com dados agregados de uso (legítimo interesse).",
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "[Revisão jurídica: confirmar as bases legais aplicáveis a cada finalidade e o papel de controlador/operador em cada fluxo.]",
      },
    ],
  },
  {
    id: "compartilhamento",
    title: "4. Com quem compartilhamos",
    blocks: [
      {
        type: "ul",
        items: [
          "Com a **empresa cliente**, no caso dos dados da campanha (painel do RH, relatórios, lista de presença).",
          "Com **fornecedores de infraestrutura** que nos ajudam a operar o serviço, como hospedagem, banco de dados, armazenamento, e-mail e automação, sob contrato e com obrigações de confidencialidade e segurança.",
          "Com **autoridades**, quando houver obrigação legal ou ordem judicial.",
        ],
      },
      { type: "p", text: "Não vendemos dados pessoais. Alguns fornecedores podem armazenar dados fora do Brasil; nesses casos, adotamos as salvaguardas previstas na LGPD." },
    ],
  },
  {
    id: "seguranca",
    title: "5. Segurança e retenção",
    blocks: [
      {
        type: "p",
        text: "Adotamos medidas técnicas e organizacionais para proteger os dados: criptografia em trânsito, controle de acesso por perfil, isolamento dos dados de cada empresa, CPF exibido mascarado fora do painel administrativo e registro de acessos.",
      },
      {
        type: "p",
        text: "Mantemos os dados pelo tempo necessário para as finalidades descritas, pelo prazo contratual com o cliente e pelos prazos legais aplicáveis. Ao fim, os dados são eliminados ou anonimizados. [Revisão jurídica: definir prazos de retenção por categoria de dado.]",
      },
    ],
  },
  {
    id: "direitos",
    title: "6. Seus direitos",
    blocks: [
      {
        type: "p",
        text: "Pela LGPD, você pode pedir: confirmação de tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade, informação sobre compartilhamento, revogação do consentimento e revisão de decisões automatizadas, quando aplicável.",
      },
      {
        type: "p",
        text: `Se você participa de uma campanha, o pedido pode ser feito à sua empresa (controladora) ou a nós, e encaminharemos ao responsável. Contato do encarregado (DPO): [nome a definir] · ${PRIVACY_EMAIL}.`,
      },
    ],
  },
  {
    id: "cookies",
    title: "7. Cookies",
    blocks: [
      {
        type: "p",
        text: "Usamos cookies necessários para o funcionamento do site e da plataforma (como a sessão de login). Quando habilitado, usamos o Google Analytics para medir o uso do site de forma agregada. Você pode bloquear cookies nas configurações do navegador, o que pode afetar algumas funções.",
      },
    ],
  },
  {
    id: "alteracoes",
    title: "8. Alterações e contato",
    blocks: [
      {
        type: "p",
        text: `Podemos atualizar esta política. A data da última atualização fica no topo da página. Dúvidas: ${PRIVACY_EMAIL} ou ${CONTACT_EMAIL}.`,
      },
    ],
  },
];

/** Termos de uso (rascunho — revisar com o jurídico). */
export const TERMS_SECTIONS: GuideSection[] = [
  {
    id: "aceite",
    title: "1. Aceite",
    blocks: [
      {
        type: "p",
        text: `Estes termos regulam o uso do site sipatgo.com.br e da plataforma SipatGo, oferecidos por [razão social a definir], ${CNPJ}. Ao usar o site ou a plataforma, você concorda com estes termos e com a [Política de Privacidade](/privacidade).`,
      },
    ],
  },
  {
    id: "servico",
    title: "2. O serviço",
    blocks: [
      {
        type: "p",
        text: "A SipatGo é uma plataforma web para campanhas educativas gamificadas, como a SIPAT. As condições comerciais (escopo, número de participantes, prazos, valores e nível de suporte) são definidas na proposta ou no contrato firmado com a empresa cliente, que prevalece sobre estes termos em caso de conflito.",
      },
      {
        type: "p",
        text: "A plataforma apoia a execução e o registro da campanha, mas **não substitui** a CIPA, o SESMT, os responsáveis técnicos em SST nem o cumprimento das normas regulamentadoras pela empresa. O conteúdo informativo do site não constitui consultoria jurídica ou técnica.",
      },
    ],
  },
  {
    id: "contas",
    title: "3. Contas e acesso",
    blocks: [
      {
        type: "ul",
        items: [
          "O acesso de participantes é feito com os dados cadastrados pela empresa cliente e um PIN pessoal. Não compartilhe seu PIN.",
          "Administradores são responsáveis pelos dados que importam e pelas configurações da campanha.",
          "Podemos suspender acessos em caso de uso indevido, fraude ou risco à segurança.",
        ],
      },
    ],
  },
  {
    id: "uso",
    title: "4. Uso permitido",
    blocks: [
      {
        type: "ul",
        items: [
          "Não tente burlar a pontuação, o sorteio, o cronômetro ou outros mecanismos do jogo.",
          "Não publique no mural conteúdo ofensivo, discriminatório, ilegal ou que viole direitos de terceiros, inclusive de imagem.",
          "Não tente acessar dados de outras empresas ou participantes.",
          "A empresa cliente modera o mural e pode remover conteúdos.",
        ],
      },
    ],
  },
  {
    id: "brindes",
    title: "5. Brindes",
    blocks: [
      {
        type: "p",
        text: "Os brindes são definidos, adquiridos e entregues pela empresa cliente. A SipatGo realiza o sorteio na plataforma conforme as regras configuradas e o estoque informado, e não se responsabiliza pela entrega, qualidade ou garantia dos brindes. [Revisão jurídica: avaliar enquadramento de distribuição gratuita de prêmios.]",
      },
    ],
  },
  {
    id: "propriedade",
    title: "6. Propriedade intelectual",
    blocks: [
      {
        type: "p",
        text: "A marca SipatGo, o software, o design e os conteúdos próprios são da SipatGo. Os conteúdos enviados pela empresa cliente (logo, vídeos, perguntas, materiais) continuam sendo dela, que garante ter os direitos para usá-los e nos autoriza a exibi-los na campanha.",
      },
    ],
  },
  {
    id: "responsabilidade",
    title: "7. Disponibilidade e responsabilidade",
    blocks: [
      {
        type: "p",
        text: "Trabalhamos para manter a plataforma disponível e segura, mas podem ocorrer interrupções por manutenção, falhas de terceiros ou força maior. Nossa responsabilidade se limita ao previsto no contrato com a empresa cliente e na legislação aplicável. [Revisão jurídica: definir limitação de responsabilidade e SLA.]",
      },
    ],
  },
  {
    id: "foro",
    title: "8. Lei aplicável e foro",
    blocks: [
      {
        type: "p",
        text: `Estes termos seguem a legislação brasileira. Fica eleito o foro da comarca de [cidade a definir], salvo disposição legal em contrário. Contato: ${CONTACT_EMAIL}.`,
      },
    ],
  },
];
