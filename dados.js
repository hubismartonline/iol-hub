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

// -------------------------------------------------------
//  FAQ
// -------------------------------------------------------
const FAQ = [
  {
    q: "Como acesso a Layers? (8º e 9º EF)",
    a: "Acesse layers.digital e faça login com o e-mail no formato: [ano][RA][nomeultimosobrenome]@aluno.ismart.org.br. A senha foi enviada por e-mail pelo time do Ismart. Dentro da Layers você acessa a Letrus e o Khan Academy pelo menu lateral esquerdo. Não recebeu o e-mail? Fale com seu tutor!"
  },
  {
    q: "Como acesso a Evolucional? (Ensino Médio)",
    a: "Acesse simulados.evolucional.com.br/entrar com o e-mail e senha que você recebeu. Esqueceu a senha? Clique em 'Esqueci minha senha' na tela de login."
  },
  {
    q: "Como acesso o Vai Lá e Faz / LTF? (1º e 2º EM)",
    a: "Acesse app.learntofly.global/login com seu e-mail e senha do programa. Para o 3º EM, o acesso é pelo link bit.ly/SaladeAula3EM26."
  },
  {
    q: "Tenho dúvidas sobre a Letrus. Onde encontro ajuda?",
    a: "Acesse o FAQ da Letrus na aba Guias — lá estão as principais dúvidas respondidas. Se ainda assim não resolver, fale com seu tutor pelo WhatsApp."
  },
  {
    q: "O que fazer se estiver com dificuldade em uma matéria?",
    a: "Você pode: usar o Khan Academy para reforçar conteúdos, assistir às videoaulas disponíveis nas plataformas, participar das formações online e entrar em contato com seu tutor pelo WhatsApp."
  },
  {
    q: "Perdi um prazo. O que fazer?",
    a: "Fale imediatamente com seu tutor pelo WhatsApp explicando o que aconteceu. Quanto antes você comunicar, maiores as chances de encontrar uma solução. Não deixe para depois!"
  },
  {
    q: "Como funciona o programa Ismart Online?",
    a: "O IOL é um programa 100% online de acompanhamento educacional para alunos de escolas públicas com alto potencial. Você tem tutores dedicados, acesso a plataformas de aprendizagem e formações online regulares ao longo do ano."
  },
  {
    q: "Quando acontecem as Formações Online?",
    a: "As Formações Online acontecem mensalmente aos finais de semana. Verifique a aba Agenda para ver as próximas datas. Seu tutor também te avisará com antecedência pelo grupo de recados!"
  },
  {
    q: "Como solicito isenção do Enem, Fuvest ou Unicamp?",
    a: "Fique atento às datas na aba Agenda — os períodos de solicitação são limitados. Se tiver dúvidas sobre o processo, entre em contato com seu tutor ou use o formulário de atendimento."
  },
  {
    q: "O que é o RA?",
    a: "O RA (Registro do Aluno) é seu código de identificação no Ismart. Você encontra ele no e-mail de boas-vindas do programa. É o número que você usa para acessar este Hub."
  },
  {
    q: "Estou com dificuldades emocionais. Existe apoio?",
    a: "Sim! O Ismart oferece apoio socioemocional. Converse com seu tutor, que vai te orientar. Você não está sozinho(a) — estamos aqui para te ajudar!"
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
 
