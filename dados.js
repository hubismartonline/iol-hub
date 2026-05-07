// =============================================================
//  DADOS DO HUB DO ALUNO — ISMART ONLINE
//  Avisos → Google Sheets | Alunos → Google Sheets
//  Plataformas, Guias, FAQ, Agenda → este arquivo
// =============================================================

let AVISOS = {
  destaque: {
    titulo: "2ª Formação IOL — Dias 23/05 e 30/05 🎉",
    texto: "Tem Formação chegando! Os encontros serão online, a partir das 9h. Já reserva esses dias na agenda e fica de olho no grupo de recados — em breve mais informações!",
    data: "Publicado em 6 mai 2026"
  },
  lista: [
    { tag: "📅 SAVE THE DATE", texto: "23/05 — 2ª Formação Online (9º EF, 1º e 2º EM) • 9h" },
    { tag: "📅 SAVE THE DATE", texto: "30/05 — 2ª Formação Online (8º EF e 3º EM) • 9h" },
    { tag: "⚠️ PRAZO",         texto: "30/05 — Fechamento Redação 3 da Letrus" },
    { tag: "⚠️ PRAZO",         texto: "30/05 — Início das inscrições para o Enem" }
  ]
};

// -------------------------------------------------------
//  PLATAFORMAS
// -------------------------------------------------------
const PLATAFORMAS = [
  // ENSINO FUNDAMENTAL
  {
    id: "layers",
    nome: "Layers",
    desc: "Plataforma principal — acesse Letrus e Khan por aqui",
    icon: "🔗",
    cor_bg: "#EBF4FF",
    url: "https://id.layers.digital/?context=web&community=ismart&location=%2F",
    series: ["8EF", "9EF"]
  },
  {
    id: "gamefik",
    nome: "Gamefik",
    desc: "Plataforma de aprendizagem gamificada",
    icon: "🎮",
    cor_bg: "#F3F0FF",
    url: "https://spot.gamefik.com/spot/ismart_adi?accessHash=fb706f6f-4afc-40d9-84d3-b26884df0ae1",
    series: ["8EF", "9EF"]
  },
  {
    id: "khan",
    nome: "Khan Academy",
    desc: "Matemática e ciências — acesse pela Layers",
    icon: "📐",
    cor_bg: "#FFF9E6",
    url: "https://id.layers.digital/?context=web&community=ismart&location=%2F",
    series: ["8EF", "9EF"]
  },
  {
    id: "letrus-ef",
    nome: "Letrus",
    desc: "Produção de texto — acesse pela Layers",
    icon: "✍️",
    cor_bg: "#FFF0F5",
    url: "https://id.layers.digital/?context=web&community=ismart&location=%2F",
    series: ["8EF", "9EF"]
  },
  // ENSINO MÉDIO
  {
    id: "evolucional",
    nome: "Evolucional",
    desc: "Simulados e exercícios",
    icon: "📘",
    cor_bg: "#EBF4FF",
    url: "https://simulados.evolucional.com.br/entrar",
    series: ["1EM", "2EM", "3EM"]
  },
  {
    id: "letrus-em",
    nome: "Letrus",
    desc: "Produção de texto e redação",
    icon: "✍️",
    cor_bg: "#FFF0F5",
    url: "https://aluno.letrus.com.br/login",
    series: ["1EM", "2EM", "3EM"]
  },
  {
    id: "ltf",
    nome: "Vai Lá e Faz (LTF)",
    desc: "Plataforma de aprendizagem — 1º e 2º EM",
    icon: "🚀",
    cor_bg: "#EDFFF6",
    url: "https://app.learntofly.global/login",
    series: ["1EM", "2EM"]
  },
  {
    id: "vailafaz3em",
    nome: "Vai Lá e Faz",
    desc: "Sala de aula — exclusivo 3º EM",
    icon: "🚀",
    cor_bg: "#EDFFF6",
    url: "https://bit.ly/SaladeAula3EM26",
    series: ["3EM"]
  },
  {
    id: "google-academico",
    nome: "Google Acadêmico",
    desc: "Pesquisa científica e acadêmica",
    icon: "🔬",
    cor_bg: "#F3F0FF",
    url: "https://scholar.google.com.br",
    series: ["1EM", "2EM", "3EM"]
  }
];

