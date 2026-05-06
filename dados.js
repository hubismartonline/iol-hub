// =============================================================
//  DADOS DO HUB DO ALUNO — ISMART ONLINE
//  
//  💡 COMO ATUALIZAR:
//  Este arquivo funciona como "banco de dados" do site.
//  Futuramente, substituir por integração com Google Sheets.
//
//  Para usar Google Sheets:
//  1. Crie uma planilha no Google Sheets
//  2. Publique como CSV (Arquivo > Compartilhar > Publicar na web)
//  3. Use fetch() para carregar os dados no lugar deste arquivo
// =============================================================

// -------------------------------------------------------
//  ALUNOS — mapeamento RA → dados do aluno
//  Em produção: substituir por fetch ao Google Sheets
// -------------------------------------------------------
const ALUNOS = {
  "100001": {
    nome: "Ana Silva",
    serie: "8EF",
    turma: "A",
    cidade: "São Paulo",
    tutor: "Larissa Almeida",
    tutor_iniciais: "LA",
    tutor_wpp: "5511990001001",  // formato: DDI+DDD+número sem espaços
    tutor_msg: "Oi, Larissa! Sou a Ana Silva (8EF Turma A). Preciso de ajuda com..."
  },
  "100002": {
    nome: "Carlos Souza",
    serie: "9EF",
    turma: "B",
    cidade: "Campinas",
    tutor: "Victória Lima",
    tutor_iniciais: "VL",
    tutor_wpp: "5511990002002",
    tutor_msg: "Oi, Victória! Sou o Carlos Souza (9EF Turma B). Preciso de ajuda com..."
  },
  "100003": {
    nome: "Julia Ferreira",
    serie: "1EM",
    turma: "C",
    cidade: "Santos",
    tutor: "Renan Costa",
    tutor_iniciais: "RC",
    tutor_wpp: "5511990003003",
    tutor_msg: "Oi, Renan! Sou a Julia Ferreira (1EM Turma C). Preciso de ajuda com..."
  },
  "100004": {
    nome: "Pedro Oliveira",
    serie: "2EM",
    turma: "A",
    cidade: "São Paulo",
    tutor: "Larissa Almeida",
    tutor_iniciais: "LA",
    tutor_wpp: "5511990001001",
    tutor_msg: "Oi, Larissa! Sou o Pedro Oliveira (2EM Turma A). Preciso de ajuda com..."
  },
  "100005": {
    nome: "Mariana Santos",
    serie: "3EM",
    turma: "B",
    cidade: "São Paulo",
    tutor: "Tais Rodrigues",
    tutor_iniciais: "TR",
    tutor_wpp: "5511990004004",
    tutor_msg: "Oi, Tais! Sou a Mariana Santos (3EM Turma B). Preciso de ajuda com..."
  },
  // RA de teste fácil de lembrar
  "123456": {
    nome: "Aluno Teste",
    serie: "8EF",
    turma: "A",
    cidade: "São Paulo",
    tutor: "Larissa Almeida",
    tutor_iniciais: "LA",
    tutor_wpp: "5511990001001",
    tutor_msg: "Oi, Larissa! Preciso de ajuda com..."
  }
};

// -------------------------------------------------------
//  PLATAFORMAS — organizadas por série
// -------------------------------------------------------
const PLATAFORMAS = [
  {
    id: "evolucional",
    nome: "Evolucional",
    desc: "Aulas, videoaulas e exercícios por disciplina",
    icon: "📘",
    cor_bg: "#EBF4FF",
    url: "https://www.evolucional.com.br",
    series: ["8EF", "9EF", "1EM", "2EM", "3EM"]
  },
  {
    id: "letrus",
    nome: "Letrus",
    desc: "Produção de texto e redação",
    icon: "✍️",
    cor_bg: "#FFF0F5",
    url: "https://www.letrus.com.br",
    series: ["8EF", "9EF", "1EM", "2EM", "3EM"]
  },
  {
    id: "khan",
    nome: "Khan Academy",
    desc: "Matemática, ciências e BNCC",
    icon: "📐",
    cor_bg: "#FFF9E6",
    url: "https://pt.khanacademy.org",
    series: ["8EF", "9EF", "1EM", "2EM", "3EM"]
  },
  {
    id: "formacao",
    nome: "Formação Ismart",
    desc: "Desenvolvimento socioemocional",
    icon: "🎓",
    cor_bg: "#EDFFF6",
    url: "https://www.ismart.org.br",
    series: ["8EF", "9EF", "1EM", "2EM", "3EM"]
  },
  {
    id: "layers",
    nome: "Layers",
    desc: "Plataforma geral do programa",
    icon: "🔗",
    cor_bg: "#F3F0FF",
    url: "https://layers.education",
    series: ["8EF", "9EF"]
  }
];

