// =============================================================
//  APP.JS — Hub do Aluno · Ismart Online
// =============================================================

// -------------------------------------------------------
//  CONFIGURAÇÃO
// -------------------------------------------------------
// Planilha 1 — tutores (CSV público)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSKNO5Y95tm1siowcKImRyPmrrzKTOAMFjIPniSNPIp5TFTQ08mcIpKDEIRIpOb4BRGA1gHHWKwYVY/pub?gid=0&single=true&output=csv";

// Planilha de Recados (avisos semanais por série)
const RECADOS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vREl4x9Z31no1XMZ9aonG-ZPMqWUp09HySilUmFJN6vDUQ8r4_5AG-iZW5rMJuhU2W3y9BeCwa2CyVY/pub?gid=0&single=true&output=csv";

// Planilha de Calendário
const CALENDARIO_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vREl4x9Z31no1XMZ9aonG-ZPMqWUp09HySilUmFJN6vDUQ8r4_5AG-iZW5rMJuhU2W3y9BeCwa2CyVY/pub?gid=685280579&single=true&output=csv";

// Planilha 2 — cadastro completo (Apps Script seguro)
const CADASTRO_URL = "https://script.google.com/macros/s/AKfycbxhwZfOXqWgsoxA0G7ZAcGEqgYaPXKAcnjLOg_iZ3STTOkSB5rrtvbKeOq48xSqNr1X/exec";

// Simulador de Vestibular — Apps Script (Guia de Carreiras + SISU)
const SIMULADOR_URL = "https://script.google.com/macros/s/AKfycby2bv-dEQEoz3qtVSNjWY5sPQSTmyJ3L1wQv_ApX5bOzL-pls5UvrhKPHy1X6DQsmg8Dw/exec";

// URL do Apps Script para salvar dados de MOs
const MO_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyQ5cu2VInBwdA8MRYE1dH2WxmGxZH3MfweCa6KVZiGS8Ccf9UK_x2TL61bc2bI8g85pQ/exec";

// URLs das planilhas de Melhores Oportunidades (MOs)
const MO_URLS = {
  SP:        "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0m3gCD1gYND8bEJ5e_AhMubECUyU9uW0u1W-Ak59GxrNDnI7iGJ_wk9tb1EAXOyNZ6AsDIkc44qWN/pub?gid=652524075&single=true&output=csv",
  SJC:       "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0m3gCD1gYND8bEJ5e_AhMubECUyU9uW0u1W-Ak59GxrNDnI7iGJ_wk9tb1EAXOyNZ6AsDIkc44qWN/pub?gid=281322626&single=true&output=csv",
  BH:        "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0m3gCD1gYND8bEJ5e_AhMubECUyU9uW0u1W-Ak59GxrNDnI7iGJ_wk9tb1EAXOyNZ6AsDIkc44qWN/pub?gid=1276152342&single=true&output=csv",
  RJ:        "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0m3gCD1gYND8bEJ5e_AhMubECUyU9uW0u1W-Ak59GxrNDnI7iGJ_wk9tb1EAXOyNZ6AsDIkc44qWN/pub?gid=514789890&single=true&output=csv",
  Pesquisas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0m3gCD1gYND8bEJ5e_AhMubECUyU9uW0u1W-Ak59GxrNDnI7iGJ_wk9tb1EAXOyNZ6AsDIkc44qWN/pub?gid=1425876178&single=true&output=csv",
};

// Cache de dados carregados
let moCache = {};
// Interesses salvos localmente (sessionStorage)
let moInteresses = {};


// -------------------------------------------------------
//  ESTADO GLOBAL
// -------------------------------------------------------
let alunoAtual = null;
let dadosCarregados = {};

// -------------------------------------------------------
//  INICIALIZAÇÃO
// -------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  atualizarSaudacao();

  // Garante que main-content começa oculto até o login
  const main = document.getElementById("main-content");
  if (main) main.style.display = "none";

  const dadosSalvos = sessionStorage.getItem("iol_aluno");
  if (dadosSalvos) {
    try {
      alunoAtual = JSON.parse(dadosSalvos);
      renderizarPerfil(alunoAtual);
      renderizarTudo(alunoAtual);
      carregarCadastro(alunoAtual.RA || alunoAtual.ra);
    } catch(e) { sessionStorage.removeItem("iol_aluno"); }
  } else {
    setTimeout(() => document.getElementById("raInputDesktop")?.focus(), 400);
    setTimeout(() => document.getElementById("raInput")?.focus(), 400);
  }
});

// -------------------------------------------------------
//  SAUDAÇÃO
// -------------------------------------------------------
function atualizarSaudacao() {
  const hora = new Date().getHours();
  let s = "Bom dia! ☀️";
  if (hora >= 12 && hora < 18) s = "Boa tarde! 🌤️";
  if (hora >= 18) s = "Boa noite! 🌙";
  const el = document.getElementById("header-greeting");
  if (el) el.textContent = s;
}

// -------------------------------------------------------
//  BUSCA POR RA
// -------------------------------------------------------
async function buscarRA() {
  const input = document.getElementById("raInput");
  const ra = input?.value.trim();
  const erro = document.getElementById("ra-error");
  if (!ra) { input?.focus(); return; }

  mostrarLoading(true);

  try {
    if (Object.keys(dadosCarregados).length === 0) {
      const response = await fetch(SHEET_URL);
      if (!response.ok) throw new Error("Erro ao carregar planilha");
      const csv = await response.text();
      dadosCarregados = parsearCSV(csv);
    }
    processarBusca(ra, erro);
  } catch(e) {
    if (typeof ALUNOS !== "undefined" && ALUNOS[ra]) {
      sessionStorage.setItem("iol_aluno", JSON.stringify(ALUNOS[ra]));
      identificarAluno(ALUNOS[ra]);
      if (erro) erro.style.display = "none";
    } else {
      showToast("Erro de conexão. Tente novamente.");
      if (erro) { erro.style.display = "block"; erro.textContent = "❌ Erro ao conectar. Tente novamente."; }
    }
  }

  mostrarLoading(false);
}