// -------------------------------------------------------
//  GUIAS
// -------------------------------------------------------
const GUIAS = [
  {
    grupo: "📋 Guias do Programa",
    itens: [
      {
        nome: "Guia do Aluno IOL 2026",
        desc: "Tudo sobre o programa, regras e como aproveitar ao máximo",
        icon: "📄",
        cor_bg: "#EBF4FF",
        url: "https://www.canva.com/design/DAG97Go_lrQ/w2oDsdiaLo72ahtJUJMdqw/view?utm_content=DAG97Go_lrQ&utm_campaign=designshare&utm_medium=link&utm_source=viewer#38",
        series: ["8EF", "9EF", "1EM", "2EM", "3EM"]
      },
      {
        nome: "Guia Completo da Layers",
        desc: "Manual de uso da plataforma — passo a passo para o EF",
        icon: "🔗",
        cor_bg: "#EBF4FF",
        url: "https://www.figma.com/proto/VZs1igV5CSbpNwJ1cvHtmF/Manual-de-uso-do-SuperApp-Layers?node-id=284-2605&node-type=CANVAS&t=DF43NqhM5WzEDV09-0&scaling=min-zoom&content-scaling=fixed&page-id=99%3A171&starting-point-node-id=99%3A172",
        series: ["8EF", "9EF"]
      },
      {
        nome: "Manual do Khanmigo",
        desc: "Como usar a IA do Khan Academy nos seus estudos",
        icon: "🤖",
        cor_bg: "#FFF9E6",
        url: "https://docs.google.com/document/d/1lB-Yb1pFMXN-bgR-smfIfA0V05R9LXMniYyPoaCAawo/edit?tab=t.0",
        series: ["8EF", "9EF"]
      },
      {
        nome: "FAQ da Letrus",
        desc: "Dúvidas frequentes sobre a plataforma de redação",
        icon: "✍️",
        cor_bg: "#FFF0F5",
        url: "https://www.canva.com/design/DAHDK4MRl6Y/vTd17ImAebzvN_ZgljRw6g/view?utm_content=DAHDK4MRl6Y&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hf3b4a9d1e2#5",
        series: ["8EF", "9EF", "1EM", "2EM", "3EM"]
      }
    ]
  },
  {
    grupo: "🎯 9º EF — Melhores Oportunidades e Bolsa Talento",
    itens: [
      {
        nome: "Guia de Melhores Oportunidades 2026",
        desc: "Escolas de excelência para o Ensino Médio — acesse e se prepare!",
        icon: "🏆",
        cor_bg: "#FFF0F5",
        url: "https://bit.ly/GuiaMO2026",
        series: ["9EF"]
      },
      {
        nome: "Edital Processo Seletivo Bolsa Talento 2027",
        desc: "Tudo sobre o PS Ismart 2027 — leia antes de se inscrever!",
        icon: "📋",
        cor_bg: "#EBF4FF",
        url: "https://ps.ismart.org.br/regulation-ps-2027.pdf",
        series: ["9EF"]
      },
      {
        nome: "Site de Inscrição — PS Ismart 2027",
        desc: "Faça sua inscrição no Bolsa Talento aqui",
        icon: "✅",
        cor_bg: "#EDFFF6",
        url: "https://ps.ismart.org.br",
        series: ["9EF"]
      }
    ]
  },
  {
    grupo: "📸 Memórias do Programa",
    itens: [
      {
        nome: "Fotos das Formações",
        desc: "Álbum oficial do Ismart no Flickr",
        icon: "📷",
        cor_bg: "#FFF9E6",
        url: "https://www.flickr.com/photos/ismartoficial/albums",
        series: ["8EF", "9EF", "1EM", "2EM", "3EM"]
      }
    ]
  }
];