// -------------------------------------------------------
//  GUIAS — links para materiais no Google Drive
// -------------------------------------------------------
const GUIAS = [
  {
    grupo: "📋 Guias do Programa",
    itens: [
      {
        nome: "Guia do Aluno IOL 2026",
        desc: "Tudo sobre o programa, regras e benefícios",
        icon: "📄",
        cor_bg: "#EBF4FF",
        url: "https://drive.google.com",
        series: ["8EF", "9EF", "1EM", "2EM", "3EM"]
      },
      {
        nome: "Como usar as plataformas",
        desc: "Passo a passo para acessar Evolucional, Letrus e Khan",
        icon: "💻",
        cor_bg: "#EDFFF6",
        url: "https://drive.google.com",
        series: ["8EF", "9EF", "1EM", "2EM", "3EM"]
      }
    ]
  },
  {
    grupo: "📚 Materiais de Estudo",
    itens: [
      {
        nome: "Guia de Estudos — Maio 2026",
        desc: "Conteúdos e metas do mês",
        icon: "🗓️",
        cor_bg: "#FFF9E6",
        url: "https://drive.google.com",
        series: ["8EF", "9EF", "1EM", "2EM", "3EM"]
      },
      {
        nome: "Preparação para o ENEM",
        desc: "Roteiro de estudos específico para o 3EM",
        icon: "🏆",
        cor_bg: "#FFF0F5",
        url: "https://drive.google.com",
        series: ["3EM"]
      },
      {
        nome: "Técnicas de Estudo",
        desc: "Pomodoro, mapas mentais e como aproveitar melhor o tempo",
        icon: "🧠",
        cor_bg: "#F3F0FF",
        url: "https://drive.google.com",
        series: ["8EF", "9EF", "1EM", "2EM", "3EM"]
      }
    ]
  },
  {
    grupo: "❤️ Bem-estar",
    itens: [
      {
        nome: "Apoio Socioemocional",
        desc: "Recursos para saúde mental e bem-estar",
        icon: "💚",
        cor_bg: "#EDFFF6",
        url: "https://drive.google.com",
        series: ["8EF", "9EF", "1EM", "2EM", "3EM"]
      }
    ]
  }
];

// -------------------------------------------------------
//  AGENDA — próximos eventos
// -------------------------------------------------------
const AGENDA = [
  {
    dia: "15",
    mes: "JUN",
    titulo: "Simulado Nacional",
    subtitulo: "Acesse pela Evolucional • 9h às 12h",
    tipo: "simulado",
    tipo_label: "SIMULADO"
  },
  {
    dia: "22",
    mes: "MAI",
    titulo: "Mentoria Coletiva de Matemática",
    subtitulo: "Google Meet • quinta-feira, 19h",
    tipo: "mentoria",
    tipo_label: "MENTORIA"
  },
  {
    dia: "30",
    mes: "MAI",
    titulo: "Prazo — Atividades Letrus",
    subtitulo: "Enviar redação do ciclo de maio",
    tipo: "prazo",
    tipo_label: "PRAZO"
  },
  {
    dia: "05",
    mes: "JUN",
    titulo: "Mentoria Coletiva de Português",
    subtitulo: "Google Meet • sexta-feira, 18h30",
    tipo: "mentoria",
    tipo_label: "MENTORIA"
  }
];