// -------------------------------------------------------
//  PARSEAR CSV
// -------------------------------------------------------
function parsearCSV(csv) {
  const mapa = {};
  const rows = parseCSVCompleto(csv);
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    if (!cols || cols.length < 5) continue;
    const ra = (cols[0] || "").replace(/"/g, "").trim();
    if (!ra || !/^\d+$/.test(ra)) continue;
    const tutor = (cols[4] || "").replace(/"/g, "").trim();
    mapa[ra] = {
      RA:             ra,
      nome:           (cols[1] || "").replace(/"/g, "").trim(),
      serie:          (cols[2] || "").replace(/"/g, "").trim(),
      cidade:         (cols[3] || "").replace(/"/g, "").trim(),
      tutor:          tutor,
      tutor_wpp:      (cols[5] || "").replace(/"/g, "").trim(),
      tutor_iniciais: iniciais(tutor),
      tutor_msg:      `Oi, ${tutor}! Sou ${(cols[1] || "").replace(/"/g, "").trim()} (${(cols[2] || "").replace(/"/g, "").trim()}). Preciso de ajuda com...`
    };
  }
  return mapa;
}

// Parser CSV completo — lida com células que contêm vírgulas e quebras de linha
function parseCSVCompleto(texto) {
  const rows = [];
  let col = "", row = [], dentroAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    const prox = texto[i + 1];

    if (ch === '"') {
      if (dentroAspas && prox === '"') {
        // Aspas escapadas ("") dentro de célula
        col += '"';
        i++;
      } else {
        dentroAspas = !dentroAspas;
      }
    } else if (ch === ',' && !dentroAspas) {
      row.push(col.trim());
      col = "";
    } else if ((ch === '\n' || (ch === '\r' && prox === '\n')) && !dentroAspas) {
      if (ch === '\r') i++; // pula o \n do \r\n
      row.push(col.trim());
      if (row.some(c => c !== "")) rows.push(row);
      row = [];
      col = "";
    } else if (ch === '\r' && !dentroAspas) {
      // \r sozinho
      row.push(col.trim());
      if (row.some(c => c !== "")) rows.push(row);
      row = [];
      col = "";
    } else {
      col += ch;
    }
  }
  // Última célula/linha
  if (col || row.length) {
    row.push(col.trim());
    if (row.some(c => c !== "")) rows.push(row);
  }
  return rows;
}

// Mantém parsearLinha para compatibilidade com outros usos
function parsearLinha(linha) {
  const r = []; let a = "", d = false;
  for (const c of linha) {
    if (c === '"') d = !d;
    else if (c === ',' && !d) { r.push(a.trim()); a = ""; }
    else a += c;
  }
  r.push(a.trim());
  return r;
}


// Detecta URLs no texto e transforma em links clicáveis
function linkificar(texto) {
  if (!texto) return "";
  return texto.replace(/(https?:\/\/[^\s<]+|bit\.ly\/[^\s<]+|www\.[^\s<]+)/g, url => {
    const href = url.startsWith("http") ? url : "https://" + url;
    return `<a href="${href}" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:underline;word-break:break-all">${url}</a>`;
  });
}

// Converte quebras de linha em <br> e linkifica
function formatarTexto(texto) {
  if (!texto) return "";
  return linkificar(texto).replace(/\n/g, "<br>");
}

function iniciais(nome) {
  const partes = nome.split(" ").filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return nome.slice(0, 2).toUpperCase();
}

// -------------------------------------------------------
//  PROCESSAR BUSCA
// -------------------------------------------------------
function processarBusca(ra, erro) {
  const aluno = dadosCarregados[ra];
  if (aluno) {
    sessionStorage.setItem("iol_aluno", JSON.stringify(aluno));
    identificarAluno(aluno);
    if (erro) erro.style.display = "none";
  } else {
    if (erro) { erro.style.display = "block"; erro.textContent = "❌ RA não encontrado. Verifique e tente novamente."; }
    const input = document.getElementById("raInput");
    if (input) { input.style.borderColor = "var(--pink)"; setTimeout(() => input.style.borderColor = "", 2000); }
  }
}

// -------------------------------------------------------
//  IDENTIFICAR ALUNO
// -------------------------------------------------------
function identificarAluno(aluno) {
  alunoAtual = aluno;
  renderizarPerfil(aluno);
  renderizarTudo(aluno);
  carregarCadastro(aluno.RA || aluno.ra);
  const main = document.getElementById("main-content");
  main.style.cssText = "display:block;opacity:0;transform:translateY(10px);transition:opacity 0.4s,transform 0.4s";
  setTimeout(() => main.style.cssText = "display:block;opacity:1;transform:translateY(0);transition:opacity 0.4s,transform 0.4s", 50);
  mostrarFAB();
  showToast(`Bem-vindo(a), ${aluno.nome.split(" ")[0]}! 🎉`);
}

function renderizarPerfil(aluno) {
  // Mobile
  document.getElementById("ra-header-section").style.display = "none";
  document.getElementById("welcome-screen")?.classList.add("hidden");
  document.getElementById("student-profile").style.display = "block";
  document.getElementById("student-name").textContent = aluno.nome;
  document.getElementById("header-greeting").textContent = saudacao();
  document.getElementById("badge-serie").textContent = `${aluno.serie}${aluno.cidade ? " · " + aluno.cidade : ""}`;
  document.getElementById("main-content").style.display = "block";

  // Desktop sidebar
  const sidebarRa = document.getElementById("sidebar-ra");
  const sidebarPerfil = document.getElementById("sidebar-perfil");
  const sidebarNav = document.getElementById("sidebar-nav");
  if (sidebarRa) sidebarRa.style.display = "none";
  if (sidebarPerfil) {
    sidebarPerfil.style.display = "block";
    document.getElementById("sidebar-saudacao").textContent = saudacao() + " 👋";
    document.getElementById("sidebar-nome").textContent = aluno.nome;
    document.getElementById("sidebar-serie").textContent = `${aluno.serie}${aluno.cidade ? " · " + aluno.cidade : ""}`;
  }
  if (sidebarNav) sidebarNav.style.display = "block";

  // No desktop, move o conteúdo para o desktop-content
  sincronizarDesktop();
}

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia!";
  if (h < 18) return "Boa tarde!";
  return "Boa noite!";
}

function sincronizarDesktop() {
  // Nada a fazer — conteúdo fica direto no main-content
}

async function buscarRADesktop() {
  const input = document.getElementById("raInputDesktop");
  const ra = input?.value?.trim();
  const erro = document.getElementById("ra-error-desktop");
  if (!ra) return;

  // Se a planilha ainda não foi carregada (usuário entrou pelo desktop),
  // faz o fetch agora — mesma lógica do buscarRA() mobile
  if (Object.keys(dadosCarregados).length === 0) {
    mostrarLoading(true);
    try {
      const response = await fetch(SHEET_URL);
      if (!response.ok) throw new Error("Erro ao carregar planilha");
      const csv = await response.text();
      dadosCarregados = parsearCSV(csv);
    } catch(e) {
      mostrarLoading(false);
      if (erro) { erro.style.display = "block"; erro.textContent = "❌ Erro de conexão. Tente novamente."; }
      return;
    }
    mostrarLoading(false);
  }

  const aluno = dadosCarregados[ra];
  if (aluno) {
    if (erro) erro.style.display = "none";
    sessionStorage.setItem("iol_aluno", JSON.stringify(aluno));
    identificarAluno(aluno);
  } else {
    if (erro) { erro.style.display = "block"; erro.textContent = "❌ RA não encontrado. Verifique e tente novamente."; }
    if (input) { input.style.borderColor = "#EE2D67"; setTimeout(() => { input.style.borderColor = ""; }, 2000); }
  }
}

function trocarAba(nomeAba) {
  // Atualiza tabs mobile
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === nomeAba));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.toggle("active", c.id === `tab-${nomeAba}`));
  // Atualiza sidebar desktop
  document.querySelectorAll(".sidebar-nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === nomeAba));
  fecharBusca();
  // Controla banner 9EF — só aparece no Início
  const banner = document.getElementById("banner-9ef");
  if (banner && banner.dataset.serie9ef === "true") {
    banner.style.display = nomeAba === "home" ? "block" : "none";
  }
  // Scroll
  if (window.innerWidth < 768) {
    document.getElementById("tabs-nav")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function renderizarTudo(aluno) {
  renderizarTutor(aluno);
  renderizarBanner9EF(aluno);
  renderizarPlataformas(aluno);
  renderizarGuias(aluno);
  renderizarFAQ();
  renderizarContatos(aluno);
  carregarRecados(aluno.serie);
  carregarCalendario(aluno.serie);
  renderizarNotaAluno(aluno);
  renderizarMOs(aluno);
  inicializarAbasVest(aluno);
  renderizarTutorRodape(aluno);
}

function renderizarTutorRodape(aluno) {
  // Injeta card do tutor no rodapé de todas as abas exceto home
  const abas = ["plataformas","guias","agenda","orientacao","faq","atendimento","perfil"];
  const html = `
    <div class="tutor-rodape-desktop">
      <h2 class="section-title" style="font-size:13px;margin-bottom:10px">💬 Falar com seu tutor</h2>
      <div style="display:flex;align-items:center;gap:12px;background:var(--card);border-radius:10px;padding:12px 16px;box-shadow:var(--shadow)">
        <div class="tutor-avatar" style="width:36px;height:36px;font-size:13px" id="tutor-avatar-rodape">${aluno.tutor_iniciais || iniciais(aluno.tutor || "")}</div>
        <div style="flex:1">
          <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;color:var(--navy)">${aluno.tutor || "Seu tutor"}</div>
          <div style="font-size:11px;color:var(--text2)">${aluno.serie || ""}</div>
        </div>
        <button class="wpp-btn" onclick="abrirWhatsApp()" style="padding:8px 14px;font-size:12px">
          💬 WhatsApp
        </button>
      </div>
    </div>`;

  abas.forEach(aba => {
    const tab = document.getElementById(`tab-${aba}`);
    if (!tab) return;
    let rodape = tab.querySelector(".tutor-rodape-injetado");
    if (!rodape) {
      rodape = document.createElement("div");
      rodape.className = "tutor-rodape-injetado";
      const section = tab.querySelector(".section");
      if (section) section.appendChild(rodape);
    }
    rodape.innerHTML = html;
  });
}

// -------------------------------------------------------
//  CARREGAR CADASTRO COMPLETO (Planilha 2 via Apps Script)
// -------------------------------------------------------
async function carregarCadastro(ra) {
  const container = document.getElementById("perfil-container");
  if (!container) return;

  container.innerHTML = `<div class="perfil-loading">Carregando seus dados... ⏳</div>`;

  try {
    const response = await fetch(`${CADASTRO_URL}?ra=${encodeURIComponent(ra)}`);
    const json = await response.json();

    if (json.erro || !json.dados) {
      container.innerHTML = `<div class="perfil-vazio">Dados cadastrais não encontrados.</div>`;
      return;
    }

    // Salva dados completos no alunoAtual para uso em outras funções
    if (alunoAtual) {
      Object.assign(alunoAtual, json.dados);
      renderizarNotaAluno(alunoAtual);
    }

    renderizarCadastro(json.dados, container);
  } catch(e) {
    container.innerHTML = `<div class="perfil-vazio">Erro ao carregar dados. Tente novamente.</div>`;
  }
}

// -------------------------------------------------------
//  RENDERIZAR PERFIL DO ALUNO
// -------------------------------------------------------
function renderizarCadastro(d, container) {
  const secoes = [
    {
      titulo: "👤 Dados Pessoais",
      campos: [
        { label: "Nome completo", val: d.Nome },
        { label: "RA", val: d.RA },
        { label: "Data de nascimento", val: d.Data_nascimento },
        { label: "Sexo", val: d.Sexo },
        { label: "Identidade de gênero", val: d.Identidade_genero },
        { label: "Raça/Cor", val: d.Raca },
        { label: "Cidade de nascimento", val: d.Cidade_nascimento },
        { label: "Estado de nascimento", val: d.Estado_nascimento },
      ]
    },
    {
      titulo: "📍 Endereço",
      campos: [
        { label: "Cidade", val: d.Cidade_mora },
        { label: "Estado", val: d.Estado_mora },
        { label: "Bairro", val: d.Bairro },
        { label: "Qtd. moradores", val: d.Qtd_moradores },
      ]
    },
    {
      titulo: "📞 Contato",
      campos: [
        { label: "E-mail", val: d.Email },
        { label: "Celular", val: d.Celular },
      ]
    },
    {
      titulo: "🏫 Escola",
      campos: [
        { label: "Série", val: d.Serie },
        { label: "Ano de entrada", val: d.Ano_entrada },
        { label: "Tipo de ensino 2026", val: d.Tipo_ensino_2026 },
        { label: "Escola 2026", val: d.Escola_2026 },
        { label: "Período", val: d.Periodo_2026 },
        { label: "Praça", val: d.Praca },
      ]
    },
    {
      titulo: "💻 Acesso e Equipamentos",
      campos: [
        { label: "Acesso à internet", val: d.Acesso_internet },
        { label: "Como acessa", val: d.Como_acessa },
        { label: "Qualidade da internet", val: d.Qualidade_internet },
        { label: "Equipamentos", val: d.Equipamentos },
        { label: "Câmera", val: d.Camera },
        { label: "Fone de ouvido", val: d.Fone },
      ]
    },
    {
      titulo: "♿ Saúde e Acessibilidade",
      campos: [
        { label: "PCD", val: d.PCD },
        { label: "Tipo de deficiência", val: d.PCD_tipo },
        { label: "Adaptações necessárias", val: d.PCD_adaptacoes },
        { label: "Acompanhamento de saúde", val: d.Acomp_saude },
        { label: "Neurodivergência", val: d.Neurodivergencia },
        { label: "Diagnóstico", val: d.Neuro_diagnostico },
        { label: "Outras condições de saúde", val: d.Outras_saude },
      ]
    },
    {
      titulo: "🏆 Olimpíadas e Extracurriculares",
      campos: [
        { label: "Olimpíada 1", val: d.Olimp1 },
        { label: "Resultado", val: d.Olimp1_result },
        { label: "Olimpíada 2", val: d.Olimp2 },
        { label: "Resultado", val: d.Olimp2_result },
        { label: "Olimpíada 3", val: d.Olimp3 },
        { label: "Resultado", val: d.Olimp3_result },
        { label: "Outras olimpíadas", val: d.Outras_olimp },
        { label: "Grupo olímpico", val: d.Grupo_olimpico },
        { label: "Extracurriculares", val: d.Extracurriculares },
        { label: "Detalhes", val: d.Detalhe_extracurr },
      ]
    },
    {
      titulo: "🌍 Idiomas",
      campos: [
        { label: "Inglês", val: d.Ingles },
        { label: "Listening", val: d.Listening },
        { label: "Speaking", val: d.Speaking },
        { label: "Reading", val: d.Reading },
        { label: "Writing", val: d.Writing },
        { label: "Outro idioma", val: d.Outro_idioma },
      ]
    },
    {
      titulo: "🎯 Objetivos e Sonhos",
      campos: [
        { label: "Sonho de faculdade", val: d.Sonho_faculdade },
        { label: "Objetivo no Ismart", val: d.Objetivo_Ismart },
        { label: "Explicação", val: d.Explicacao_objetivo },
        { label: "Curso técnico", val: d.Curso_tecnico },
        { label: "Qual técnico", val: d.Qual_tecnico },
      ]
    },
    {
      titulo: "👨‍👩‍👧 Responsável 1",
      campos: [
        { label: "Nome", val: d.Resp1_nome },
        { label: "Parentesco", val: d.Resp1_parentesco },
        { label: "Celular", val: d.Resp1_cel },
        { label: "E-mail", val: d.Resp1_email },
        { label: "Profissão", val: d.Resp1_profissao },
        { label: "Mora com o aluno?", val: d.Resp1_mora_aluno },
      ]
    },
    {
      titulo: "👨‍👩‍👧 Responsável 2",
      campos: [
        { label: "Nome", val: d.Resp2_nome },
        { label: "Parentesco", val: d.Resp2_parentesco },
        { label: "Celular", val: d.Resp2_cel },
        { label: "E-mail", val: d.Resp2_email },
        { label: "Profissão", val: d.Resp2_profissao },
        { label: "Mora com o aluno?", val: d.Resp2_mora_aluno },
      ]
    },
    {
      titulo: "🚨 Contatos de Emergência",
      campos: [
        { label: "Emergência 1 — Nome", val: d.Emerg1_nome },
        { label: "Emergência 1 — Celular", val: d.Emerg1_cel },
        { label: "Emergência 1 — Relação", val: d.Emerg1_relacao },
        { label: "Emergência 2 — Nome", val: d.Emerg2_nome },
        { label: "Emergência 2 — Celular", val: d.Emerg2_cel },
        { label: "Emergência 2 — Relação", val: d.Emerg2_relacao },
      ]
    }
  ];

  container.innerHTML = `
    <div class="perfil-aviso">
      <span>🔒</span>
      <p>Seus dados estão protegidos. Para corrigir alguma informação, use o <strong>formulário de atendimento</strong>.</p>
    </div>
    <div class="perfil-ultima">Última atualização: ${d.Ultima_atualizacao || "—"}</div>
    ${secoes.map(sec => {
      const camposValidos = sec.campos.filter(c => c.val && c.val !== "");
      if (!camposValidos.length) return "";
      return `
        <div class="perfil-secao">
          <div class="perfil-secao-titulo">${sec.titulo}</div>
          <div class="perfil-campos">
            ${camposValidos.map(c => `
              <div class="perfil-campo">
                <span class="perfil-label">${c.label}</span>
                <span class="perfil-valor">${c.val}</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }).join("")}
  `;
}

// -------------------------------------------------------
//  SAIR
// -------------------------------------------------------
function sair() {
  sessionStorage.removeItem("iol_aluno");
  alunoAtual = null;
  document.getElementById("student-profile").style.display = "none";
  document.getElementById("ra-header-section").style.display = "block";
  document.getElementById("main-content").style.display = "none";
  document.getElementById("welcome-screen")?.classList.remove("hidden");
  document.getElementById("raInput").value = "";
  document.getElementById("ra-error").style.display = "none";
  trocarAba("home");
  esconderFAB();
  showToast("Até logo! 👋");
}


// -------------------------------------------------------
//  BANNER ESPECIAL 9º EF
// -------------------------------------------------------
function renderizarBanner9EF(aluno) {
  const container = document.getElementById("banner-9ef");
  if (!container) return;
  const serie = normalizarSerie(aluno.serie);
  // Só mostra na aba home e só para 9EF
  const abaAtiva = document.querySelector(".tab-content.active")?.id;
  if (serie === "9EF" && (!abaAtiva || abaAtiva === "tab-home")) {
    container.style.display = "block";
    container.dataset.serie9ef = "true";
  } else {
    container.style.display = "none";
  }
}

// -------------------------------------------------------
//  WHATSAPP
// -------------------------------------------------------
function abrirWhatsApp() {
  if (!alunoAtual) { showToast("Identifique-se com seu RA primeiro."); return; }
  const msg = encodeURIComponent(alunoAtual.tutor_msg);
  window.open(`https://wa.me/${alunoAtual.tutor_wpp}?text=${msg}`, "_blank", "noopener");
}

function abrirWhatsAppContato(wpp, msg) {
  window.open(`https://wa.me/${wpp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
}

// -------------------------------------------------------
//  NAVEGAÇÃO — trocarAba definida acima (linha ~275) com sync completo
// -------------------------------------------------------

// -------------------------------------------------------
//  RENDERIZAÇÕES
// -------------------------------------------------------
async function carregarRecados(serie) {
  try {
    const response = await fetch(RECADOS_URL);
    const csv = await response.text();
    const rows = parseCSVCompleto(csv);
    const sNorm = normalizarSerie(serie);
    const recados = [];

    // Pula cabeçalho (linha 0)
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      if (cols.length < 2) continue;
      const seriePlanilha = (cols[0] || "").replace(/"/g,"").trim();

      const paraEstaSerie =
        seriePlanilha.toLowerCase() === "todos" ||
        normalizarSerie(seriePlanilha) === sNorm ||
        (seriePlanilha.toUpperCase() === "EF" && ["8EF","9EF"].includes(sNorm)) ||
        (seriePlanilha.toUpperCase() === "EM" && ["1EM","2EM","3EM"].includes(sNorm));

      if (paraEstaSerie) {
        // serie | titulo | texto | banner | imagem | texto_final | data | tag1 | item1 | tag2 | item2 | tag3 | item3
        recados.push({
          titulo:      (cols[1]  || "").replace(/"/g,"").trim(),
          texto:       (cols[2]  || "").replace(/"/g,"").trim(),
          banner:      (cols[3]  || "").replace(/"/g,"").trim(),
          imagem:      (cols[4]  || "").replace(/"/g,"").trim(),
          texto_final: (cols[5]  || "").replace(/"/g,"").trim(),
          data:        (cols[6]  || "").replace(/"/g,"").trim(),
          tag1:        (cols[7]  || "").replace(/"/g,"").trim(),
          item1:       (cols[8]  || "").replace(/"/g,"").trim(),
          tag2:        (cols[9]  || "").replace(/"/g,"").trim(),
          item2:       (cols[10] || "").replace(/"/g,"").trim(),
          tag3:        (cols[11] || "").replace(/"/g,"").trim(),
          item3:       (cols[12] || "").replace(/"/g,"").trim(),
        });
      }
    }

    if (recados.length > 0) {
      renderizarAvisos(recados[0], recados.slice(1));
    }
  } catch(e) {
    console.log("Usando avisos locais:", e);
    renderizarAvisos(AVISOS.destaque, []);
  }
}

function driveUrl(id) {
  if (!id) return "";
  if (id.startsWith("http")) return id;
  // Formato mais confiável para embed em sites externos
  return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
}

function renderizarAvisos(destaque, extras) {
  if (!destaque) return;

  const container = document.getElementById("aviso-destaque-wrap");
  if (!container) return;

  const bannerUrl = driveUrl(destaque.banner);
  const imagemUrl = driveUrl(destaque.imagem);

  // Monta tags
  const tags = [
    destaque.tag1 ? `<span class="aviso-tag">${destaque.tag1}</span>` : "",
    destaque.tag2 ? `<span class="aviso-tag aviso-tag-2">${destaque.tag2}</span>` : "",
    destaque.tag3 ? `<span class="aviso-tag aviso-tag-3">${destaque.tag3}</span>` : "",
  ].filter(Boolean).join("");

  // Monta itens extras
  const itens = [
    destaque.item1 ? `<div class="aviso-item-detalhe">${linkificar(destaque.item1)}</div>` : "",
    destaque.item2 ? `<div class="aviso-item-detalhe">${linkificar(destaque.item2)}</div>` : "",
    destaque.item3 ? `<div class="aviso-item-detalhe">${linkificar(destaque.item3)}</div>` : "",
  ].filter(Boolean).join("");

  container.innerHTML = `
    <div class="recado-card">

      <!-- 1. Banner temático -->
      <div class="recado-banner">
        ${bannerUrl
          ? `<img src="${bannerUrl}" alt="banner" class="recado-banner-img"
               onerror="this.parentNode.classList.add('recado-banner-fallback');this.remove()">`
          : `<div class="recado-banner-fallback"><div class="recado-banner-logo">Ismart Online</div></div>`
        }
        ${destaque.data ? `<span class="recado-data-badge">${destaque.data}</span>` : ""}
      </div>

      <!-- 2. Texto principal -->
      <div class="recado-corpo">
        <div class="recado-titulo">${destaque.titulo}</div>
        <div class="recado-texto">${linkificar(destaque.texto)}</div>
      </div>

      <!-- 3. Foto do evento -->
      ${imagemUrl ? `
      <div class="recado-foto-wrap">
        <img src="${imagemUrl}" alt="imagem do recado" class="recado-foto"
          onerror="this.parentNode.style.display='none'">
      </div>` : ""}

      <!-- 4. Texto de encerramento + tags -->
      <div class="recado-rodape">
        ${destaque.texto_final
          ? `<div class="recado-texto-final">${formatarTexto(destaque.texto_final)}</div>`
          : ""}
        ${tags ? `<div class="recado-tags">${tags}</div>` : ""}
      </div>

    </div>

    <!-- Lembretes (item1, item2, item3 do recado principal) -->
    ${itens ? `
    <div class="recados-extras">
      <div class="recados-extras-titulo">
        <span class="recados-extras-linha"></span>
        <span class="recados-extras-label">Lembretes</span>
        <span class="recados-extras-linha"></span>
      </div>
      <div class="recado-itens-bloco">${itens}</div>
    </div>` : ""}

    <!-- Recados secundários (outras linhas da planilha) -->
    ${extras && extras.length ? `
    <div class="recados-extras">
      <div class="recados-extras-titulo">
        <span class="recados-extras-linha"></span>
        <span class="recados-extras-label">Outros recados</span>
        <span class="recados-extras-linha"></span>
      </div>
      ${extras.map(r => `
        <div class="recado-extra-item">
          ${r.banner ? `<img src="${driveUrl(r.banner)}" class="recado-extra-banner"
            onerror="this.style.display='none'" alt="">` : ""}
          <div class="recado-extra-corpo">
            <div class="recado-extra-titulo">${r.titulo}</div>
            ${r.texto ? `<div class="recado-extra-texto">${r.texto}</div>` : ""}
            ${r.tag1 ? `<span class="aviso-tag" style="font-size:10px">${r.tag1}</span>` : ""}
          </div>
        </div>`).join("")}
    </div>` : ""}
  `;
}



function renderizarTutor(aluno) {
  const avatar = document.getElementById("tutor-avatar");
  const nome   = document.getElementById("tutor-name");
  const turma  = document.getElementById("tutor-turma");
  if (avatar) avatar.textContent = aluno.tutor_iniciais || iniciais(aluno.tutor || "");
  if (nome)   nome.textContent   = aluno.tutor;
  if (turma)  turma.textContent  = aluno.serie;
}

// Normaliza série: "9º EF" ou "9EF" ou "9ºEF" → "9EF"
function normalizarSerie(s) {
  return (s || "").replace(/[°º ]/g, "").toUpperCase().trim();
}

function renderizarPlataformas(aluno) {
  const sNorm = normalizarSerie(aluno.serie);
  const filtradas = PLATAFORMAS.filter(p => p.series.some(s => normalizarSerie(s) === sNorm));

  const gridHome = document.getElementById("platforms-home");
  if (gridHome) gridHome.innerHTML = filtradas.slice(0, 4).map(p => `
    <a class="platform-card" href="${p.url}" target="_blank" rel="noopener">
      <div class="platform-icon" style="background:${p.cor_bg}">${p.icon}</div>
      <div class="platform-name">${p.nome}</div>
      <div class="platform-desc">${p.desc}</div>
    </a>`).join("") || `<p style="color:var(--text2);font-size:13px;padding:8px 0;grid-column:1/-1">Nenhuma plataforma encontrada para "${aluno.serie}".</p>`;

  const full = document.getElementById("platforms-full");
  if (full) full.innerHTML = filtradas.map(p => `
    <a class="platform-card-full" href="${p.url}" target="_blank" rel="noopener">
      <div class="platform-icon" style="background:${p.cor_bg}">${p.icon}</div>
      <div class="platform-info">
        <div class="platform-name">${p.nome}</div>
        <div class="platform-desc">${p.desc}</div>
      </div>
      <span class="platform-arrow">›</span>
    </a>`).join("") || `<p style="color:var(--text2);font-size:13px;padding:8px 0">Nenhuma plataforma encontrada para "${aluno.serie}".</p>`;
}

function renderizarGuias(aluno) {
  const container = document.getElementById("guias-lista");
  if (!container) return;
  const sNorm = normalizarSerie(aluno.serie);
  container.innerHTML = GUIAS.map(grupo => {
    const itens = grupo.itens.filter(i => i.series.some(s => normalizarSerie(s) === sNorm));
    if (!itens.length) return "";
    return `<div class="guias-group">
      <div class="guias-group-title">${grupo.grupo}</div>
      ${itens.map(item => `
        <a class="guia-item" href="${item.url}" target="_blank" rel="noopener">
          <div class="guia-icon" style="background:${item.cor_bg}">${item.icon}</div>
          <div class="guia-info">
            <div class="guia-name">${item.nome}</div>
            <div class="guia-desc">${item.desc}</div>
          </div>
          <span style="color:var(--text3);font-size:18px">›</span>
        </a>`).join("")}
    </div>`;
  }).join("") || `<p style="color:var(--text2);font-size:13px;padding:8px 0">Nenhum guia encontrado.</p>`;
}

async function carregarCalendario(serie) {
  const container = document.getElementById("agenda-lista");
  if (!container) return;

  try {
    const response = await fetch(CALENDARIO_URL);
    const csv = await response.text();
    const rows = parseCSVCompleto(csv);
    const sNorm = normalizarSerie(serie);
    const eventos = [];

    // Estrutura real da planilha:
    // cols[0]=dia | cols[1]=mes | cols[2]=titulo | cols[3]=subtitulo
    // cols[4]=tipo | cols[5]=tipo_label | cols[6]=serie

    const VESTIBULARES_LABELS = ["vestibular","vestibulinho","enem","enem treineiro"];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      if (!cols || cols.length < 3) continue;

      const dia        = (cols[0] || "").replace(/"/g,"").trim();
      const mes        = (cols[1] || "").replace(/"/g,"").trim().toUpperCase();
      const titulo     = (cols[2] || "").replace(/"/g,"").trim();
      const subtitulo  = (cols[3] || "").replace(/"/g,"").trim();
      const tipo       = (cols[4] || "").replace(/"/g,"").trim().toLowerCase();
      const tipo_label = (cols[5] || "").replace(/"/g,"").trim();
      const serieCol   = (cols[6] || "").replace(/"/g,"").trim().toLowerCase();

      if (!titulo && !dia) continue;

      // Classifica como vestibular pelo tipo_label
      const tipoLabelNorm = tipo_label.toLowerCase();
      const isVestibulinho = tipoLabelNorm === "vestibulinho";
      const isVestibularEM = ["vestibular","enem","enem treineiro"].includes(tipoLabelNorm);
      const isVestibular   = isVestibulinho || isVestibularEM;

      // Restrição por série para vestibulares:
      // Vestibulinho → só 9EF
      // Vestibular/ENEM/ENEM Treineiro → só EM
      if (isVestibulinho && sNorm !== "9EF") continue;
      if (isVestibularEM && !["1EM","2EM","3EM"].includes(sNorm)) continue;

      const paraEstaSerie =
        serieCol === "todos" ||
        normalizarSerie(serieCol) === sNorm ||
        (serieCol === "ef" && ["8EF","9EF"].includes(sNorm)) ||
        (serieCol === "em" && ["1EM","2EM","3EM"].includes(sNorm));

      if (!paraEstaSerie) continue;

      // Monta dataISO para ordenação
      const mesesNum = {JAN:"01",FEV:"02",MAR:"03",ABR:"04",MAI:"05",JUN:"06",JUL:"07",AGO:"08",SET:"09",OUT:"10",NOV:"11",DEZ:"12"};
      const mesNum = mesesNum[mes] || "01";
      const diaNum = (dia||"01").toString().padStart(2,"0");
      const dataISO = `2026-${mesNum}-${diaNum}`;

      eventos.push({
        serie:   serieCol,
        titulo,
        texto:   subtitulo,
        dia:     diaNum,
        mes,
        dataISO,
        tag1:    tipo_label,
        item1:   "",
        tag2:    "",
        item2:   "",
        tag3:    "",
        item3:   "",
        tipo:    isVestibular ? "vestibular" : "iol",
      });
    }

    eventos.sort((a, b) => {
      if (!a.dataISO) return 1;
      if (!b.dataISO) return -1;
      return a.dataISO.localeCompare(b.dataISO);
    });


    window._agendaEventos = eventos;
    window._agendaSerie   = serie;
    renderizarAgenda(eventos, "todos");
    verificarLembretesVestibular(eventos);
    renderizarLembretesOrientacao();

  } catch(e) {
    console.log("Usando agenda local:", e);
    window._agendaEventos = [];
    renderizarAgendaFallback();
  }
}

function parsearData(dataStr) {
  // Aceita DD/MM/YYYY ou DD/MM/YY ou só mês/ano
  if (!dataStr) return { dia: "—", mes: "—", dataISO: "" };
  const partes = dataStr.split("/");
  if (partes.length >= 3) {
    const dia = partes[0].padStart(2, "0");
    const mes = partes[1].padStart(2, "0");
    const ano = partes[2].length === 2 ? "20" + partes[2] : partes[2];
    const meses = ["","JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
    return {
      dia,
      mes: meses[parseInt(mes)] || mes,
      dataISO: `${ano}-${mes}-${dia}`
    };
  }
  return { dia: "—", mes: dataStr, dataISO: "" };
}

function filtrarAgenda(filtro) {
  document.querySelectorAll(".agenda-filtro-btn").forEach(btn => {
    btn.classList.toggle("ativo", btn.dataset.filtro === filtro);
  });
  const eventos = window._agendaEventos || [];
  renderizarAgenda(eventos, filtro);
}

function renderizarAgenda(eventos, filtro) {
  const container = document.getElementById("agenda-lista");
  if (!container) return;

  // Renderiza filtros acima do container se ainda não existem
  let filtrosEl = document.getElementById("agenda-filtros");
  if (!filtrosEl) {
    filtrosEl = document.createElement("div");
    filtrosEl.id = "agenda-filtros";
    filtrosEl.style.cssText = "display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap";
    filtrosEl.innerHTML = `
      <button class="agenda-filtro-btn ativo" data-filtro="todos"
        onclick="filtrarAgenda('todos')" style="${estiloFiltro(true)}">Todos</button>
      <button class="agenda-filtro-btn" data-filtro="iol"
        onclick="filtrarAgenda('iol')" style="${estiloFiltro(false)}">📚 IOL</button>
      <button class="agenda-filtro-btn" data-filtro="vestibular"
        onclick="filtrarAgenda('vestibular')" style="${estiloFiltro(false)}">🎓 Vestibulares</button>
    `;
    container.parentNode.insertBefore(filtrosEl, container);
  }

  // Atualiza estilo dos botões
  filtrosEl.querySelectorAll(".agenda-filtro-btn").forEach(btn => {
    const ativo = btn.dataset.filtro === (filtro || "todos");
    btn.style.cssText = estiloFiltro(ativo);
    btn.dataset.filtro = btn.dataset.filtro; // preserva
  });

  const lista = filtro === "todos" ? eventos : eventos.filter(ev => ev.tipo === filtro);

  if (!lista.length) {
    container.innerHTML = `<p style="color:var(--text2);font-size:13px;padding:16px 0;text-align:center">Nenhum evento encontrado.</p>`;
    return;
  }

  container.innerHTML = lista.map(ev => {
    const isVest = ev.tipo === "vestibular";
    const tags = [
      ev.tag1 ? `<span class="agenda-tipo tipo-${isVest ? "vestibular" : "prazo"}">${ev.tag1}</span>` : "",
      ev.tag2 ? `<span class="agenda-tipo tipo-info">${ev.tag2}</span>` : "",
      ev.tag3 ? `<span class="agenda-tipo tipo-mentoria">${ev.tag3}</span>` : "",
    ].filter(Boolean).join("");

    const itens = [ev.item1, ev.item2, ev.item3].filter(Boolean);
    const itensHtml = itens.length
      ? `<div style="font-size:11px;color:var(--text2);margin-top:4px">${itens.map(i => linkificar(i)).join(" · ")}</div>`
      : "";

    return `
      <div class="agenda-item${isVest ? " agenda-item-vestibular" : ""}">
        <div class="agenda-date">
          <span class="agenda-day">${ev.dia}</span>
          <span class="agenda-month">${ev.mes}</span>
        </div>
        <div class="agenda-info">
          <div class="agenda-titulo">${ev.titulo}</div>
          ${ev.texto ? `<div class="agenda-subtitulo">${linkificar(ev.texto)}</div>` : ""}
          ${itensHtml}
          <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:4px">${tags}</div>
        </div>
      </div>`;
  }).join("");
}

function estiloFiltro(ativo) {
  return ativo
    ? "padding:6px 14px;border-radius:20px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:12px;font-family:Montserrat,sans-serif;font-weight:700;cursor:pointer"
    : "padding:6px 14px;border-radius:20px;border:1.5px solid var(--border);background:var(--bg);color:var(--text1);font-size:12px;font-family:Montserrat,sans-serif;font-weight:700;cursor:pointer";
}

function renderizarAgendaFallback() {
  // Converte AGENDA estática para o novo formato e renderiza
  const eventos = AGENDA.map(ev => ({
    tipo: "iol", titulo: ev.titulo, texto: ev.subtitulo,
    dia: ev.dia, mes: ev.mes, dataISO: "",
    tag1: ev.tipo_label, item1: "", item2: "", item3: "",
  }));
  window._agendaEventos = eventos;
  renderizarAgenda(eventos, "todos");
}

// Verifica se há inscrição de vestibular nos próximos 30 dias
function verificarLembretesVestibular(eventos) {
  const hoje = new Date();
  const em30dias = new Date();
  em30dias.setDate(hoje.getDate() + 30);

  const proximos = eventos.filter(ev => {
    if (ev.tipo !== "vestibular" || !ev.dataISO) return false;
    const data = new Date(ev.dataISO);
    return data >= hoje && data <= em30dias;
  });

  const container = document.getElementById("sim-lembrete-vest");
  if (!container) return;

  if (proximos.length > 0) {
    const ev = proximos[0];
    container.style.display = "block";
    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;cursor:pointer"
           onclick="trocarAba('agenda');setTimeout(()=>filtrarAgenda('vestibular'),300)">
        <span style="font-size:18px">📅</span>
        <div>
          <div style="font-size:12px;font-weight:700;color:#fff;font-family:Montserrat,sans-serif">
            ${ev.titulo} — ${ev.dia}/${ev.mes}
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:1px">
            Toque para ver todas as datas →
          </div>
        </div>
      </div>
    `;
  } else {
    container.style.display = "none";
  }
}



function renderizarFAQ() {
  const container = document.getElementById("faq-lista");
  if (!container) return;
  container.innerHTML = FAQ.map((item, i) => `
    <div class="faq-item" id="faq-${i}">
      <div class="faq-q" onclick="toggleFaq(${i})">
        <span>${item.q}</span>
        <span class="faq-chevron">›</span>
      </div>
      <div class="faq-a">${item.a}</div>
    </div>`).join("");
}

function toggleFaq(i) { document.getElementById(`faq-${i}`)?.classList.toggle("open"); }

function renderizarContatos(aluno) {
  const container = document.getElementById("contatos-lista");
  if (!container) return;

  const cardTutor = aluno ? `
    <div class="contato-item" onclick="abrirWhatsApp()">
      <div class="contato-icon" style="background:rgba(0,189,242,0.15);font-family:Montserrat,sans-serif;font-weight:800;font-size:13px;color:var(--navy)">
        ${aluno.tutor_iniciais || (aluno.tutor||"").split(" ").filter(Boolean).slice(0,2).map(p=>p[0]).join("").toUpperCase()}
      </div>
      <div class="contato-info">
        <div class="contato-nome">${aluno.tutor}</div>
        <div class="contato-desc">Seu(a) tutor(a) — falar pelo WhatsApp</div>
      </div>
      <span class="contato-action">💬</span>
    </div>` : "";

  const cardsFixos = CONTATOS.map(c => {
    const onclick = c.tipo === "link"
      ? `window.open('${c.url}','_blank','noopener')`
      : `abrirWhatsAppContato('${c.wpp}','${(c.msg||"").replace(/'/g,"\\'")}')`;
    return `
      <div class="contato-item" onclick="${onclick}">
        <div class="contato-icon" style="background:${c.cor_bg}">${c.icon}</div>
        <div class="contato-info">
          <div class="contato-nome">${c.nome}</div>
          <div class="contato-desc">${c.desc}</div>
        </div>
        <span class="contato-action">${c.tipo === "link" ? "↗️" : "💬"}</span>
      </div>`;
  }).join("");

  container.innerHTML = cardTutor + cardsFixos;
}

// -------------------------------------------------------
//  BUSCA GLOBAL
// -------------------------------------------------------
function filtrarConteudo(query) {
  const resultsEl = document.getElementById("search-results");
  if (!resultsEl) return;
  if (!query || query.length < 2) { resultsEl.style.display = "none"; return; }
  const q = query.toLowerCase();
  const matches = SEARCH_INDEX.filter(i => i.texto.toLowerCase().includes(q)).slice(0, 6);
  resultsEl.innerHTML = matches.length
    ? matches.map((m, i) => `
        <div class="search-result-item" onclick="executarBusca(${i})">
          <div class="search-result-cat">${m.cat}</div>
          <div class="search-result-text">${destacar(m.texto, q)}</div>
        </div>`).join("")
    : `<div class="search-result-item"><div class="search-result-text" style="color:var(--text2)">Nenhum resultado encontrado.</div></div>`;
  window._searchMatches = matches;
  resultsEl.style.display = "block";
}

function executarBusca(i) {
  const m = window._searchMatches?.[i];
  if (m?.acao) { m.acao(); fecharBusca(); document.getElementById("searchInput").value = ""; }
}

function fecharBusca() { document.getElementById("search-results") && (document.getElementById("search-results").style.display = "none"); }
function destacar(texto, q) { return texto.replace(new RegExp(`(${q})`, "gi"), "<strong>$1</strong>").slice(0, 80); }
document.addEventListener("click", e => { if (!e.target.closest(".search-section")) fecharBusca(); });

// -------------------------------------------------------
//  TOAST + LOADING
// -------------------------------------------------------
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}

function mostrarLoading(show) {
  const el = document.getElementById("loading-overlay");
  if (el) el.style.display = show ? "flex" : "none";
}

document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.activeElement.id === "raInput") buscarRA();
});

// =============================================================
//  NOTA DO ALUNO + CALENDÁRIO DE VESTIBULARES
// =============================================================

function normalizarSerie(s) {
  if (!s) return "";
  return s.toString().toUpperCase()
    .replace(/[ºª°\s]/g, "")
    .replace(/OITAVO|8EF|8°EF/, "8EF")
    .replace(/NONO|9EF|9°EF/, "9EF")
    .replace(/PRIMEIRO|1EM|1°EM/, "1EM")
    .replace(/SEGUNDO|2EM|2°EM/, "2EM")
    .replace(/TERCEIRO|3EM|3°EM/, "3EM");
}

function renderizarNotaAluno(aluno) {
  const container = document.getElementById("orient-nota-aluno");
  if (!container) return;

  const serie = normalizarSerie(aluno.serie);
  const notaAluno = parseFloat(aluno.Media_ENEM_Projetado || aluno.media_enem_projetado || "0");
  const mediaSerieVal = MEDIAS_ENEM_SERIE[serie] || null;

  // Só mostra para EM
  const ehEM = ["1EM","2EM","3EM"].includes(serie);
  if (!ehEM) {
    container.style.display = "none";
    return;
  }

  // Sem nota ainda — mostra skeleton enquanto carrega
  if (!notaAluno) {
    container.style.display = "block";
    if (!container.querySelector(".skeleton-nota")) {
      container.innerHTML = `
        <div class="skeleton-nota">
          <div class="skeleton-linha" style="width:60%;height:18px;margin-bottom:10px"></div>
          <div class="skeleton-linha" style="width:40%;height:14px;margin-bottom:14px"></div>
          <div class="skeleton-linha" style="width:100%;height:8px;margin-bottom:6px"></div>
          <div class="skeleton-linha" style="width:100%;height:8px"></div>
        </div>`;
    }
    return;
  }

  const diff = mediaSerieVal ? (notaAluno - mediaSerieVal) : null;
  const diffLabel = diff !== null
    ? (diff >= 0
        ? `<span style="color:#27AE60;font-weight:700">+${diff.toFixed(0)} pts acima da média</span>`
        : `<span style="color:#E67E22;font-weight:700">${diff.toFixed(0)} pts abaixo da média</span>`)
    : "";

  const barraAluno = Math.min(100, Math.max(0, (notaAluno / 1000) * 100));
  const barraMedia = mediaSerieVal ? Math.min(100, Math.max(0, (mediaSerieVal / 1000) * 100)) : null;

  container.style.display = "block";
  container.innerHTML = `
    <div style="background:#EBF4FF;border-radius:12px;padding:20px;margin-bottom:14px;border-left:4px solid #008ED4">
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px">
        <span style="font-size:26px">📊</span>
        <div>
          <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:15px;color:#002561">
            Seu ENEM Projetado
          </div>
          <div style="font-size:12px;color:#666;margin-top:2px">
            Baseado na sua Prova Única mais recente
          </div>
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:13px;color:#002561;font-weight:700;font-family:Montserrat,sans-serif">
          Sua nota: <span style="font-size:22px;color:#008ED4">${notaAluno.toFixed(0)}</span>
        </span>
        ${mediaSerieVal ? `<span style="font-size:12px;color:#666">Média ${serie}: <strong>${mediaSerieVal}</strong></span>` : ""}
      </div>

      <div style="background:#fff;border-radius:8px;padding:10px 12px;margin-top:4px">
        <div style="font-size:11px;color:#888;margin-bottom:8px;font-weight:700;text-transform:uppercase;letter-spacing:.4px">Comparativo</div>
        <div style="margin-bottom:6px">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#666;margin-bottom:3px">
            <span>Sua nota</span><span>${notaAluno.toFixed(0)}</span>
          </div>
          <div style="height:8px;background:#E8F0FE;border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${barraAluno}%;background:#008ED4;border-radius:4px;transition:width 1s"></div>
          </div>
        </div>
        ${barraMedia !== null ? `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#666;margin-bottom:3px">
            <span>Média ${serie}</span><span>${mediaSerieVal}</span>
          </div>
          <div style="height:8px;background:#E8F0FE;border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${barraMedia}%;background:#AECEF5;border-radius:4px;transition:width 1s"></div>
          </div>
        </div>` : ""}
      </div>

      ${diff !== null ? `
      <div style="margin-top:12px;text-align:center;font-size:13px;color:#444">
        ${diffLabel} da sua série no IOL
      </div>` : ""}

      <div style="margin-top:12px;background:#fff;border-radius:8px;padding:10px 12px;font-size:12px;color:#555;border-left:3px solid #00BDF2">
        💡 Use essa nota no simulador de estratégia para ver suas chances nas universidades recomendadas pelo Ismart.
      </div>
    </div>
  `;
}

function renderizarLembretesOrientacao() {
  const container = document.getElementById("orient-lembretes-vest");
  if (!container) return;

  const eventos = window._agendaEventos || [];
  const hoje = new Date();
  const em60dias = new Date();
  em60dias.setDate(hoje.getDate() + 60);

  // Filtra eventos de vestibular nos próximos 60 dias
  const proximos = eventos
    .filter(ev => ev.tipo === "vestibular" && ev.dataISO)
    .filter(ev => {
      const data = new Date(ev.dataISO);
      return data >= hoje && data <= em60dias;
    })
    .slice(0, 3);

  if (!proximos.length) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  container.innerHTML = `
    <div style="background:#FDF2F8;border-radius:12px;padding:16px;border-left:4px solid #EE2D67">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <span style="font-size:22px">⏰</span>
        <div>
          <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:14px;color:#002561">
            Prazos chegando!
          </div>
          <div style="font-size:12px;color:#666;margin-top:2px">
            Fique de olho nas datas importantes
          </div>
        </div>
      </div>
      ${proximos.map(ev => `
        <div style="background:#fff;border-radius:8px;padding:10px 12px;margin-bottom:8px;
                    display:flex;align-items:center;justify-content:space-between;gap:10px;
                    cursor:pointer;border:1px solid #f0d0e0"
             onclick="trocarAba('agenda');setTimeout(()=>filtrarAgenda('vestibular'),300)">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="background:#EE2D67;color:#fff;border-radius:8px;
                        padding:4px 8px;text-align:center;min-width:40px;flex-shrink:0">
              <div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:14px;line-height:1">${ev.dia}</div>
              <div style="font-size:9px;opacity:0.85">${ev.mes}</div>
            </div>
            <div>
              <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;color:#002561">
                ${ev.titulo}
              </div>
              ${ev.texto ? `<div style="font-size:11px;color:#666;margin-top:2px">${ev.texto}</div>` : ""}
            </div>
          </div>
          <span style="color:#EE2D67;font-size:16px;flex-shrink:0">›</span>
        </div>`).join("")}
      <div style="text-align:center;margin-top:4px">
        <button onclick="trocarAba('agenda');setTimeout(()=>filtrarAgenda('vestibular'),300)"
          style="background:none;border:none;color:#EE2D67;font-family:Montserrat,sans-serif;
                 font-weight:700;font-size:12px;cursor:pointer;text-decoration:underline">
          Ver todos na agenda →
        </button>
      </div>
    </div>
  `;
}

// =============================================================
//  SIMULADOR DE VESTIBULAR
//  0. Nota  1. Área  2. Carreira  3. Estado  4. Resultado
// =============================================================

function fetchSimulador(params) {
  return new Promise(function(resolve, reject) {
    var cbName = "_simCb_" + Date.now();
    params.callback = cbName;
    var url = SIMULADOR_URL + "?" + new URLSearchParams(params).toString();
    window[cbName] = function(data) {
      delete window[cbName];
      var old = document.getElementById("_sim_jsonp");
      if (old) old.remove();
      resolve(data);
    };
    var script = document.createElement("script");
    script.id = "_sim_jsonp";
    script.onerror = function() { delete window[cbName]; reject(new Error("Erro de rede")); };
    script.src = url;
    document.head.appendChild(script);
  });
}

let simEstado = { nota: 0, area: "", carreira: "", uf: "todas" };

// --- ETAPA 0: Digitar nota ---
function iniciarSimulador() {
  if (!alunoAtual) { showToast("Identifique-se com seu RA primeiro."); return; }
  const el = document.getElementById("simulador-resultado");
  el.style.display = "block";
  document.getElementById("simulador-form").style.display = "none";
  document.getElementById("simulador-loading").style.display = "none";

  el.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:15px;color:#fff;margin-bottom:6px">
        Qual é a sua nota média? 📝
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-bottom:14px;line-height:1.5">
        Use sua <strong style="color:#00BDF2">Prova Única mais recente</strong>
        ou a <strong style="color:#00BDF2">nota do ENEM</strong> — quanto mais atual, melhor!
      </div>
      <input type="number" id="simNotaInput" placeholder="Ex: 620"
        min="0" max="1000" step="0.1"
        style="width:100%;padding:13px 14px;border-radius:8px;
               border:2px solid rgba(255,255,255,0.25);
               background:rgba(255,255,255,0.1);color:#fff;
               font-size:16px;font-family:Lato,sans-serif;
               box-sizing:border-box;outline:none"
        oninput="this.style.borderColor=this.value?'#00BDF2':'rgba(255,255,255,0.25)'"
        onkeydown="if(event.key==='Enter')confirmarNota()">
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:5px">Escala de 0 a 1000 (mesma do ENEM)</div>
    </div>
    <button onclick="confirmarNota()"
      style="width:100%;padding:12px;background:#00BDF2;color:#002561;border:none;
             border-radius:8px;font-family:Montserrat,sans-serif;font-weight:700;
             font-size:14px;cursor:pointer;margin-bottom:8px">
      Continuar →
    </button>
    <button onclick="resetarSimulador()"
      style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:13px;
             cursor:pointer;padding:4px 0;font-family:Montserrat,sans-serif;font-weight:700">
      ← Cancelar
    </button>
  `;
  setTimeout(() => document.getElementById("simNotaInput")?.focus(), 100);
}

async function confirmarNota() {
  const input = document.getElementById("simNotaInput");
  const nota = parseFloat(input?.value || "0");
  if (!nota || nota < 100 || nota > 1000) {
    if (input) { input.style.borderColor = "#EE2D67"; input.placeholder = "Digite entre 100 e 1000"; }
    return;
  }
  simEstado.nota = nota;
  simMostrarLoading("Carregando áreas...");
  try {
    const data = await fetchSimulador({ action: "areas" });
    simEsconderLoading();
    if (data.erro) { showToast(data.erro); return; }
    renderizarEtapa1(data.areas);
  } catch(e) { simEsconderLoading(); showToast("Erro ao conectar. Tente novamente."); }
}

// --- ETAPA 1: Área ---
function renderizarEtapa1(areas) {
  simGetEl().innerHTML = `
    ${simTag("📊 Nota: " + simEstado.nota)}
    <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:15px;color:#fff;margin-bottom:4px">Qual área te interessa?</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:14px">Carreiras recomendadas pelo Ismart · universidades públicas</div>
    <div class="sim-areas-grid">
      ${areas.map(a => `<button class="sim-area-btn" onclick="escolherArea('${a}')">${iconeArea(a)} ${a}</button>`).join("")}
    </div>
    ${simVoltar("iniciarSimulador()", "Corrigir nota")}
  `;
}

function iconeArea(a) {
  return {"Exatas":"📐","Humanas":"📖","Medicina":"⚕️","Tecnologia":"💻","Biológicas":"🔬","Interdisciplinar":"🔀"}[a] || "🎓";
}

// --- ETAPA 2: Carreira ---
async function escolherArea(area) {
  simEstado.area = area;
  simMostrarLoading("Buscando carreiras...");
  try {
    const data = await fetchSimulador({ action: "carreiras", area });
    simEsconderLoading();
    if (data.erro) { showToast(data.erro); return; }
    renderizarEtapa2(data.carreiras);
  } catch(e) { simEsconderLoading(); showToast("Erro ao buscar carreiras. Tente novamente."); }
}

function renderizarEtapa2(carreiras) {
  simGetEl().innerHTML = `
    ${simTag("📊 " + simEstado.nota + " · " + simEstado.area)}
    <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:15px;color:#fff;margin-bottom:14px">Qual carreira você quer explorar?</div>
    <div class="sim-carreiras-lista" id="sim-carreiras-lista"></div>
    ${simVoltar("escolherArea(simEstado.area)", "Trocar área")}
  `;
  // Monta os botões via JS para evitar problemas com aspas/acentos
  const lista = document.getElementById("sim-carreiras-lista");
  carreiras.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "sim-carreira-btn";
    btn.innerHTML = c + ' <span class="sim-carreira-arrow">›</span>';
    btn.addEventListener("click", () => escolherCarreira(c));
    lista.appendChild(btn);
  });
}

// --- ETAPA 3: Estado ---
function escolherCarreira(carreira) {
  simEstado.carreira = carreira;
  simGetEl().innerHTML = `
    ${simTag("📊 " + simEstado.nota + " · " + carreira)}
    <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:15px;color:#fff;margin-bottom:4px">Prefere algum estado?</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:14px">Ampliar para outros estados aumenta muito suas opções!</div>
    <div class="sim-ufs-grid" id="sim-ufs-grid"></div>
    ${simVoltar("escolherArea(simEstado.area)", "Trocar carreira")}
  `;
  const grid = document.getElementById("sim-ufs-grid");
  ["todas","SP","RJ","MG","RS","PR","SC","DF","BA","CE","PE","GO"].forEach(uf => {
    const btn = document.createElement("button");
    btn.className = "sim-uf-btn";
    btn.textContent = uf === "todas" ? "🗺️ Qualquer estado" : uf;
    btn.addEventListener("click", () => buscarUniversidades(uf));
    grid.appendChild(btn);
  });
}

// --- ETAPA 4: Resultado ---
async function buscarUniversidades(uf) {
  simEstado.uf = uf;
  simMostrarLoading("Buscando universidades...");
  try {
    const data = await fetchSimulador({ action: "universidades", carreira: simEstado.carreira, uf });
    simEsconderLoading();
    if (data.erro) { showToast(data.erro); return; }
    renderizarUniversidades(data);
  } catch(e) { simEsconderLoading(); showToast("Erro ao buscar universidades. Tente novamente."); }
}

function classificar(notaAluno, notaCorte) {
  const d = notaAluno - notaCorte;
  if (d > 10)        return { label:"🏆 Aprovando!",       cor:"#1A7A4A", bg:"#D4EFDF", diff:d };
  if (d >= 0)        return { label:"✅ Dentro da nota",   cor:"#27AE60", bg:"#EAFAF0", diff:d };
  if (d >= -10)      return { label:"⚠️ Próximo",          cor:"#E67E22", bg:"#FEF9E7", diff:d };
  if (d >= -50)      return { label:"📚 Longe da nota",    cor:"#2980B9", bg:"#EBF4FF", diff:d };
                     return { label:"🔄 Trocar urgente",   cor:"#C0392B", bg:"#FADBD8", diff:d };
}

function renderizarUniversidades(data) {
  const { universidades, aviso } = data;
  const nota = simEstado.nota;
  const ufLabel = simEstado.uf === "todas" ? "todos os estados" : simEstado.uf;
  const el = simGetEl();

  // Cabeçalho sempre igual
  el.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:15px;color:#fff;margin-bottom:8px">
        📋 ${simEstado.carreira}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span style="background:rgba(0,189,242,0.2);border-radius:20px;padding:3px 10px;font-size:11px;color:#00BDF2;font-family:Montserrat,sans-serif;font-weight:700">
          📊 Sua nota: ${nota}
        </span>
        <span style="background:rgba(255,255,255,0.1);border-radius:20px;padding:3px 10px;font-size:11px;color:rgba(255,255,255,0.7);font-family:Montserrat,sans-serif;font-weight:700">
          🏛️ ${universidades ? universidades.length : 0} univ. · ${ufLabel}
        </span>
      </div>
    </div>
    <div id="sim-grupos-container"></div>
    <div style="background:rgba(0,189,242,0.12);border-radius:8px;padding:10px 12px;font-size:12px;color:rgba(255,255,255,0.75);margin-bottom:12px">
      🗺️ Dica: considere ampliar para outros estados — mais opções, mais chances!
    </div>
    <div id="sim-btns-resultado"></div>
  `;

  // Botões de voltar via DOM (evita problema com aspas)
  const btnsDiv = document.getElementById("sim-btns-resultado");
  const btnVoltar = document.createElement("button");
  btnVoltar.textContent = "← Escolher outro estado";
  btnVoltar.style.cssText = "background:none;border:none;color:rgba(255,255,255,0.55);font-size:13px;cursor:pointer;padding:6px 0;font-family:Montserrat,sans-serif;font-weight:700;display:block;margin-bottom:6px";
  btnVoltar.addEventListener("click", () => escolherCarreira(simEstado.carreira));
  btnsDiv.appendChild(btnVoltar);

  const btnReset = document.createElement("button");
  btnReset.textContent = "🔄 Nova busca";
  btnReset.style.cssText = "width:100%;padding:10px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.25);border-radius:8px;color:#fff;font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;cursor:pointer";
  btnReset.addEventListener("click", resetarSimulador);
  btnsDiv.appendChild(btnReset);

  if (!universidades || !universidades.length) {
    document.getElementById("sim-grupos-container").innerHTML = `
      <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:14px">
        ${aviso || "Nenhuma universidade encontrada para os filtros selecionados."}
      </div>
      <div style="background:rgba(0,189,242,0.15);border-radius:8px;padding:12px;font-size:13px;color:rgba(255,255,255,0.8);margin-bottom:14px">
        💡 Tente ampliar para outros estados!
      </div>`;
    return;
  }

  // Define grupos de classificação
  const defGrupos = [
    { cor:"#1A7A4A", emoji:"🏆", titulo:"Aprovando!",        desc:"Mais de 10 pts acima da nota de corte",      min:10.01,  max:9999   },
    { cor:"#27AE60", emoji:"✅", titulo:"Dentro da nota",     desc:"Igual ou até 10 pts acima da nota de corte", min:0,      max:10     },
    { cor:"#E67E22", emoji:"⚠️", titulo:"Próximo",            desc:"Até 10 pts abaixo — chegando lá!",           min:-10,    max:-0.01  },
    { cor:"#2980B9", emoji:"📚", titulo:"Longe da nota",      desc:"Entre 10 e 50 pts abaixo",                   min:-50,    max:-10.01 },
    { cor:"#C0392B", emoji:"🔄", titulo:"Trocar urgente",     desc:"Mais de 50 pts abaixo — reveja essa opção",  min:-9999,  max:-50.01 },
  ];

  const container = document.getElementById("sim-grupos-container");

  defGrupos.forEach((g, gi) => {
    const lista = universidades.filter(u => {
      const a = u.modalidades.find(m => m.tipo.toLowerCase().includes("ampla"));
      if (!a) return false;
      const d = nota - a.notaCorte;
      return d >= g.min && d <= g.max;
    });
    if (!lista.length) return;

    // Header do grupo
    const grupoDiv = document.createElement("div");
    grupoDiv.style.marginBottom = "14px";
    grupoDiv.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:16px">${g.emoji}</span>
        <div>
          <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;color:${g.cor}">${g.titulo}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5)">${g.desc}</div>
        </div>
      </div>
      <div id="sim-grupo-lista-${gi}"></div>
    `;
    container.appendChild(grupoDiv);

    const listaDiv = document.getElementById("sim-grupo-lista-" + gi);

    lista.forEach((u, i) => {
      const ampla = u.modalidades.find(m => m.tipo.toLowerCase().includes("ampla"));
      const cotas = u.modalidades.filter(m => !m.tipo.toLowerCase().includes("ampla"));
      const cl = ampla ? classificar(nota, ampla.notaCorte) : null;
      const uid = "u" + gi + "_" + i;

      const card = document.createElement("div");
      card.style.cssText = `background:#fff;border-radius:8px;margin-bottom:8px;overflow:hidden;border-left:4px solid ${g.cor}`;

      // Header do card
      const header = document.createElement("div");
      header.style.cssText = "display:flex;align-items:center;gap:10px;padding:12px;cursor:pointer";
      header.innerHTML = `
        <div style="flex:1;min-width:0">
          <div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:13px;color:#002561">${u.ies}</div>
          <div style="font-size:11px;color:#666;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.nomeIES}</div>
          <div style="font-size:11px;color:#999;margin-top:2px">📍 ${u.cidade}/${u.uf}${u.turno ? " · " + u.turno : ""}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          ${ampla ? `<div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:15px;color:#002561">${ampla.notaCorte.toFixed(1)}</div><div style="font-size:10px;color:#999">nota de corte</div>` : ""}
          ${cl ? `<div style="background:${cl.bg};color:${cl.cor};border-radius:20px;padding:2px 7px;font-size:11px;font-weight:700;font-family:Montserrat,sans-serif;margin-top:3px">${cl.diff >= 0 ? "+" : ""}${cl.diff.toFixed(1)} pts</div>` : ""}
          <span style="color:#ccc;font-size:18px">›</span>
        </div>
      `;

      // Detalhe expandível
      const detalhe = document.createElement("div");
      detalhe.id = "simdet-" + uid;
      detalhe.style.cssText = "display:none;padding:0 12px 12px;border-top:1px solid #f0f0f0";

      let detHTML = `<div style="font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.5px;margin:10px 0 8px">Modalidades de concorrência</div>`;
      u.modalidades.forEach(m => {
        const mc = classificar(nota, m.notaCorte);
        detHTML += `
          <div style="padding:8px 10px;border-radius:6px;margin-bottom:6px;background:${mc.bg}">
            <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:11px;color:#002561;margin-bottom:4px">${m.tipo}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#333;flex-wrap:wrap;gap:4px">
              <span>Corte: <strong>${m.notaCorte.toFixed(1)}</strong> · Vagas: <strong>${m.vagas}</strong></span>
              <span style="color:${mc.cor};font-weight:700;font-family:Montserrat,sans-serif;font-size:11px">${mc.label} (${mc.diff >= 0 ? "+" : ""}${mc.diff.toFixed(1)})</span>
            </div>
          </div>`;
      });
      if (cotas.length) {
        detHTML += `<div style="background:#FEF9E7;border-radius:6px;padding:8px 10px;font-size:12px;color:#856404;margin-top:4px;border-left:3px solid #F0C040">
          ✅ ${cotas.length} modalidade(s) de cota — verifique se você se qualifica!
        </div>`;
      }
      detalhe.innerHTML = detHTML;

      header.addEventListener("click", () => {
        detalhe.style.display = detalhe.style.display === "block" ? "none" : "block";
      });

      card.appendChild(header);
      card.appendChild(detalhe);
      listaDiv.appendChild(card);
    });
  });
}

// Helpers
function simGetEl() {
  const el = document.getElementById("simulador-resultado");
  el.style.display = "block";
  return el;
}
function simTag(texto) {
  return `<div style="display:inline-flex;background:rgba(0,189,242,0.2);border-radius:20px;padding:3px 10px;margin-bottom:10px">
    <span style="font-size:12px;color:#00BDF2;font-weight:700;font-family:Montserrat,sans-serif">${texto}</span>
  </div>`;
}
function simVoltar(acao, label) {
  return `<button onclick="${acao}" style="background:none;border:none;color:rgba(255,255,255,0.55);
    font-size:13px;cursor:pointer;padding:6px 0;font-family:Montserrat,sans-serif;font-weight:700;display:block">
    ← ${label || "Voltar"}
  </button>`;
}
function simBtnReset() {
  return `<button onclick="resetarSimulador()" style="width:100%;padding:10px;margin-top:6px;
    background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.25);border-radius:8px;
    color:#fff;font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;cursor:pointer">
    🔄 Nova busca
  </button>`;
}

function toggleSimUni(uid) {
  const d = document.getElementById("simdet-" + uid);
  if (d) d.style.display = d.style.display === "block" ? "none" : "block";
}

function simMostrarLoading(msg) {
  document.getElementById("simulador-form").style.display      = "none";
  document.getElementById("simulador-resultado").style.display = "none";
  const l = document.getElementById("simulador-loading");
  if (l) { l.style.display = "block"; l.textContent = "⏳ " + msg; }
}

function simEsconderLoading() {
  const l = document.getElementById("simulador-loading");
  if (l) l.style.display = "none";
}

function resetarSimulador() {
  simEstado = { nota: 0, area: "", carreira: "", uf: "todas" };
  document.getElementById("simulador-resultado").style.display = "none";
  document.getElementById("simulador-loading").style.display   = "none";
  document.getElementById("simulador-form").style.display      = "block";
}



//  Busca por similaridade de palavras no FAQ
// =============================================================

// Palavras sem significado para ignorar na busca
const STOPWORDS = new Set([
  "a","o","e","é","de","do","da","em","um","uma","com","que","se","na","no",
  "para","por","como","não","meu","minha","meus","minhas","eu","me","mim",
  "tem","ter","tenho","está","estou","foi","ser","isso","esse","essa","mais",
  "mas","ou","já","quando","onde","qual","quais","preciso","quero","dúvida",
  "sobre","ajuda","saber","consegui","consigo","posso","devo"
]);

function tokenizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

function calcularRelevancia(query, faqItem) {
  const tokens = tokenizar(query);
  if (!tokens.length) return 0;

  const textoCompleto = (faqItem.q + " " + faqItem.a + " " + (faqItem.tags || "")).toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let score = 0;
  for (const token of tokens) {
    if (textoCompleto.includes(token)) {
      // Peso maior se aparece na pergunta
      if (faqItem.q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(token)) {
        score += 3;
      } else {
        score += 1;
      }
    }
  }
  return score;
}

function buscarFAQ(query) {
  const clearBtn = document.getElementById("faqClearBtn");
  const resultado = document.getElementById("faq-resultado");
  const listaWrap = document.getElementById("faq-lista-wrap");
  const tituloEl  = document.getElementById("faq-resultado-titulo");
  const listaEl   = document.getElementById("faq-resultado-lista");

  if (clearBtn) clearBtn.style.display = query.length > 0 ? "block" : "none";

  if (!query || query.trim().length < 2) {
    resultado.style.display = "none";
    listaWrap.style.display = "block";
    return;
  }

  // Calcula relevância de cada item
  const scoredFAQ = FAQ.map(item => ({
    item,
    score: calcularRelevancia(query, item)
  })).filter(r => r.score > 0)
     .sort((a, b) => b.score - a.score)
     .slice(0, 5);

  listaWrap.style.display = "none";
  resultado.style.display = "block";

  if (scoredFAQ.length === 0) {
    tituloEl.textContent = `Nenhum resultado para "${query}"`;
    listaEl.innerHTML = `
      <div class="faq-sem-resultado">
        <div class="faq-sem-icon">🤔</div>
        <p>Não encontrei uma resposta para isso no FAQ.</p>
        <p>Tente outras palavras ou use o formulário de atendimento.</p>
      </div>`;
    return;
  }

  tituloEl.textContent = `${scoredFAQ.length} resultado${scoredFAQ.length > 1 ? "s" : ""} para "${query}"`;
  listaEl.innerHTML = scoredFAQ.map((r, i) => `
    <div class="faq-item" id="faq-result-${i}">
      <div class="faq-q" onclick="toggleFaqResult(${i})">
        <span>${r.item.q}</span>
        <span class="faq-chevron">›</span>
      </div>
      <div class="faq-a">${destacarTermos(r.item.a, query)}</div>
    </div>`).join("");

  // Abre automaticamente o primeiro resultado
  setTimeout(() => {
    document.getElementById("faq-result-0")?.classList.add("open");
  }, 100);
}

function toggleFaqResult(i) {
  document.getElementById(`faq-result-${i}`)?.classList.toggle("open");
}

function buscarFAQRapido(termo) {
  const input = document.getElementById("faqSearchInput");
  if (input) {
    input.value = termo;
    buscarFAQ(termo);
    input.focus();
  }
}

function limparFAQ() {
  const input = document.getElementById("faqSearchInput");
  if (input) input.value = "";
  document.getElementById("faqClearBtn").style.display = "none";
  document.getElementById("faq-resultado").style.display = "none";
  document.getElementById("faq-lista-wrap").style.display = "block";
}

function destacarTermos(texto, query) {
  const tokens = tokenizar(query);
  let result = texto;
  for (const token of tokens) {
    const re = new RegExp(`(${token})`, "gi");
    result = result.replace(re, "<mark>$1</mark>");
  }
  return result;
}

// =============================================================
//  BOTÃO FLUTUANTE DE AJUDA (FAB)
// =============================================================

let fabAberto = false;

// Mostra o FAB após o login
function mostrarFAB() {
  const fab = document.getElementById("fab-ajuda");
  if (fab) fab.style.display = "flex";
}

// Esconde o FAB ao sair
function esconderFAB() {
  const fab = document.getElementById("fab-ajuda");
  if (fab) fab.style.display = "none";
  fecharFabMenu();
}

function toggleFabMenu() {
  fabAberto ? fecharFabMenu() : abrirFabMenu();
}

function abrirFabMenu() {
  fabAberto = true;
  document.getElementById("fab-menu").style.display = "block";
  document.getElementById("fab-overlay").style.display = "block";
  document.getElementById("fab-ajuda").classList.add("open");
  document.getElementById("fab-faq-resultado").innerHTML = "";
  document.getElementById("fabFaqInput").value = "";
  setTimeout(() => document.getElementById("fabFaqInput").focus(), 200);
}

function fecharFabMenu() {
  fabAberto = false;
  document.getElementById("fab-menu").style.display = "none";
  document.getElementById("fab-overlay").style.display = "none";
  document.getElementById("fab-ajuda").classList.remove("open");
}

// Busca FAQ dentro do FAB
function buscarFABFaq(query) {
  const container = document.getElementById("fab-faq-resultado");
  const acoes = document.getElementById("fab-acoes");

  if (!query || query.trim().length < 2) {
    container.innerHTML = "";
    acoes.style.display = "flex";
    return;
  }

  const resultados = FAQ.map(item => ({
    item,
    score: calcularRelevancia(query, item)
  })).filter(r => r.score > 0)
     .sort((a, b) => b.score - a.score)
     .slice(0, 3);

  acoes.style.display = resultados.length ? "none" : "flex";

  if (!resultados.length) {
    container.innerHTML = `
      <div class="fab-faq-sem-resultado">
        🤔 Não encontrei resposta para isso.<br>
        Tente outras palavras ou use as opções abaixo.
      </div>`;
    acoes.style.display = "flex";
    return;
  }

  container.innerHTML = resultados.map((r, i) => `
    <div class="fab-faq-item" id="fab-item-${i}" onclick="toggleFabItem(${i})">
      <div class="fab-faq-pergunta">${r.item.q}</div>
      <div class="fab-faq-resposta">${r.item.a}</div>
    </div>`).join("");

  // Abre o primeiro automaticamente
  setTimeout(() => toggleFabItem(0), 100);
}

function toggleFabItem(i) {
  document.getElementById(`fab-item-${i}`)?.classList.toggle("aberto");
}

// =============================================================
//  MELHORES OPORTUNIDADES — EF
// =============================================================

async function salvarMONoScript(ra, nomeAluno, chaveEscola, etapa) {
  try {
    const partes = chaveEscola.split("_");
    const cidade = partes[0];
    const escola = partes.slice(1).join("_");

    const payload = JSON.stringify({
      ra,
      nome: alunoAtual?.nome || nomeAluno || "",
      escola,
      cidade,
      etapa,
    });

    console.log("[MO Script] Enviando:", payload);

    // Usa no-cors para evitar bloqueio de CORS
    const resp = await fetch(MO_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: payload,
    });

    console.log("[MO Script] Enviado com sucesso");
  } catch(e) {
    console.warn("[MO Script] Erro:", e);
  }
}


async function renderizarMOs(aluno) {
  const container = document.getElementById("mo-container");
  if (!container) return;

  const serie = normalizarSerie(aluno.serie);
  const ehEF = ["8EF","9EF"].includes(serie);
  const ehEM = ["1EM","2EM","3EM"].includes(serie);

  // Blocos exclusivos do EM — esconde para EF
  const blocosEM = ["bloco-estrategia", "bloco-simulador", "bloco-criterios", "orient-lembretes-vest", "bloco-es-ismart"];
  blocosEM.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = ehEF ? "none" : "";
  });

  if (!ehEF) {
    container.style.display = "none";
    return;
  }
  container.style.display = "block";

  // Painel agora está dentro das abas, não precisa de container externo

  // Cidade do aluno para filtro padrão
  const cidadeAluno = (aluno.cidade || "").toUpperCase();
  let cidadePadrao = "SP";
  if (cidadeAluno.includes("SÃO JOSÉ") || cidadeAluno.includes("SAO JOSE")) cidadePadrao = "SJC";
  else if (cidadeAluno.includes("BELO HORIZONTE") || cidadeAluno.includes("BH")) cidadePadrao = "BH";
  else if (cidadeAluno.includes("RIO DE JANEIRO") || cidadeAluno.includes("RIO")) cidadePadrao = "RJ";

  // Carrega interesses salvos
  try {
    const salvo = sessionStorage.getItem("mo_interesses_" + aluno.RA);
    if (salvo) moInteresses = JSON.parse(salvo);
  } catch(e) { moInteresses = {}; }

  container.innerHTML = `

    <!-- INTRO -->
    <div style="background:linear-gradient(135deg,#002561,#004fa3);border-radius:var(--r-lg);padding:22px;margin-bottom:16px;position:relative;overflow:hidden">
      <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;background:var(--blue);opacity:0.15;border-radius:50%"></div>
      <div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:16px;color:#fff;margin-bottom:10px;position:relative">
        🏫 O que são as Melhores Oportunidades?
      </div>
      <p style="font-size:13px;color:rgba(255,255,255,0.85);line-height:1.6;margin-bottom:12px;position:relative">
        As <strong style="color:#00BDF2">Melhores Oportunidades (MOs)</strong> são escolas de Ensino Médio recomendadas pelo Ismart — públicas gratuitas, institutos federais e privadas com bolsa — selecionadas pelo alto nível de ensino e pelas portas que abrem para o futuro.
      </p>
      <div style="background:rgba(0,189,242,0.15);border-radius:10px;padding:12px 14px;border-left:3px solid var(--blue);position:relative">
        <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;color:#fff;margin-bottom:4px">
          💡 Por que ir além do Bolsa Talento?
        </div>
        <p style="font-size:12px;color:rgba(255,255,255,0.8);line-height:1.6;margin:0">
          Quanto <strong style="color:#00BDF2">maior a sua estratégia de vestibular</strong>, maior a chance de entrar em uma boa escola de EM. Alunos que se inscrevem em múltiplas oportunidades têm muito mais chances de aprovação — e o Ismart está aqui para te ajudar a montar esse plano!
        </p>
      </div>
    </div>

    <!-- ABAS INTERNAS -->
    <div class="mo-abas-nav">
      <button class="mo-aba-btn ativo" data-aba="explorar" onclick="trocarAbaMO('explorar', '${aluno.RA}')">
        🏫 Explorar escolas
      </button>
      <button class="mo-aba-btn" data-aba="plano" onclick="trocarAbaMO('plano', '${aluno.RA}')">
        📊 Meu Plano
        <span class="mo-aba-badge" id="mo-aba-badge" style="display:none">0</span>
      </button>
    </div>

    <!-- ABA: EXPLORAR -->
    <div id="mo-aba-explorar">

      <div style="background:#fff;border:1.5px solid var(--border);border-radius:var(--r-lg);padding:18px;margin-bottom:16px">
        <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:14px;color:var(--navy);margin-bottom:4px">
          🗺️ Escolas mais próximas de você
        </div>
        <p style="font-size:12px;color:var(--text2);margin-bottom:12px;line-height:1.5">
          Digite seu endereço para ver as MOs no mapa.
        </p>
        <div id="mo-mapa-wrap-inline"></div>
      </div>

      <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:14px;color:var(--navy);margin-bottom:12px">
        📋 Todas as escolas recomendadas
      </div>

      <div id="mo-filtros-cidade" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px">
        <div style="font-size:13px;color:var(--text2)">
          📍 <strong style="color:var(--navy)" id="mo-cidade-label">${cidadePadrao === "SP" ? "São Paulo" : cidadePadrao === "SJC" ? "São José dos Campos" : cidadePadrao === "BH" ? "Belo Horizonte" : "Rio de Janeiro"}</strong>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${["SP","SJC","BH","RJ"].filter(c => c !== cidadePadrao).map(c => `
            <button class="mo-tipo-btn" onclick="carregarMOCidade('${c}', '${aluno.RA}');document.getElementById('mo-cidade-label').textContent='${c === "SP" ? "São Paulo" : c === "SJC" ? "São José dos Campos" : c === "BH" ? "Belo Horizonte" : "Rio de Janeiro"}'" data-cidade="${c}">
              ${c === "SP" ? "🏙️ SP" : c === "SJC" ? "✈️ SJC" : c === "BH" ? "⛰️ BH" : "🌊 RJ"}
            </button>`).join("")}
        </div>
      </div>

      <div id="mo-filtros-tipo" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        <button class="mo-tipo-btn ativo" data-tipo="todos" onclick="filtrarMOTipo('todos')">Todas</button>
        <button class="mo-tipo-btn" data-tipo="publico" onclick="filtrarMOTipo('publico')">🏛️ Públicas</button>
        <button class="mo-tipo-btn" data-tipo="privado" onclick="filtrarMOTipo('privado')">🏫 Privadas</button>
        <button class="mo-tipo-btn" data-tipo="federal" onclick="filtrarMOTipo('federal')">🎓 Federais</button>
      </div>

      <div id="mo-lista">
        <div class="mo-loading">
          <div class="skeleton-linha" style="width:100%;height:80px;margin-bottom:8px;border-radius:10px"></div>
          <div class="skeleton-linha" style="width:100%;height:80px;margin-bottom:8px;border-radius:10px"></div>
          <div class="skeleton-linha" style="width:100%;height:80px;border-radius:10px"></div>
        </div>
      </div>

      <div id="mo-contador" style="display:none;margin-top:12px;background:#EBF4FF;border-radius:10px;padding:12px 16px;font-size:13px;color:var(--navy);font-family:Montserrat,sans-serif;font-weight:700;cursor:pointer"
           onclick="trocarAbaMO('plano', '${aluno.RA}')">
        ❤️ <span id="mo-contador-num">0</span> escola(s) no seu plano — <span style="text-decoration:underline">ver Meu Plano →</span>
      </div>
    </div>

    <!-- ABA: MEU PLANO -->
    <div id="mo-aba-plano" style="display:none">
      <div id="mo-painel-inline"></div>
    </div>
  `;

  // Inicializa mapa no container inline
  renderizarMapaMO(aluno.RA);

  // Carrega cidade padrão
  await carregarMOCidade(cidadePadrao, aluno.RA);
}

async function carregarMOCidade(cidade, ra) {
  // Atualiza botões de cidade
  document.querySelectorAll(".mo-cidade-btn").forEach(btn => {
    btn.classList.toggle("ativo", btn.dataset.cidade === cidade);
  });

  // Reseta filtro de tipo
  document.querySelectorAll(".mo-tipo-btn").forEach(btn => {
    btn.classList.toggle("ativo", btn.dataset.tipo === "todos");
  });

  window._moCidadeAtual = cidade;

  const lista = document.getElementById("mo-lista");
  if (!lista) return;

  // Verifica cache
  if (moCache[cidade]) {
    renderizarMOLista(moCache[cidade], ra);
    return;
  }

  lista.innerHTML = `
    <div class="mo-loading">
      <div class="skeleton-linha" style="width:100%;height:80px;margin-bottom:8px;border-radius:10px"></div>
      <div class="skeleton-linha" style="width:100%;height:80px;margin-bottom:8px;border-radius:10px"></div>
      <div class="skeleton-linha" style="width:100%;height:80px;border-radius:10px"></div>
    </div>`;

  try {
    // SP usa aba Pesquisas (mais completa)
    const url = cidade === "SP" ? MO_URLS.Pesquisas : MO_URLS[cidade];
    const response = await fetch(url);
    const csv = await response.text();
    const rows = parseCSVCompleto(csv);

    const escolas = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      if (!cols || cols.length < 2) continue;

      if (cidade === "SP") {
        // Aba Pesquisas: Nº | Nome | Tipo | Bairro | Bolsas | Cursos | Desempenho
        const nome = (cols[1] || "").replace(/"/g,"").trim();
        // Pula linhas de cabeçalho ou vazias
        if (!nome || nome.toLowerCase().includes("nome") || nome.toLowerCase().includes("escola/inst") || /^\d+$/.test(nome)) continue;
        escolas.push({
          nome,
          tipo:       (cols[2] || "").replace(/"/g,"").trim(),
          bairro:     (cols[3] || "").replace(/"/g,"").trim(),
          bolsas:     (cols[4] || "").replace(/"/g,"").trim(),
          cursos:     (cols[5] || "").replace(/"/g,"").trim(),
          desempenho: (cols[6] || "").replace(/"/g,"").trim(),
          link:       "",
          cidade,
        });
      } else {
        // Abas SJC/BH/RJ: Nome | INEP | Tipo | IDEB | ENEM2024 | ENEM2019 | Bolsa | Link | ...
        const nome = (cols[0] || "").replace(/"/g,"").trim();
        if (!nome || nome.toLowerCase() === "nome da escola") continue;
        escolas.push({
          nome,
          tipo:       (cols[2] || "").replace(/"/g,"").trim(),
          bairro:     "",
          bolsas:     (cols[6] || "").replace(/"/g,"").trim(),
          cursos:     "",
          desempenho: (cols[4] || "").replace(/"/g,"").trim() ? `ENEM médio: ${(cols[4] || "").replace(/"/g,"").trim()}` : "",
          link:       (cols[7] || "").replace(/"/g,"").trim(),
          cidade,
        });
      }
    }

    moCache[cidade] = escolas;
    renderizarMOLista(escolas, ra);

  } catch(e) {
    lista.innerHTML = `<p style="color:var(--text2);font-size:13px;padding:16px;text-align:center">Erro ao carregar escolas. Tente novamente.</p>`;
  }
}