// -------------------------------------------------------
//  AGENDA — Maio 2026
// -------------------------------------------------------
const AGENDA = [
  { dia: "01", mes: "MAI", titulo: "Abertura Missão 'Vai Lá e Faz'",       subtitulo: "Acesse pelo LTF",                               tipo: "mentoria", tipo_label: "MISSÃO"   },
  { dia: "12", mes: "MAI", titulo: "Início Isenção Fuvest",                 subtitulo: "Começa período de solicitação",                  tipo: "prazo",    tipo_label: "PRAZO"    },
  { dia: "13", mes: "MAI", titulo: "Início Isenção Unicamp",                subtitulo: "Começa período de solicitação",                  tipo: "prazo",    tipo_label: "PRAZO"    },
  { dia: "14", mes: "MAI", titulo: "Fechamento Missão 'Vai Lá e Faz'",     subtitulo: "Prazo final da missão",                          tipo: "prazo",    tipo_label: "PRAZO"    },
  { dia: "15", mes: "MAI", titulo: "Redação 3 — Letrus",                    subtitulo: "Abertura da redação do ciclo de maio",           tipo: "prazo",    tipo_label: "PRAZO"    },
  { dia: "16", mes: "MAI", titulo: "1º Simulado Evo Enem — Dia 1",         subtitulo: "Ensino Médio • Evolucional",                     tipo: "simulado", tipo_label: "SIMULADO" },
  { dia: "23", mes: "MAI", titulo: "2ª Formação Online",                    subtitulo: "9º EF, 1º e 2º EM • a partir das 9h",           tipo: "mentoria", tipo_label: "FORMAÇÃO" },
  { dia: "23", mes: "MAI", titulo: "1º Simulado Evo Enem — Dia 2",         subtitulo: "Ensino Médio • Evolucional",                     tipo: "simulado", tipo_label: "SIMULADO" },
  { dia: "30", mes: "MAI", titulo: "2ª Formação Online",                    subtitulo: "8º EF e 3º EM • a partir das 9h",               tipo: "mentoria", tipo_label: "FORMAÇÃO" },
  { dia: "30", mes: "MAI", titulo: "Fechamento Redação 3 — Letrus",        subtitulo: "Prazo final de envio da redação",                tipo: "prazo",    tipo_label: "PRAZO"    },
  { dia: "30", mes: "MAI", titulo: "Início Inscrição Enem",                 subtitulo: "Fique atento ao prazo!",                         tipo: "prazo",    tipo_label: "PRAZO"    }
];