// -------------------------------------------------------
//  FAQ — perguntas frequentes
// -------------------------------------------------------
const FAQ = [
  {
    q: "Como acesso a Evolucional?",
    a: "Acesse evolucional.com.br e faça login com o e-mail que você recebeu no cadastro do Ismart. Se não lembrar a senha, clique em 'Esqueci minha senha' na tela de login. Em caso de problemas, fale com seu tutor."
  },
  {
    q: "Não consigo acessar o Letrus. O que fazer?",
    a: "Verifique se está usando o e-mail correto (o mesmo do seu cadastro Ismart). Se o problema persistir, fale diretamente com seu tutor pelo WhatsApp com o print do erro que aparece."
  },
  {
    q: "O que fazer se estiver com dificuldade em uma matéria?",
    a: "Você pode: 1) usar o Khan Academy para reforçar conteúdos básicos, 2) assistir às videoaulas da Evolucional, 3) participar das mentorias coletivas e 4) entrar em contato com seu tutor pelo WhatsApp."
  },
  {
    q: "Perdi um prazo. O que faço?",
    a: "Fale imediatamente com seu tutor pelo WhatsApp explicando o que aconteceu. Quanto antes você comunicar, maiores as chances de encontrar uma solução. Não deixe para depois!"
  },
  {
    q: "Como funciona o programa Ismart Online?",
    a: "O IOL é um programa 100% online de acompanhamento educacional para alunos de escolas públicas com alto potencial. Você tem tutores dedicados, acesso a plataformas de aprendizagem (Evolucional, Letrus, Khan Academy) e mentorias regulares ao longo do ano."
  },
  {
    q: "Quando acontecem as mentorias coletivas?",
    a: "As mentorias acontecem semanalmente por videoconferência. Verifique a aba 'Agenda' para ver os próximos encontros. Seu tutor também te avisará pelo WhatsApp com antecedência."
  },
  {
    q: "Posso mudar meu horário de mentoria?",
    a: "Entre em contato com seu tutor pelo WhatsApp para verificar possibilidades. Os horários são definidos no início do semestre e costumam ser fixos, mas o tutor pode orientar você caso haja algum impedimento."
  },
  {
    q: "O que é o RA?",
    a: "O RA (Registro do Aluno) é seu código de identificação no Ismart. Você encontra ele no e-mail de boas-vindas do programa ou pode pedir para seu tutor. É o número que você usa para identificar sua turma e tutor aqui no Hub."
  },
  {
    q: "Estou com dificuldades emocionais. Existe apoio?",
    a: "Sim! O Ismart oferece apoio socioemocional. Você pode conversar com seu tutor, que vai te orientar. Também temos acesso à plataforma Formação Ismart com recursos de bem-estar. Não hesite em buscar ajuda — você não está sozinho(a)."
  },
  {
    q: "Como funciona o Bolsa Talento?",
    a: "O Bolsa Talento é uma das trajetórias possíveis dentro do Ismart para alunos do Ensino Médio. Converse com seu tutor para entender melhor as oportunidades disponíveis na sua trajetória atual."
  }
];

// -------------------------------------------------------
//  CONTATOS IMPORTANTES
// -------------------------------------------------------
const CONTATOS = [
  {
    nome: "Suporte Técnico",
    desc: "Problemas com acesso às plataformas",
    icon: "💻",
    cor_bg: "#EBF4FF",
    wpp: "5511990099001",
    msg: "Oi! Preciso de ajuda com um problema técnico: "
  },
  {
    nome: "Apoio Socioemocional",
    desc: "Falar com a psicóloga do programa",
    icon: "💚",
    cor_bg: "#EDFFF6",
    wpp: "5511990099002",
    msg: "Oi! Gostaria de conversar sobre apoio socioemocional."
  },
  {
    nome: "Dúvidas sobre o Programa",
    desc: "Informações gerais sobre o IOL",
    icon: "📋",
    cor_bg: "#FFF9E6",
    wpp: "5511990099003",
    msg: "Oi! Tenho uma dúvida sobre o programa Ismart Online: "
  }
];

// -------------------------------------------------------
//  AVISOS — atualize aqui para mudar os comunicados
// -------------------------------------------------------
const AVISOS = {
  destaque: {
    titulo: "Simulado Nacional — 15 de junho",
    texto: "Confirme sua presença e acesse o material preparatório na plataforma Evolucional.",
    data: "Publicado em 6 mai 2026"
  },
  lista: [
    { tag: "📅 AGENDA",   texto: "Mentoria coletiva de Matemática — quinta-feira, 19h" },
    { tag: "📚 MATERIAL", texto: "Guia de estudos de maio disponível no Drive" },
    { tag: "⚠️ PRAZO",   texto: "Atividades Letrus — prazo: 30 de maio" }
  ]
};

// -------------------------------------------------------
//  ÍNDICE DE BUSCA — termos pesquisáveis
// -------------------------------------------------------
const SEARCH_INDEX = [
  ...PLATAFORMAS.map(p => ({
    cat: "Plataforma",
    texto: p.nome + " " + p.desc,
    acao: () => { trocarAba("plataformas"); }
  })),
  ...FAQ.map(f => ({
    cat: "FAQ",
    texto: f.q,
    acao: () => { trocarAba("faq"); setTimeout(() => { abrirFaq(f.q); }, 300); }
  })),
  ...GUIAS.flatMap(g => g.itens.map(item => ({
    cat: "Guia",
    texto: item.nome + " " + item.desc,
    acao: () => { trocarAba("guias"); }
  }))),
  { cat: "Ação", texto: "falar tutor whatsapp ajuda", acao: () => { abrirWhatsApp(); } },
  { cat: "Seção", texto: "agenda calendario eventos mentorias simulado", acao: () => { trocarAba("agenda"); } }
];