function filtrarMOTipo(tipo) {
  document.querySelectorAll(".mo-tipo-btn").forEach(btn => {
    btn.classList.toggle("ativo", btn.dataset.tipo === tipo);
  });
  window._moTipoAtual = tipo;

  const cidade = window._moCidadeAtual || "SP";
  const ra = window._alunoRA || "";
  const escolas = moCache[cidade] || [];

  const filtradas = tipo === "todos" ? escolas : escolas.filter(e => {
    const t = (e.tipo || "").toLowerCase();
    if (tipo === "publico")  return t.includes("público") || t.includes("publ");
    if (tipo === "privado")  return t.includes("privad");
    if (tipo === "federal")  return t.includes("federal");
    return true;
  });

  renderizarMOLista(filtradas, ra, true);
}

function renderizarMOLista(escolas, ra, jafiltrado) {
  const lista = document.getElementById("mo-lista");
  if (!lista) return;

  const tipoAtual = window._moTipoAtual || "todos";
  const filtradas = (jafiltrado || tipoAtual === "todos") ? escolas : escolas.filter(e => {
    const t = (e.tipo || "").toLowerCase();
    if (tipoAtual === "publico")  return t.includes("público") || t.includes("publ");
    if (tipoAtual === "privado")  return t.includes("privad");
    if (tipoAtual === "federal")  return t.includes("federal");
    return true;
  });

  window._alunoRA = ra;

  if (!filtradas.length) {
    lista.innerHTML = `<div class="mo-vazio"><div class="mo-vazio-icon">🏫</div><div class="mo-vazio-texto">Nenhuma escola encontrada para esse filtro.</div></div>`;
    return;
  }

  lista.innerHTML = filtradas.map((e, idx) => {
    const chaveInteresse = `${e.cidade}_${e.nome}`;
    const temInteresse = moInteresses[chaveInteresse];
    const tipoNorm = (e.tipo || "").toLowerCase();
    const badgeClass = tipoNorm.includes("federal") ? "mo-badge-federal" :
                       tipoNorm.includes("priv")    ? "mo-badge-privado" : "mo-badge-publico";

    return `
      <div class="mo-card" id="mo-card-${idx}">
        <div class="mo-card-header">
          <div style="flex:1;min-width:0">
            <div class="mo-card-nome">${e.nome}</div>
            <div class="mo-card-badges">
              ${e.tipo ? `<span class="mo-badge ${badgeClass}">${e.tipo}</span>` : ""}
              ${e.bairro ? `<span class="mo-badge mo-badge-bairro">📍 ${e.bairro}</span>` : ""}
            </div>
          </div>
        </div>
        ${(e.bolsas || e.cursos || e.desempenho) ? `
        <div class="mo-card-infos">
          ${e.bolsas ? `<div class="mo-card-info-item">💰 <span>${e.bolsas}</span></div>` : ""}
          ${e.cursos ? `<div class="mo-card-info-item">📚 <span>${e.cursos}</span></div>` : ""}
          ${e.desempenho ? `<div class="mo-card-info-item">📊 <span style="color:var(--text3)">${e.desempenho}</span></div>` : ""}
        </div>` : ""}
        <div class="mo-card-footer">
          <button class="mo-interesse-btn${temInteresse ? " ativo" : ""}"
            onclick="toggleMOInteresse('${chaveInteresse}', '${e.nome.replace(/'/g,"\'")}', '${ra}', ${idx})"
            id="mo-btn-${idx}">
            ${temInteresse ? "❤️ Tenho interesse" : "🤍 Marcar interesse"}
          </button>
          ${e.link ? `<a href="${e.link}" target="_blank" rel="noopener"
            style="font-size:12px;color:var(--blue);text-decoration:none;font-family:Montserrat,sans-serif;font-weight:700">
            Ver site ↗
          </a>` : ""}
        </div>
      </div>`;
  }).join("");

  atualizarContadorMO(ra);
}