const FAQ = [
  // ===== PROGRAMA =====
  {
    q: "O que é o Ismart Online (IOL)?",
    a: "O Ismart Online é um Programa de Desenvolvimento que atua em três pilares: Acadêmico, Socioemocional e Orientação Profissional. Realizamos 4 Formações ao longo do ano — momentos essenciais para desenvolvimento e fortalecimento da comunidade Ismart.",
    tags: "programa ismart iol o que é"
  },
  {
    q: "O que é ser um(a) Ismart(i)ano(a)?",
    a: "Ser Ismart(i)ano(a) é reconhecer a importância do estudo, do esforço e da dedicação para alcançar grandes oportunidades. Você é o protagonista da sua história, e o Ismart está aqui para te apoiar em cada passo.",
    tags: "ismartiano bolsista programa"
  },
  {
    q: "Qual é o papel do tutor no IOL?",
    a: "Seu tutor não é um professor, mas um guia que te ajuda a organizar a rotina, acompanhar prazos e desenvolver autonomia. Sempre que precisar de ajuda, entre em contato com pelo menos 2 dias úteis de antecedência em relação ao prazo final das atividades.",
    tags: "tutor tutoria papel função ajuda suporte"
  },
  {
    q: "Como devo me comunicar com meu tutor?",
    a: "Entre em contato com seu tutor pelo WhatsApp com pelo menos 2 dias úteis de antecedência em relação ao prazo final das atividades. Sempre responda quando seu tutor entrar em contato — após 3 tentativas sem resposta, você pode ser desligado do programa.",
    tags: "tutor comunicação whatsapp contato prazo resposta"
  },

  // ===== REGRAS =====
  {
    q: "Quais são as regras de engajamento no IOL?",
    a: "Para permanecer no programa é necessário: cumprir prazos obrigatórios, manter 80% de engajamento em cada disciplina e acompanhar os canais oficiais de comunicação. O descumprimento pode levar ao desligamento.",
    tags: "regras engajamento desligamento 80% prazos obrigatorio"
  },
  {
    q: "O que é a Prova Única (PU)?",
    a: "A Prova Única é uma ferramenta do Ismart para acompanhar seu desempenho acadêmico. No EF são até 3 provas por ano com 48 questões (Matemática e Linguagens). No EM são 2 provas por ano com 90 questões (todas as áreas). A realização é obrigatória e fica disponível por 5 dias.",
    tags: "prova única PU avaliação teste obrigatório desempenho"
  },
  {
    q: "Posso faltar à Prova Única?",
    a: "É permitido justificar a ausência nas provas, desde que não sejam consecutivas. Motivos aceitos: questões de saúde comprovadas por atestado médico. Envie o atestado pelo formulário: bit.ly/ChamaNoForms2026",
    tags: "falta prova única ausência justificativa atestado"
  },
  {
    q: "Quais são as regras de presença nas Formações?",
    a: "A participação nas 4 formações anuais é obrigatória. É permitido justificar ausência em até 2 formações por ano (não consecutivas). Motivos aceitos: saúde com atestado, compromisso religioso com comprovação ou atividades escolares oficiais com documento da escola.",
    tags: "formação presença falta ausência obrigatório justificativa"
  },
  {
    q: "O que acontece se eu reprovar na escola?",
    a: "Para permanecer no Ismart é obrigatório estar matriculado em uma escola regular e ser aprovado ao final do ano letivo. Caso seja reprovado ou deixe a escola, informe o Ismart imediatamente — o desligamento do projeto será realizado.",
    tags: "escola reprovação matrícula desligamento obrigatorio aprovação"
  },
  {
    q: "Posso trabalhar e continuar no Ismart?",
    a: "O Ismart valoriza o foco acadêmico, mas entende situações especiais. Se precisar trabalhar, comunique seu tutor o quanto antes para avaliar juntos a melhor forma de apoiar sua organização e garantir o cumprimento das atividades obrigatórias.",
    tags: "trabalho emprego remunerado estudar conciliar tutor"
  },
  {
    q: "O que fazer em caso de questão de saúde?",
    a: "Se alguma questão de saúde física ou mental impactar sua participação no IOL, informe o quanto antes preenchendo o formulário de atendimento: bit.ly/ChamaNoForms2026",
    tags: "saúde doença mental física problema atestado formulário"
  },
  {
    q: "Como atualizar meus dados cadastrais?",
    a: "Mudou telefone, e-mail ou outra informação? Use o formulário de atendimento (bit.ly/ChamaNoForms2026) ou avise seu tutor diretamente pelo WhatsApp.",
    tags: "cadastro atualizar dados telefone email endereço"
  },

  // ===== PLATAFORMAS =====
  {
    q: "Como acesso a Layers? (8º e 9º EF)",
    a: "Acesse layers.digital e faça login com o e-mail no formato: [ano][RA][nomeultimosobrenome]@aluno.ismart.org.br. A senha foi enviada por e-mail pelo time do Ismart. Dentro da Layers você acessa a Letrus e o Khan Academy pelo menu lateral esquerdo. Não recebeu? Fale com seu tutor!",
    tags: "layers login acesso senha fundamental ef usuario email"
  },
  {
    q: "Como funciona a Layers?",
    a: "A Layers é a plataforma central do EF. Nela você encontra: painel integrado para acompanhar sua rotina, a aba de Comunicações com as missões, e uma agenda com todas as datas importantes do programa.",
    tags: "layers plataforma funciona como painel missões agenda"
  },
  {
    q: "Como acesso a Evolucional? (Ensino Médio)",
    a: "Acesse simulados.evolucional.com.br/entrar com o e-mail e senha que você recebeu. Esqueceu a senha? Clique em 'Esqueci minha senha' na tela de login.",
    tags: "evolucional login acesso senha médio EM"
  },
  {
    q: "O que é o Evo ENEM e o Evo Nitro?",
    a: "O Evo ENEM é o simulado oficial da Evolucional no estilo ENEM com correção pela metodologia TRI. O Evo Nitro é um percurso personalizado por área de interesse, dividido em ciclos semanais com 3 módulos de estudo e 1 desafio final de 18 questões.",
    tags: "evo enem nitro evolucional simulado trilha preparatória"
  },
  {
    q: "Como funciona a Letrus?",
    a: "A Letrus é a plataforma de redação do IOL. Ela usa inteligência artificial para corrigir seu texto em segundos com base nas competências do ENEM. São 7 temas de redação por ano, com 15 dias para entregar a escrita e a reescrita de cada texto.",
    tags: "letrus redação plataforma como funciona temas prazo"
  },
  {
    q: "Como acesso o Vai Lá e Faz / LTF? (1º e 2º EM)",
    a: "Acesse app.learntofly.global/login com seu e-mail e senha do programa. Para o 3º EM o acesso é pelo link bit.ly/SaladeAula3EM26.",
    tags: "vai lá e faz ltf learn to fly login acesso médio"
  },
  {
    q: "O que é o Khanmigo?",
    a: "O Khanmigo é uma inteligência artificial do Khan Academy que te apoia nos estudos. Com ele você pode tirar dúvidas sobre diferentes matérias, revisar conteúdos e explorar novos temas no seu próprio ritmo.",
    tags: "khanmigo khan inteligência artificial IA dúvidas estudos"
  },

  // ===== MISSÕES =====
  {
    q: "O que são as Missões?",
    a: "As Missões são trilhas de aprendizagem que apoiam seu desenvolvimento como estudante e profissional. São disponibilizadas ao longo do ano e devem ser realizadas do dia 01 ao dia 14 de cada mês. A realização é obrigatória.",
    tags: "missões trilha aprendizagem prazo obrigatório mês"
  },
  {
    q: "O que é o Vai Lá e Faz?",
    a: "O Vai Lá e Faz é a evolução das missões para o Ensino Médio. Foi criado para preparar você para os desafios acadêmicos, profissionais e pessoais de forma prática. Inclui trilhas na plataforma Learn to Fly, encontros ao vivo com especialistas e ações especiais ao longo do ano. A realização de todas as ações é obrigatória.",
    tags: "vai lá e faz missão ensino médio ltf learn to fly obrigatório"
  },

  // ===== FORMAÇÕES =====
  {
    q: "O que são as Formações Online?",
    a: "As Formações são momentos dedicados a você para se sentir acolhido pela comunidade Ismart e se desenvolver com seus colegas. São 4 formações por ano — a presença é obrigatória! As atividades e temas são pensados para apoiá-los ao longo do ano.",
    tags: "formação online presencial encontro comunidade obrigatório"
  },

  // ===== OPORTUNIDADES =====
  {
    q: "O que é o Bolsa Talento (BT)?",
    a: "O Bolsa Talento é um programa do Ismart que oferece: bolsa de estudos integral para o Ensino Médio em escola particular parceira, auxílio financeiro, acompanhamento individual e possibilidade de acesso a cursos de inglês e tecnologia. Para alunos do 9º EF, participar do processo seletivo é obrigatório.",
    tags: "bolsa talento BT presencial escola particular processo seletivo"
  },
  {
    q: "O que são as Melhores Oportunidades (MO)?",
    a: "As Melhores Oportunidades são escolas públicas de excelência identificadas pelo Ismart para o Ensino Médio. É obrigatório participar de ao menos um processo seletivo de MO. Algumas opções: BH (CEFET-MG, COLTEC), RJ (CEFET-RJ, IFRJ), SP/SJC (IFSP, ETEC).",
    tags: "melhores oportunidades MO vestibulinho escola pública excelência CEFET ETEC IFSP"
  },
  {
    q: "Quais vestibulares são obrigatórios no 3º EM?",
    a: "Além do ENEM, todos devem realizar ao menos 2 vestibulares apoiados. Os obrigatórios por praça são: São Paulo/SJC (Fuvest), Rio de Janeiro (UERJ). Outros obrigatórios incluem Mauá e Inteli conforme a praça. Fique atento às comunicações oficiais!",
    tags: "vestibular obrigatório ENEM fuvest UERJ mauá inteli UFMG 3EM"
  },
  {
    q: "O que é o ENEM Treineiro?",
    a: "O ENEM Treineiro é obrigatório para alunos do 1º e 2º EM. Ele permite conhecer o formato da prova, testar conhecimentos, identificar pontos fortes e vivenciar um exame longo. Se não realizar, você deve apresentar justificativa válida — um simulado extra será aplicado como alternativa.",
    tags: "enem treineiro obrigatório 1EM 2EM vestibular prova"
  },
  {
    q: "O Ismart reembolsa a taxa de vestibular?",
    a: "Sim! O Ismart reembolsa a inscrição para alunos que: solicitaram isenção, tiveram o pedido negado e atenderam aos critérios do programa. Para vestibulinhos do 9º EF com taxa, o Ismart reembolsa o valor de até um vestibulinho.",
    tags: "reembolso taxa inscrição vestibular isenção ENEM fuvest"
  },
  {
    q: "O que é o Plantão SiSU?",
    a: "O Plantão SiSU é um momento importante em que você usa a nota do ENEM para escolher a universidade. O Ismart oferece lives exclusivas explicando todas as etapas e atendimentos individuais com tutores para orientação personalizada na escolha dos cursos.",
    tags: "SiSU plantão universidade ENEM nota escolha tutoria"
  },

  // ===== OUTROS PROGRAMAS =====
  {
    q: "O que é o PREP?",
    a: "O PREP (Preparatório para Estudar Fora) é um programa do Ismart para estudantes que querem cursar o Ensino Superior no exterior. Oferece aulas em inglês, preparação para TOEFL e SAT, apoio na aplicação para universidades internacionais e orientação para documentação.",
    tags: "PREP exterior internacional inglês TOEFL SAT universidade fora"
  },
  {
    q: "O que é o Ensino Superior Ismart (ES Ismart)?",
    a: "O ES Ismart é o Programa de Desenvolvimento Universitário criado para ampliar o repertório dos estudantes na graduação. Para ingressar é preciso: bom desempenho acadêmico, engajamento nas atividades do Ismart, aprovação em curso e universidade apoiados e interesse em participar.",
    tags: "ensino superior ES Ismart graduação universidade programa"
  },
  {
    q: "O que é a Rede Alumni Ismart?",
    a: "A Rede Alumni reúne ex-bolsistas que já finalizaram o Ensino Superior. Oferece conexão com graduandos e alumni, troca de experiências, eventos periódicos e apoio à empregabilidade e desenvolvimento profissional.",
    tags: "alumni rede ex-bolsistas graduação emprego profissional"
  },


  // ===== BOLSA TALENTO — PROCESSO SELETIVO 2027 =====
  {
    q: "O que é o Processo Seletivo Ismart 2027 (Bolsa Talento)?",
    a: "O Bolsa Talento oferece bolsa de estudos integral para cursar o Ensino Médio em escolas particulares de excelência. Além da bolsa, os aprovados participam de um programa de desenvolvimento acadêmico, pessoal e profissional com acompanhamento ao longo do EM. Para informações completas acesse o edital: ps.ismart.org.br/regulation-ps-2027.pdf",
    tags: "bolsa talento processo seletivo 2027 PS inscrição EM presencial"
  },
  {
    q: "O que está incluído na bolsa do Bolsa Talento?",
    a: "Os aprovados podem receber: bolsa integral em escola parceira, material didático, uniforme escolar, auxílio-alimentação durante os dias de aula, possível auxílio-transporte (avaliado caso a caso), participação em atividades do Ismart e acompanhamento educacional.",
    tags: "bolsa talento benefícios bolsa integral material uniforme alimentação transporte"
  },
  {
    q: "Preciso já fazer parte do Ismart para participar do Bolsa Talento?",
    a: "Não! O processo seletivo é aberto para qualquer estudante que atenda aos critérios do edital, mesmo que nunca tenha participado do Ismart. Mas sendo aluno do IOL, você já tem uma vantagem por conhecer bem o programa!",
    tags: "bolsa talento inscrição quem pode participar externo"
  },
  {
    q: "Qual é o critério de renda para o Bolsa Talento?",
    a: "A renda familiar deve ser de até 2 salários mínimos por pessoa. Exemplo: renda total R$6.000 com 4 moradores = R$1.500 per capita (dentro do critério). Pensão alimentícia, doações e ajuda financeira de terceiros entram no cálculo.",
    tags: "renda per capita salário mínimo critério bolsa talento família"
  },
  {
    q: "Se eu me inscrever no Bolsa Talento, perco o Ismart Online?",
    a: "Não! Sua vaga no IOL é garantida até o final do Ensino Médio enquanto você cumprir os requisitos. Se for aprovado no Bolsa Talento, aí sim há transferência para o Ismart Presencial. Se não for aprovado, você continua normalmente no IOL.",
    tags: "bolsa talento IOL ismart online perder vaga transferência"
  },
  {
    q: "Como me inscrevo no Bolsa Talento sendo aluno do IOL?",
    a: "Acesse ps.ismart.org.br, use obrigatoriamente seu e-mail @aluno.ismart.org.br e insira o código do educador: EDU-02BB. Escolha a modalidade 'presencial'. Esse código permite que sua inscrição seja acompanhada pela equipe do IOL.",
    tags: "bolsa talento inscrição como site EDU-02BB código educador email"
  },
  {
    q: "Como funciona o processo seletivo do Bolsa Talento?",
    a: "O processo tem várias etapas: inscrição, teste de raciocínio lógico, jogo interativo (Enigma Ismart), formulário sobre você e sua família, envio de vídeo (Desafio Ismart), análise socioeconômica, prova digital de Português e Matemática, entrevistas e dinâmicas. Fique sempre de olho na plataforma!",
    tags: "bolsa talento etapas prova seletivo enigma desafio entrevista dinâmica"
  },
  {
    q: "Quando sai o resultado do Bolsa Talento 2027?",
    a: "O resultado final está previsto para até novembro de 2026. Acompanhe as informações pela plataforma do processo seletivo em ps.ismart.org.br.",
    tags: "bolsa talento resultado quando novembro 2026"
  },
  {
    q: "O que são as Melhores Oportunidades para o 9º EF?",
    a: "São escolas públicas de excelência para o Ensino Médio identificadas pelo Ismart. Exemplos: BH (CEFET-MG, COLTEC), RJ (CEFET-RJ, IFRJ), SP/SJC (IFSP, ETEC). A participação em ao menos um processo seletivo de MO é obrigatória para alunos do 9º EF. Acesse o guia completo: bit.ly/GuiaMO2026",
    tags: "melhores oportunidades MO 9EF escolas CEFET ETEC IFSP vestibulinho obrigatório"
  },
  {
    q: "Tive um problema técnico no site do processo seletivo. O que fazer?",
    a: "Entre em contato com a equipe do processo seletivo pelo WhatsApp: wa.me/5521991954950. Para erros no cadastro, fale com seu tutor para receber orientação.",
    tags: "bolsa talento erro técnico problema site whatsapp suporte"
  }
];
  // ===== DÚVIDAS PRÁTICAS =====
  {
    q: "Perdi um prazo. O que fazer?",
    a: "Fale imediatamente com seu tutor pelo WhatsApp explicando o que aconteceu. Lembre: entre em contato com pelo menos 2 dias úteis de antecedência antes do prazo. Quanto antes você comunicar, maiores as chances de encontrar uma solução!",
    tags: "prazo perdeu atrasou tutor whatsapp urgente"
  },
  {
    q: "O que fazer se estiver com dificuldade em uma matéria?",
    a: "Você pode: usar o Khan Academy ou Khanmigo para reforçar conteúdos, assistir às videoaulas disponíveis nas plataformas, participar das formações e entrar em contato com seu tutor pelo WhatsApp.",
    tags: "dificuldade matéria estudar ajuda khan tutoria"
  },
  {
    q: "O que é o RA?",
    a: "O RA (Registro do Aluno) é seu código de identificação no Ismart. Você encontra no e-mail de boas-vindas do programa. É o número que você usa para acessar este Hub.",
    tags: "RA registro aluno código identificação número"
  },
  {
    q: "Estou com dificuldades emocionais. Existe apoio?",
    a: "Sim! O Ismart oferece apoio socioemocional. Se alguma questão de saúde mental impactar sua participação, informe pelo formulário: bit.ly/ChamaNoForms2026. Converse também com seu tutor — você não está sozinho(a)!",
    tags: "saúde mental emocional apoio psicológico dificuldade ansiedade"
  },
  {
    q: "Como funciona a Orientação Profissional no IOL?",
    a: "O Projeto de Orientação Profissional te ajuda a conhecer carreiras, entender o mercado de trabalho e traçar estratégias. Inclui Rodadas de Estratégias com tutores, o Guia de Carreiras e o TPV/TEP (Trabalho de Projeto/Escolha de Vida Profissional).",
    tags: "orientação profissional carreira trabalho futuro TEP TPV guia"
  }
];