function toggleMOInteresse(chave, nomeEscola, ra, idx) {
  const plano = carregarMOPlano(ra);

  if (moInteresses[chave]) {
    delete moInteresses[chave];
    delete plano[chave];
  } else {
    moInteresses[chave] = { nome: nomeEscola, data: new Date().toISOString() };
    plano[chave] = { nome: nomeEscola, etapa: "interesse", data_atualizacao: new Date().toISOString() };
    showToast("Adicionado ao seu plano! 🎉");
  }

  // Salva no sessionStorage
  try {
    sessionStorage.setItem("mo_interesses_" + ra, JSON.stringify(moInteresses));
  } catch(e) {}
  salvarMOPlano(ra, plano);

  // Atualiza botão
  const btn = document.getElementById(`mo-btn-${idx}`);
  if (btn) {
    const temInteresse = moInteresses[chave];
    btn.textContent = temInteresse ? "❤️" : "🤍";
    btn.classList.toggle("ativo", !!temInteresse);
  }

  atualizarContadorMO(ra);
  renderizarPainelMO(ra);
}

function atualizarContadorMO(ra) {
  const total = Object.keys(moInteresses).length;
  const contador = document.getElementById("mo-contador");
  const num = document.getElementById("mo-contador-num");
  if (contador) contador.style.display = total > 0 ? "block" : "none";
  if (num) num.textContent = total;
  // Atualiza badge da aba Meu Plano
  const badge = document.getElementById("mo-aba-badge");
  if (badge) {
    badge.style.display = total > 0 ? "inline-flex" : "none";
    badge.textContent = total;
  }
  // Atualiza botão da aba com o total
  const btnPlano = document.querySelector(".mo-aba-btn[data-aba='plano']");
  if (btnPlano) {
    btnPlano.innerHTML = `📊 Meu Plano ${total > 0 ? `<span class="mo-aba-badge" id="mo-aba-badge">${total}</span>` : '<span class="mo-aba-badge" id="mo-aba-badge" style="display:none">0</span>'}`;
  }
}

// =============================================================
//  PAINEL MO — Acompanhamento do aluno
// =============================================================

const MO_ETAPAS = [
  { id: "interesse",  emoji: "🔍", label: "Tenho interesse"  },
  { id: "inscrito",   emoji: "📋", label: "Me inscrevi"      },
  { id: "prova",      emoji: "📝", label: "Fiz a prova"      },
  { id: "aprovado",   emoji: "✅", label: "Fui aprovado!"    },
  { id: "nao_aprovado", emoji: "💪", label: "Não aprovado"   },
];

function salvarMOPlano(ra, plano) {
  try {
    sessionStorage.setItem("mo_plano_" + ra, JSON.stringify(plano));
  } catch(e) {}
}

function carregarMOPlano(ra) {
  try {
    const salvo = sessionStorage.getItem("mo_plano_" + ra);
    return salvo ? JSON.parse(salvo) : {};
  } catch(e) { return {}; }
}

function trocarAbaMO(aba, ra) {
  // Atualiza botões
  document.querySelectorAll(".mo-aba-btn").forEach(btn => {
    btn.classList.toggle("ativo", btn.dataset.aba === aba);
  });
  // Mostra/esconde conteúdo
  const explorar = document.getElementById("mo-aba-explorar");
  const plano    = document.getElementById("mo-aba-plano");
  if (explorar) explorar.style.display = aba === "explorar" ? "block" : "none";
  if (plano)    plano.style.display    = aba === "plano"    ? "block" : "none";
  // Renderiza painel ao abrir
  if (aba === "plano") {
    const painelEl = document.getElementById("mo-painel-inline");
    if (painelEl) {
      // Reutiliza renderizarPainelMO mas no container inline
      const containerOriginal = document.getElementById("mo-painel");
      renderizarPainelMOEm(ra, painelEl);
    }
  }
  window.scrollTo({ top: document.getElementById("mo-container")?.offsetTop - 20 || 0, behavior: "smooth" });
}