// -------------------------------------------------------
//  CONTATOS
// -------------------------------------------------------
const CONTATOS = [
  {
    nome: "Formulário de Atendimento",
    desc: "Dúvidas, solicitações e comunicados para a equipe IOL",
    icon: "📋",
    cor_bg: "#EBF4FF",
    tipo: "link",
    url: "https://bit.ly/ChamaNoForms2026"
  }
];

// -------------------------------------------------------
//  ÍNDICE DE BUSCA
// -------------------------------------------------------
const SEARCH_INDEX = [
  ...PLATAFORMAS.map(p => ({
    cat: "Plataforma",
    texto: p.nome + " " + p.desc,
    acao: () => trocarAba("plataformas")
  })),
  ...FAQ.map(f => ({
    cat: "FAQ",
    texto: f.q,
    acao: () => { trocarAba("faq"); setTimeout(() => abrirFaqPorTexto(f.q), 300); }
  })),
  ...GUIAS.flatMap(g => g.itens.map(item => ({
    cat: "Guia",
    texto: item.nome + " " + item.desc,
    acao: () => trocarAba("guias")
  }))),
  { cat: "Seção", texto: "agenda calendario formacao simulado prazo enem fuvest unicamp", acao: () => trocarAba("agenda") },
  { cat: "Seção", texto: "atendimento formulario ajuda suporte",                           acao: () => trocarAba("atendimento") },
  { cat: "Seção", texto: "perfil cadastro dados pessoais",                                 acao: () => trocarAba("perfil") },
  { cat: "Ação",  texto: "falar tutor whatsapp",                                           acao: () => abrirWhatsApp() }
];

function abrirFaqPorTexto(pergunta) {
  document.querySelectorAll(".faq-item").forEach(item => {
    if (item.querySelector(".faq-q span")?.textContent === pergunta)
      item.classList.add("open");
  });
}