function renderizarPainelMOEm(ra, container) {
  if (!container) return;
  const plano = carregarMOPlano(ra);
  const escolas = Object.entries(plano);
  // Reusa a lógica do renderizarPainelMO mas injeta num container específico
  const tmpDiv = document.createElement("div");
  tmpDiv.id = "mo-painel";
  const oldPainel = document.getElementById("mo-painel");
  if (oldPainel) oldPainel.id = "mo-painel-bkp";
  document.body.appendChild(tmpDiv);
  renderizarPainelMO(ra);
  container.innerHTML = tmpDiv.innerHTML;
  tmpDiv.remove();
  if (oldPainel) oldPainel.id = "mo-painel";
  // Rebinda eventos copiando os onclicks via delegação
}

function renderizarPainelMO(ra) {
  const container = document.getElementById("mo-painel");
  if (!container) return;

  const plano = carregarMOPlano(ra);
  const escolas = Object.entries(plano);

  if (!escolas.length) {
    container.innerHTML = `
      <div class="mo-vazio">
        <div class="mo-vazio-icon">🏫</div>
        <div class="mo-vazio-texto">
          Você ainda não marcou interesse em nenhuma escola.<br>
          <span style="font-size:12px">Explore as escolas acima e clique em <strong>Marcar interesse</strong> para adicionar ao seu plano!</span>
        </div>
      </div>`;
    return;
  }

  const meta = plano._meta || "";

  container.innerHTML = `
    <div class="mo-meta-wrap">
      <div class="mo-meta-titulo">🎯 Quantas escolas você planeja se candidatar?</div>
      <div class="mo-meta-btns">
        ${[1,2,3,4,"5+"].map(n => `
          <button class="mo-meta-btn${meta == n ? " ativo" : ""}"
            onclick="definirMetaMO('${ra}', '${n}')">${n}</button>`).join("")}
      </div>
    </div>

    <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;color:var(--navy);margin-bottom:10px">
      📋 Minhas escolas (${escolas.filter(([k]) => k !== "_meta").length})
    </div>

    ${escolas.filter(([k]) => k !== "_meta").map(([chave, dados]) => {
      const etapaAtual = dados.etapa || "interesse";
      const nomeEscola = dados.nome || chave.split("_").slice(1).join(" ");
      const cidade = chave.split("_")[0];
      const historico = dados.historico || {};

      // Progresso
      const ordemEtapas = ["interesse","inscrito","prova","aprovado"];
      const idxAtual = ordemEtapas.indexOf(etapaAtual);
      const isNaoAprovado = etapaAtual === "nao_aprovado";
      const pct = isNaoAprovado ? 75 : Math.round(((idxAtual + 1) / ordemEtapas.length) * 100);
      const corBarra = isNaoAprovado ? "#F59E0B" : etapaAtual === "aprovado" ? "#27AE60" : "#00BDF2";

      return `
        <div class="mo-plano-card">
          <!-- Cabeçalho -->
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px">
            <div style="flex:1">
              <div class="mo-plano-card-nome">${nomeEscola}</div>
              <div class="mo-plano-card-cidade">📍 ${cidade === "SP" ? "São Paulo" : cidade === "SJC" ? "São José dos Campos" : cidade === "BH" ? "Belo Horizonte" : cidade === "RJ" ? "Rio de Janeiro" : cidade}</div>
            </div>
            <button onclick="removerMOInteresse('${chave}', '${ra}')"
              style="background:none;border:none;font-size:14px;cursor:pointer;color:var(--text3);padding:4px;flex-shrink:0"
              title="Remover da lista">✕</button>
          </div>

          <!-- Barra de progresso -->
          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-bottom:5px;font-family:Montserrat,sans-serif;font-weight:700">
              <span>${isNaoAprovado ? "💪 Não aprovado desta vez" : etapaAtual === "aprovado" ? "🎉 APROVADO!" : "Em andamento..."}</span>
              <span style="color:${corBarra}">${pct}%</span>
            </div>
            <div style="background:var(--border);border-radius:20px;height:8px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${corBarra};border-radius:20px;transition:width 0.5s ease"></div>
            </div>
          </div>

          <!-- Etapas com histórico -->
          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
            ${ordemEtapas.map((etId, idx) => {
              const etapa = MO_ETAPAS.find(e => e.id === etId);
              const feito = ordemEtapas.indexOf(etapaAtual) >= idx || etapaAtual === "nao_aprovado" && idx < 3;
              const atual = etapaAtual === etId;
              const dataEtapa = historico[etId] ? new Date(historico[etId]).toLocaleDateString("pt-BR") : null;
              return `
                <div style="display:flex;align-items:center;gap:10px;cursor:pointer"
                     onclick="atualizarEtapaMO('${chave}', '${etId}', '${ra}')">
                  <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;
                               background:${feito ? corBarra : "var(--border)"};
                               display:flex;align-items:center;justify-content:center;
                               font-size:14px;border:2px solid ${atual ? corBarra : "transparent"}">
                    ${feito ? etapa.emoji : "○"}
                  </div>
                  <div style="flex:1">
                    <div style="font-size:12px;font-family:Montserrat,sans-serif;font-weight:${atual ? "700" : "500"};
                                color:${feito ? "var(--navy)" : "var(--text3)"}">
                      ${etapa.label}
                    </div>
                    ${dataEtapa ? `<div style="font-size:10px;color:var(--text3)">${dataEtapa}</div>` : ""}
                  </div>
                  ${atual ? `<span style="font-size:10px;background:${corBarra};color:#fff;border-radius:20px;padding:2px 8px;font-family:Montserrat,sans-serif;font-weight:700">atual</span>` : ""}
                </div>`;
            }).join("")}
            <!-- Não aprovado -->
            <div style="display:flex;align-items:center;gap:10px;cursor:pointer;margin-top:4px;padding-top:8px;border-top:1px solid var(--border)"
                 onclick="atualizarEtapaMO('${chave}', 'nao_aprovado', '${ra}')">
              <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;
                           background:${isNaoAprovado ? "#F59E0B" : "var(--border)"};
                           display:flex;align-items:center;justify-content:center;font-size:14px">
                💪
              </div>
              <div style="font-size:12px;font-family:Montserrat,sans-serif;font-weight:${isNaoAprovado ? "700" : "500"};
                          color:${isNaoAprovado ? "var(--navy)" : "var(--text3)"}">
                Não aprovado desta vez
              </div>
              ${isNaoAprovado ? `<span style="font-size:10px;background:#F59E0B;color:#fff;border-radius:20px;padding:2px 8px;font-family:Montserrat,sans-serif;font-weight:700">atual</span>` : ""}
            </div>
          </div>
        </div>`;
    }).join("")}

    <!-- Tabela resumo -->
    ${escolas.filter(([k]) => k !== "_meta").length > 1 ? `
    <div style="margin-top:8px">
      <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;color:var(--navy);margin-bottom:10px">
        📊 Resumo do seu plano
      </div>
      <div style="background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-md);overflow:hidden">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:var(--navy);color:#fff">
              <th style="padding:8px 12px;text-align:left;font-family:Montserrat,sans-serif">Escola</th>
              <th style="padding:8px 12px;text-align:center;font-family:Montserrat,sans-serif">Status</th>
              <th style="padding:8px 12px;text-align:center;font-family:Montserrat,sans-serif">%</th>
            </tr>
          </thead>
          <tbody>
            ${escolas.filter(([k]) => k !== "_meta").map(([chave, dados], i) => {
              const nome = dados.nome || chave.split("_").slice(1).join(" ");
              const etapa = dados.etapa || "interesse";
              const isNao = etapa === "nao_aprovado";
              const ordem = ["interesse","inscrito","prova","aprovado"];
              const pct = isNao ? 75 : Math.round(((ordem.indexOf(etapa)+1)/ordem.length)*100);
              const cor = isNao ? "#F59E0B" : etapa === "aprovado" ? "#27AE60" : "#00BDF2";
              const emoji = MO_ETAPAS.find(e => e.id === etapa)?.emoji || "🔍";
              return `
                <tr style="border-bottom:1px solid var(--border);background:${i%2===0?"var(--bg)":"var(--white)"}">
                  <td style="padding:8px 12px;color:var(--navy);font-weight:600">${nome.length > 25 ? nome.slice(0,22)+"..." : nome}</td>
                  <td style="padding:8px 12px;text-align:center">${emoji}</td>
                  <td style="padding:8px 12px;text-align:center">
                    <span style="background:${cor}22;color:${cor};border-radius:20px;padding:2px 8px;font-weight:700;font-family:Montserrat,sans-serif">${pct}%</span>
                  </td>
                </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>` : ""}
  `;
}

function definirMetaMO(ra, meta) {
  const plano = carregarMOPlano(ra);
  plano._meta = meta;
  salvarMOPlano(ra, plano);
  renderizarPainelMO(ra);
}

function atualizarEtapaMO(chave, etapaId, ra) {
  const plano = carregarMOPlano(ra);
  if (plano[chave]) {
    const agora = new Date().toISOString();
    plano[chave].etapa = etapaId;
    plano[chave].data_atualizacao = agora;

    // Salva histórico de datas por etapa
    if (!plano[chave].historico) plano[chave].historico = {};
    if (!plano[chave].historico[etapaId]) {
      plano[chave].historico[etapaId] = agora;
    }

    salvarMOPlano(ra, plano);
    renderizarPainelMO(ra);

    // Salva no Apps Script
    salvarMONoScript(ra, plano[chave]?.nome || "", chave, etapaId);

    // Feedback visual
    const msgs = {
      interesse:    "Escola adicionada ao plano! 🏫",
      inscrito:     "Inscrição registrada! Boa sorte! 📋",
      prova:        "Prova registrada! Você foi incrível! 📝",
      aprovado:     "🎉 PARABÉNS! Você foi APROVADO! 🎉",
      nao_aprovado: "Não foi dessa vez, mas você tentou! Continue firme 💪",
    };
    if (msgs[etapaId]) showToast(msgs[etapaId]);
  }
}

function removerMOInteresse(chave, ra) {
  const plano = carregarMOPlano(ra);
  delete plano[chave];
  salvarMOPlano(ra, plano);

  // Também remove dos moInteresses
  delete moInteresses[chave];
  try { sessionStorage.setItem("mo_interesses_" + ra, JSON.stringify(moInteresses)); } catch(e) {}

  renderizarPainelMO(ra);
  atualizarContadorMO(ra);

  // Atualiza botão de interesse na lista se visível
  const lista = document.getElementById("mo-lista");
  if (lista) {
    lista.querySelectorAll(".mo-interesse-btn").forEach(btn => {
      const onclick = btn.getAttribute("onclick") || "";
      if (onclick.includes(chave)) {
        btn.textContent = "🤍";
        btn.classList.remove("ativo");
      }
    });
  }
}

// =============================================================
//  MAPA DE ESCOLAS — SP (OpenStreetMap + Leaflet)
// =============================================================

let mapaLeaflet = null;
let mapaMarcadores = [];

async function renderizarMapaMO(ra) {
  // Usa container inline se existir, senão o original
  const container = document.getElementById("mo-mapa-wrap-inline") || document.getElementById("mo-mapa-wrap");
  if (!container) return;
  container.style.display = "block";

  container.innerHTML = `
    <div style="background:#fff;border:1.5px solid var(--border);border-radius:var(--r-md);padding:16px;margin-bottom:16px">
      <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:14px;color:var(--navy);margin-bottom:12px">
        🗺️ Escolas próximas a você — São Paulo
      </div>

      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input type="text" id="mo-endereco-input"
          placeholder="Digite seu endereço em SP (ex: Rua das Flores, 100, Vila Madalena)"
          style="flex:1;padding:10px 14px;border:1.5px solid var(--border);border-radius:var(--r-sm);
                 font-size:13px;font-family:Lato,sans-serif;outline:none"
          onkeydown="if(event.key==='Enter') buscarEnderecoMO()">
        <button onclick="buscarEnderecoMO()"
          style="padding:10px 16px;background:var(--blue);color:var(--navy);border:none;
                 border-radius:var(--r-sm);font-family:Montserrat,sans-serif;font-weight:700;
                 font-size:13px;cursor:pointer;white-space:nowrap">
          Buscar
        </button>
        <button onclick="usarLocalizacaoMO()"
          style="padding:10px 12px;background:var(--bg);border:1.5px solid var(--border);
                 border-radius:var(--r-sm);font-size:16px;cursor:pointer;white-space:nowrap"
          title="Usar minha localização">
          📍
        </button>
      </div>

      <div id="mo-mapa" style="height:380px;border-radius:var(--r-sm);overflow:hidden;border:1px solid var(--border)">
        <div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--text2);font-size:13px">
          Digite seu endereço para ver as escolas no mapa
        </div>
      </div>

      <div id="mo-mapa-lista" style="margin-top:12px"></div>
    </div>
  `;

  // Carrega Leaflet se ainda não carregado
  if (!window.L) {
    await carregarLeaflet();
  }
}

function carregarLeaflet() {
  return new Promise(resolve => {
    // CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    // JS
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = resolve;
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
}

async function buscarEnderecoMO() {
  const input = document.getElementById("mo-endereco-input");
  const endereco = input?.value?.trim();
  if (!endereco) return;

  input.disabled = true;
  input.value = "Buscando...";

  try {
    // Geocodifica com Nominatim (OpenStreetMap)
    const query = encodeURIComponent(endereco + ", São Paulo, Brasil");
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: { "Accept-Language": "pt-BR" }
    });
    const data = await resp.json();

    if (!data.length) {
      showToast("Endereço não encontrado. Tente ser mais específico.");
      input.disabled = false;
      input.value = endereco;
      return;
    }

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    input.value = endereco;
    input.disabled = false;

    await inicializarMapaMO(lat, lon);

  } catch(e) {
    showToast("Erro ao buscar endereço. Tente novamente.");
    input.disabled = false;
    input.value = endereco;
  }
}

function usarLocalizacaoMO() {
  if (!navigator.geolocation) {
    showToast("Geolocalização não disponível no seu dispositivo.");
    return;
  }
  showToast("Obtendo sua localização...");
  navigator.geolocation.getCurrentPosition(
    async pos => {
      await inicializarMapaMO(pos.coords.latitude, pos.coords.longitude);
      const input = document.getElementById("mo-endereco-input");
      if (input) input.value = "Minha localização atual";
    },
    () => showToast("Não foi possível obter sua localização.")
  );
}

async function inicializarMapaMO(latAluno, lonAluno) {
  if (!window.L) await carregarLeaflet();

  const mapaEl = document.getElementById("mo-mapa");
  if (!mapaEl) return;

  // Destrói mapa anterior se existir
  if (mapaLeaflet) {
    mapaLeaflet.remove();
    mapaLeaflet = null;
  }
  mapaEl.innerHTML = "";

  // Cria mapa
  mapaLeaflet = L.map("mo-mapa").setView([latAluno, lonAluno], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(mapaLeaflet);

  // Pin do aluno
  const iconAluno = L.divIcon({
    html: `<div style="background:#EE2D67;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
  L.marker([latAluno, lonAluno], { icon: iconAluno })
    .addTo(mapaLeaflet)
    .bindPopup("<strong>Você está aqui</strong>")
    .openPopup();

  // Carrega escolas de SP se não estiver em cache
  if (!moCache["SP"]) {
    await carregarMOCidade("SP", window._alunoRA || "");
  }

  const escolas = moCache["SP"] || [];

  // Geocodifica escolas por bairro (batch, com delay para não sobrecarregar Nominatim)
  const escolasComCoord = [];
  const distancias = [];

  // Usa coordenadas pré-definidas dos bairros principais de SP
  const coordsBairros = {
    "pinheiros": [-23.5663, -46.6904],
    "perdizes": [-23.5362, -46.6695],
    "alto de pinheiros": [-23.5441, -46.7101],
    "morumbi": [-23.6186, -46.7178],
    "vila mariana": [-23.5883, -46.6367],
    "higienópolis": [-23.5457, -46.6568],
    "jardim paulista": [-23.5680, -46.6599],
    "jardim américa": [-23.5714, -46.6673],
    "mooca": [-23.5495, -46.5993],
    "vila madalena": [-23.5554, -46.6897],
    "centro": [-23.5505, -46.6333],
    "ipiranga": [-23.5906, -46.6117],
    "cambuci": [-23.5697, -46.6167],
    "são bernardo do campo": [-23.6939, -46.5650],
    "cidade jardim": [-23.5890, -46.6980],
    "usp": [-23.5595, -46.7310],
    "são paulo (várias unidades)": [-23.5505, -46.6333],
    "são paulo (varios bairros)": [-23.5505, -46.6333],
    "são paulo (zona norte)": [-23.4947, -46.6382],
    "são paulo (zona sul)": [-23.6500, -46.6667],
    "são paulo (zona oeste)": [-23.5500, -46.7200],
    "cidade universitária": [-23.5595, -46.7310],
    "vários bairros": [-23.5505, -46.6333],
  };

  mapaMarcadores = [];

  escolas.forEach((escola, idx) => {
    const bairroKey = (escola.bairro || "").toLowerCase().trim();
    let coords = null;

    // Tenta encontrar coordenadas pelo bairro
    for (const [key, val] of Object.entries(coordsBairros)) {
      if (bairroKey.includes(key) || key.includes(bairroKey)) {
        coords = val;
        break;
      }
    }

    if (!coords) return; // pula escolas sem bairro conhecido

    // Calcula distância
    const dist = calcularDistanciaKm(latAluno, lonAluno, coords[0], coords[1]);

    const temInteresse = moInteresses[`SP_${escola.nome}`];
    const iconEscola = L.divIcon({
      html: `<div style="background:${temInteresse ? "#EE2D67" : "#002561"};color:#fff;
                         border-radius:50%;width:30px;height:30px;
                         display:flex;align-items:center;justify-content:center;
                         font-size:15px;border:2px solid #fff;
                         box-shadow:0 2px 6px rgba(0,0,0,0.3)">
               ${temInteresse ? "❤️" : "🏫"}
             </div>`,
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker(coords, { icon: iconEscola })
      .addTo(mapaLeaflet)
      .bindPopup(`
        <div style="font-family:Montserrat,sans-serif;min-width:180px">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px">${escola.nome}</div>
          <div style="font-size:11px;color:#666;margin-bottom:4px">📍 ${escola.bairro}</div>
          <div style="font-size:11px;color:#666;margin-bottom:4px">📏 ${dist.toFixed(1)} km de você</div>
          ${escola.bolsas ? `<div style="font-size:11px;color:#333;margin-bottom:6px">💰 ${escola.bolsas}</div>` : ""}
          ${escola.link ? `<a href="${escola.link}" target="_blank" style="font-size:11px;color:#00BDF2;font-weight:700">Ver site ↗</a>` : ""}
        </div>
      `);

    mapaMarcadores.push(marker);
    escolasComCoord.push({ ...escola, coords, dist });
    distancias.push({ escola, dist, coords });
  });

  // Ordena por distância e mostra lista
  distancias.sort((a, b) => a.dist - b.dist);
  renderizarListaProximas(distancias.slice(0, 8), latAluno, lonAluno);
}

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function renderizarListaProximas(escolas, latAluno, lonAluno) {
  const container = document.getElementById("mo-mapa-lista");
  if (!container || !escolas.length) return;

  container.innerHTML = `
    <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;color:var(--navy);margin-bottom:10px">
      📍 Escolas mais próximas de você
    </div>
    ${escolas.map(({ escola, dist }) => {
      const chave = "SP_" + escola.nome;
      const temInteresse = moInteresses[chave];
      return `
        <div class="mo-proxima-card">
          <div class="mo-proxima-dist">
            <div class="mo-proxima-dist-num">${dist.toFixed(1)}</div>
            <div class="mo-proxima-dist-label">km</div>
          </div>
          <div class="mo-proxima-info">
            <div class="mo-proxima-nome">${escola.nome}</div>
            <div class="mo-proxima-sub">📍 ${escola.bairro || ""} · ${escola.tipo || ""}</div>
            ${escola.bolsas ? `<div class="mo-proxima-sub">💰 ${escola.bolsas}</div>` : ""}
          </div>
          <button class="mo-interesse-btn${temInteresse ? " ativo" : ""}"
            onclick="toggleMOInteresseRapido('${chave}', '${escola.nome.replace(/'/g,"\'")}', '${window._alunoRA || ""}')"
            style="flex-shrink:0;padding:8px 12px">
            ${temInteresse ? "❤️" : "🤍"}
          </button>
        </div>`;
    }).join("")}
  `;
}

function toggleMOInteresseRapido(chave, nome, ra) {
  const idx = -1; // sem idx específico
  if (moInteresses[chave]) {
    delete moInteresses[chave];
    const plano = carregarMOPlano(ra);
    delete plano[chave];
    salvarMOPlano(ra, plano);
  } else {
    moInteresses[chave] = { nome, data: new Date().toISOString() };
    const plano = carregarMOPlano(ra);
    plano[chave] = { nome, etapa: "interesse", data_atualizacao: new Date().toISOString() };
    salvarMOPlano(ra, plano);
    showToast("Adicionado ao seu plano! 🎉");
  }
  try { sessionStorage.setItem("mo_interesses_" + ra, JSON.stringify(moInteresses)); } catch(e) {}
  atualizarContadorMO(ra);
  renderizarPainelMO(ra);
  // Re-renderiza lista
  const btn = event?.target;
  if (btn) {
    const tem = moInteresses[chave];
    btn.textContent = tem ? "❤️" : "🤍";
    btn.classList.toggle("ativo", !!tem);
  }
}

// =============================================================
//  PLANO DE VESTIBULAR — 3º EM
// =============================================================

// Cursos carregados dinamicamente do simulador
const MODALIDADES_VEST = ['Particular — Vestibular Próprio', 'SISU (ENEM)', 'Provão Paulista', 'Pública — Vestibular Próprio', 'PROUNI (ENEM)'];

let CURSOS_GUIA = ["Carregando..."];

const GUIA_URL = "https://script.google.com/macros/s/AKfycbzty1jMjCZWCdneXerbgnPV6EyiAvwVCsUDrViaX25hKvfmkrJ_ilSWmUe4LZpUlcHXLQ/exec";

let UNIVERSIDADES_GUIA = ["Carregando..."];

// Cursos e universidades serão carregados do CSV do Guia de Carreiras
// URL será configurada quando a planilha for publicada
// Carrega cursos e universidades do Guia de Carreiras via action=guia
let _guiaCarregado = false;

async function carregarGuia() {
  if (_guiaCarregado) return;
  try {
    const data = await fetchSimulador({ action: "guia" });
    if (data?.cursos?.length) {
      CURSOS_GUIA = [...data.cursos, "Outro"];
    }
    if (data?.universidades?.length) {
      UNIVERSIDADES_GUIA = [...data.universidades, "Outra"];
    }
    _guiaCarregado = true;
    console.log("[Guia] Cursos:", CURSOS_GUIA.length, "| Universidades:", UNIVERSIDADES_GUIA.length);
  } catch(e) {
    console.warn("[Guia] Erro:", e);
    CURSOS_GUIA = ["Outro"];
    UNIVERSIDADES_GUIA = ["Outra"];
  }
}

async function carregarCursosGuia() {
  await carregarGuia();
}

async function carregarUniversidadesGuia() {
  await carregarGuia();
}

function carregarPlanoVest(ra) {
  try {
    const salvo = sessionStorage.getItem("vest_plano_" + ra);
    return salvo ? JSON.parse(salvo) : {};
  } catch(e) { return {}; }
}

function salvarPlanoVest(ra, plano) {
  try {
    sessionStorage.setItem("vest_plano_" + ra, JSON.stringify(plano));
  } catch(e) {}
}

async function renderizarPlanoVestibular(ra) {
  const container = document.getElementById("vest-plano-container");
  if (!container) return;

  // Cursos e universidades serão carregados sob demanda

  const plano = carregarPlanoVest(ra);
  const candidaturas = Object.entries(plano);

  container.innerHTML = `
    <!-- Formulário para adicionar candidatura -->
    <div style="background:var(--bg);border-radius:var(--r-md);padding:16px;margin-bottom:16px;border:1.5px solid var(--border)">
      <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;color:var(--navy);margin-bottom:12px">
        ➕ Adicionar candidatura
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">

        <!-- Curso -->
        <div>
          <label style="font-size:11px;font-weight:700;color:var(--text2);font-family:Montserrat,sans-serif;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px">Curso</label>
          <select id="vest-curso-select" onchange="toggleVestOutroCurso()"
            style="width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--r-sm);font-size:13px;font-family:Lato,sans-serif;background:var(--white);color:var(--navy);outline:none">
            <option value="">Selecione um curso...</option>
            ${CURSOS_GUIA.map(c => `<option value="${c}">${c}</option>`).join("")}
            ${CURSOS_GUIA.includes("Outro") ? "" : `<option value="Outro">Outro</option>`}
          </select>
          <input type="text" id="vest-curso-outro" placeholder="Digite o curso..."
            style="display:none;width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--r-sm);font-size:13px;font-family:Lato,sans-serif;margin-top:6px;box-sizing:border-box;outline:none">
        </div>

        <!-- Universidade -->
        <div>
          <label style="font-size:11px;font-weight:700;color:var(--text2);font-family:Montserrat,sans-serif;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px">Universidade</label>
          <select id="vest-universidade-select" onchange="toggleVestOutraUniv()"
            style="width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--r-sm);font-size:13px;font-family:Lato,sans-serif;background:var(--white);color:var(--navy);outline:none">
            <option value="">Selecione a universidade...</option>
            ${UNIVERSIDADES_GUIA.map(u => `<option value="${u}">${u}</option>`).join("")}
          </select>
          <input type="text" id="vest-universidade-outro" placeholder="Digite a universidade..."
            style="display:none;width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--r-sm);font-size:13px;font-family:Lato,sans-serif;margin-top:6px;box-sizing:border-box;outline:none">
        </div>

        <!-- Processo Seletivo -->
        <div>
          <label style="font-size:11px;font-weight:700;color:var(--text2);font-family:Montserrat,sans-serif;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px">Processo Seletivo</label>
          <select id="vest-modalidade-select"
            style="width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--r-sm);font-size:13px;font-family:Lato,sans-serif;background:var(--white);color:var(--navy);outline:none">
            <option value="">Selecione o processo seletivo...</option>
            ${MODALIDADES_VEST.map(m => `<option value="${m}">${m}</option>`).join("")}
          </select>
        </div>

        <button onclick="adicionarCandidatura('${ra}')"
          style="padding:11px;background:var(--navy);color:#fff;border:none;border-radius:var(--r-sm);font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:background 0.2s"
          onmouseover="this.style.background='#004fa3'" onmouseout="this.style.background='var(--navy)'">
          Adicionar ao meu plano →
        </button>
      </div>
    </div>

    <!-- Lista de candidaturas -->
    ${candidaturas.length === 0 ? `
      <div class="mo-vazio">
        <div class="mo-vazio-icon">🎯</div>
        <div class="mo-vazio-texto">Você ainda não adicionou nenhuma candidatura.<br><span style="font-size:12px">Use o formulário acima para começar seu plano!</span></div>
      </div>` : `
      <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;color:var(--navy);margin-bottom:10px">
        📋 Minhas candidaturas (${candidaturas.length})
      </div>
      ${candidaturas.map(([chave, dados]) => renderizarCardVest(chave, dados, ra)).join("")}

      <!-- Tabela resumo -->
      ${candidaturas.length > 1 ? `
      <div style="margin-top:16px">
        <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;color:var(--navy);margin-bottom:10px">📊 Resumo</div>
        <div style="background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-md);overflow:hidden">
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="background:var(--navy);color:#fff">
                <th style="padding:8px 12px;text-align:left;font-family:Montserrat,sans-serif">Curso</th>
                <th style="padding:8px 12px;text-align:left;font-family:Montserrat,sans-serif">Universidade</th>
                <th style="padding:8px 12px;text-align:center;font-family:Montserrat,sans-serif">Modalidade</th>
                <th style="padding:8px 12px;text-align:center;font-family:Montserrat,sans-serif">Status</th>
              </tr>
            </thead>
            <tbody>
              ${candidaturas.map(([chave, dados], i) => {
                const etapa = ETAPAS_VEST.find(e => e.id === (dados.etapa || "pesquisando"));
                const corStatus = dados.etapa === "aprovado" ? "#27AE60" : dados.etapa === "nao_aprovado" ? "#F59E0B" : "#00BDF2";
                return `
                  <tr style="border-bottom:1px solid var(--border);background:${i%2===0?"var(--bg)":"var(--white)"}">
                    <td style="padding:8px 12px;color:var(--navy);font-weight:600">${dados.curso?.length > 20 ? dados.curso.slice(0,18)+"..." : dados.curso}</td>
                    <td style="padding:8px 12px;color:var(--text2)">${dados.universidade?.length > 20 ? dados.universidade.slice(0,18)+"..." : dados.universidade}</td>
                    <td style="padding:8px 12px;text-align:center"><span style="background:var(--bg);border-radius:20px;padding:2px 8px;font-size:11px;font-weight:700;font-family:Montserrat,sans-serif">${dados.modalidade || "-"}</span></td>
                    <td style="padding:8px 12px;text-align:center"><span style="background:${corStatus}22;color:${corStatus};border-radius:20px;padding:2px 8px;font-size:11px;font-weight:700;font-family:Montserrat,sans-serif">${etapa?.emoji} ${etapa?.label}</span></td>
                  </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>` : ""}
    `}
  `;
}

function renderizarCardVest(chave, dados, ra) {
  const etapaAtual = dados.etapa || "pesquisando";
  const ordemEtapas = ["pesquisando","inscrito","prova","aprovado"];
  const isNaoAprovado = etapaAtual === "nao_aprovado";
  const idxAtual = ordemEtapas.indexOf(etapaAtual);
  const pct = isNaoAprovado ? 75 : Math.round(((idxAtual + 1) / ordemEtapas.length) * 100);
  const corBarra = isNaoAprovado ? "#F59E0B" : etapaAtual === "aprovado" ? "#27AE60" : "#00BDF2";
  const historico = dados.historico || {};

  return `
    <div class="mo-plano-card" style="margin-bottom:12px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px">
        <div style="flex:1">
          <div class="mo-plano-card-nome">${dados.curso || "Curso não informado"}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px">
            🏛️ ${dados.universidade || "Universidade não informada"}
            ${dados.modalidade ? `· <span style="background:var(--bg);border-radius:20px;padding:1px 8px;font-size:11px;font-family:Montserrat,sans-serif;font-weight:700">${dados.modalidade}</span>` : ""}
          </div>
        </div>
        <button onclick="removerCandidatura('${chave}', '${ra}')"
          style="background:none;border:none;font-size:14px;cursor:pointer;color:var(--text3);padding:4px;flex-shrink:0">✕</button>
      </div>

      <!-- Barra de progresso -->
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-bottom:5px;font-family:Montserrat,sans-serif;font-weight:700">
          <span>${isNaoAprovado ? "💪 Não aprovado desta vez" : etapaAtual === "aprovado" ? "🎉 APROVADO!" : "Em andamento..."}</span>
          <span style="color:${corBarra}">${pct}%</span>
        </div>
        <div style="background:var(--border);border-radius:20px;height:8px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${corBarra};border-radius:20px;transition:width 0.5s ease"></div>
        </div>
      </div>

      <!-- Linha do tempo -->
      <div style="display:flex;flex-direction:column;gap:6px">
        ${ordemEtapas.map((etId, idx) => {
          const etapa = ETAPAS_VEST.find(e => e.id === etId);
          const feito = idxAtual >= idx && !isNaoAprovado || etapaAtual === "aprovado";
          const atual = etapaAtual === etId;
          const dataEtapa = historico[etId] ? new Date(historico[etId]).toLocaleDateString("pt-BR") : null;
          return `
            <div style="display:flex;align-items:center;gap:10px;cursor:pointer"
                 onclick="atualizarEtapaVest('${chave}', '${etId}', '${ra}')">
              <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;
                           background:${feito ? corBarra : "var(--border)"};
                           display:flex;align-items:center;justify-content:center;
                           font-size:14px;border:2px solid ${atual ? corBarra : "transparent"}">
                ${feito ? etapa.emoji : "○"}
              </div>
              <div style="flex:1">
                <div style="font-size:12px;font-family:Montserrat,sans-serif;font-weight:${atual ? "700" : "500"};
                            color:${feito ? "var(--navy)" : "var(--text3)"}">
                  ${etapa.label}
                </div>
                ${dataEtapa ? `<div style="font-size:10px;color:var(--text3)">${dataEtapa}</div>` : ""}
              </div>
              ${atual ? `<span style="font-size:10px;background:${corBarra};color:#fff;border-radius:20px;padding:2px 8px;font-family:Montserrat,sans-serif;font-weight:700">atual</span>` : ""}
            </div>`;
        }).join("")}
        <!-- Não aprovado -->
        <div style="display:flex;align-items:center;gap:10px;cursor:pointer;margin-top:4px;padding-top:8px;border-top:1px solid var(--border)"
             onclick="atualizarEtapaVest('${chave}', 'nao_aprovado', '${ra}')">
          <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;
                       background:${isNaoAprovado ? "#F59E0B" : "var(--border)"};
                       display:flex;align-items:center;justify-content:center;font-size:14px">💪</div>
          <div style="font-size:12px;font-family:Montserrat,sans-serif;font-weight:${isNaoAprovado ? "700" : "500"};
                      color:${isNaoAprovado ? "var(--navy)" : "var(--text3)"}">Não aprovado desta vez</div>
          ${isNaoAprovado ? `<span style="font-size:10px;background:#F59E0B;color:#fff;border-radius:20px;padding:2px 8px;font-family:Montserrat,sans-serif;font-weight:700">atual</span>` : ""}
        </div>
      </div>
    </div>`;
}

let _vestModalSelecionada = "";

function selecionarModalidade(modal) {
  _vestModalSelecionada = modal;
  document.querySelectorAll(".vest-modal-btn").forEach(btn => {
    const ativo = btn.dataset.modal === modal;
    btn.style.background = ativo ? "var(--navy)" : "var(--white)";
    btn.style.color = ativo ? "#fff" : "var(--text2)";
    btn.style.borderColor = ativo ? "var(--navy)" : "var(--border)";
  });
}

function toggleVestOutroCurso() {
  const sel = document.getElementById("vest-curso-select");
  const outro = document.getElementById("vest-curso-outro");
  if (sel && outro) {
    outro.style.display = sel.value === "Outro" ? "block" : "none";
  }
}

function toggleVestOutraUniv() {
  const sel = document.getElementById("vest-universidade-select");
  const outro = document.getElementById("vest-universidade-outro");
  if (sel && outro) {
    outro.style.display = sel.value === "Outra" ? "block" : "none";
  }
}

function adicionarCandidatura(ra) {
  const sel = document.getElementById("vest-curso-select");
  const outro = document.getElementById("vest-curso-outro");
  const univSel = document.getElementById("vest-universidade-select");
  const univOutro = document.getElementById("vest-universidade-outro");

  const curso = sel?.value === "Outro" ? (outro?.value?.trim() || "") : (sel?.value || "");
  const universidade = univSel?.value === "Outra"
    ? (univOutro?.value?.trim() || "")
    : (univSel?.value || "");
  const modalidade = document.getElementById('vest-modalidade-select')?.value || '';

  if (!curso) { showToast("Selecione um curso!"); return; }
  if (!universidade) { showToast("Digite a universidade!"); return; }
  if (!modalidade) { showToast("Selecione a modalidade!"); return; }

  const plano = carregarPlanoVest(ra);
  const chave = `${curso}_${universidade}_${Date.now()}`.replace(/[^a-zA-ZÀ-ÿ0-9_]/g, "_");

  plano[chave] = {
    curso, universidade, modalidade,
    etapa: "pesquisando",
    historico: { pesquisando: new Date().toISOString() },
    data_criacao: new Date().toISOString(),
  };

  salvarPlanoVest(ra, plano);
  renderizarPlanoVestibular(ra);
  salvarVestNoScript(ra, curso, universidade, modalidade, "pesquisando");
  showToast("Candidatura adicionada! 🎯");

  // Limpa formulário
  if (sel) sel.value = "";
  if (outro) { outro.value = ""; outro.style.display = "none"; }
  if (univSel) univSel.value = "";
  if (univOutro) { univOutro.value = ""; univOutro.style.display = "none"; }
  const modalSel = document.getElementById("vest-modalidade-select");
  if (modalSel) modalSel.value = "";
}

function atualizarEtapaVest(chave, etapaId, ra) {
  const plano = carregarPlanoVest(ra);
  if (!plano[chave]) return;

  const agora = new Date().toISOString();
  plano[chave].etapa = etapaId;
  plano[chave].data_atualizacao = agora;
  if (!plano[chave].historico) plano[chave].historico = {};
  if (!plano[chave].historico[etapaId]) plano[chave].historico[etapaId] = agora;

  salvarPlanoVest(ra, plano);
  renderizarPlanoVestibular(ra);
  salvarVestNoScript(ra, plano[chave].curso, plano[chave].universidade, plano[chave].modalidade, etapaId);

  const msgs = {
    inscrito:     "Inscrição registrada! 📋",
    prova:        "Prova registrada! Arrasou! 📝",
    aprovado:     "🎉 PARABÉNS! APROVADO!",
    nao_aprovado: "Não foi dessa vez. Continue firme! 💪",
  };
  if (msgs[etapaId]) showToast(msgs[etapaId]);
}

function removerCandidatura(chave, ra) {
  const plano = carregarPlanoVest(ra);
  delete plano[chave];
  salvarPlanoVest(ra, plano);
  renderizarPlanoVestibular(ra);
}

function trocarAbaVest(aba) {
  document.querySelectorAll("[data-aba]").forEach(btn => {
    if (btn.closest("#vest-abas-wrap")) {
      btn.classList.toggle("ativo", btn.dataset.aba === aba);
    }
  });
  const blocosSimulador = ["bloco-estrategia","bloco-simulador","bloco-criterios","orient-lembretes-vest","bloco-es-ismart"];
  blocosSimulador.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = aba === "simulador" ? "" : "none";
  });
  const planoWrap = document.getElementById("vest-plano-wrap");
  if (planoWrap) planoWrap.style.display = aba === "plano" ? "block" : "none";
  if (aba === "plano" && alunoAtual) {
    renderizarPlanoVestibular(alunoAtual.RA || alunoAtual.ra);
  }
}

function inicializarAbasVest(aluno) {
  const serie = normalizarSerie(aluno.serie);
  if (serie !== "3EM") return;
  const wrap = document.getElementById("vest-abas-wrap");
  if (wrap) wrap.style.display = "block";
  const plano = carregarPlanoVest(aluno.RA || aluno.ra);
  const total = Object.keys(plano).length;
  const badge = document.getElementById("vest-aba-badge");
  if (badge && total > 0) {
    badge.style.display = "inline-flex";
    badge.textContent = total;
  }
}

async function salvarVestNoScript(ra, curso, universidade, modalidade, etapa) {
  try {
    await fetch(MO_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        ra,
        nome: alunoAtual?.nome || "",
        escola: `${curso} — ${universidade}`,
        cidade: modalidade,
        etapa,
        tipo: "vestibular_3em"
      }),
    });
  } catch(e) { console.warn("[Vest Script] Erro:", e); }
}
