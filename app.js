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
const SIMULADOR_URL = "https://script.google.com/macros/s/AKfycbz0y6xajzzpRaXPBcu4B_uo71fpTwScEoZjhrD6iJBkJyqxR8IhM-DXqjKW4ZabAPJVOQ/exec";

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
  const dadosSalvos = sessionStorage.getItem("iol_aluno");
  if (dadosSalvos) {
    try {
      alunoAtual = JSON.parse(dadosSalvos);
      renderizarPerfil(alunoAtual);
      renderizarTudo(alunoAtual);
      carregarCadastro(alunoAtual.RA || alunoAtual.ra);
    } catch(e) { sessionStorage.removeItem("iol_aluno"); }
  } else {
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
  const linhas = csv.split("\n").slice(1);
  const mapa = {};
  for (const linha of linhas) {
    if (!linha.trim()) continue;
    const cols = parsearLinha(linha);
    if (cols.length < 5) continue;
    const ra = cols[0].trim().replace(/"/g, "");
    if (!ra) continue;
    mapa[ra] = {
      RA:             ra,
      nome:           cols[1]?.trim().replace(/"/g, "") || "",
      serie:          cols[2]?.trim().replace(/"/g, "") || "",
      cidade:         cols[3]?.trim().replace(/"/g, "") || "",
      tutor:          cols[4]?.trim().replace(/"/g, "") || "",
      tutor_wpp:      cols[5]?.trim().replace(/"/g, "") || "",
      tutor_iniciais: iniciais(cols[4]?.trim().replace(/"/g, "") || ""),
      tutor_msg:      `Oi, ${cols[4]?.trim()}! Sou ${cols[1]?.trim()} (${cols[2]?.trim()}). Preciso de ajuda com...`
    };
  }
  return mapa;
}

function parsearLinha(linha) {
  const r = []; let a = "", d = false;
  for (const c of linha) {
    if (c === '"') d = !d;
    else if (c === ',' && !d) { r.push(a); a = ""; }
    else a += c;
  }
  r.push(a);
  return r;
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
  document.getElementById("ra-header-section").style.display = "none";
  document.getElementById("welcome-screen")?.classList.add("hidden");
  document.getElementById("student-profile").style.display = "block";
  document.getElementById("student-name").textContent = aluno.nome;
  document.getElementById("badge-serie").textContent = `${aluno.serie}${aluno.cidade ? " · " + aluno.cidade : ""}`;
  document.getElementById("main-content").style.display = "block";
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
  if (serie === "9EF") {
    container.style.display = "block";
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
//  NAVEGAÇÃO
// -------------------------------------------------------
function trocarAba(nomeAba) {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === nomeAba));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.toggle("active", c.id === `tab-${nomeAba}`));
  fecharBusca();
  document.getElementById("tabs-nav")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// -------------------------------------------------------
//  RENDERIZAÇÕES
// -------------------------------------------------------
async function carregarRecados(serie) {
  try {
    const response = await fetch(RECADOS_URL);
    const csv = await response.text();
    const linhas = csv.split("\n").slice(1).filter(l => l.trim());

    // Filtra por série do aluno
    const sNorm = normalizarSerie(serie);
    const recados = [];

    for (const linha of linhas) {
      const cols = parsearLinha(linha);
      if (cols.length < 2) continue;
      const seriePlanilha = cols[0].trim().replace(/"/g, "");

      // Verifica se o recado é para esta série
      const paraEstaSerie =
        seriePlanilha.toLowerCase() === "todos" ||
        normalizarSerie(seriePlanilha) === sNorm ||
        (seriePlanilha.toUpperCase() === "EF" && ["8EF","9EF"].includes(sNorm)) ||
        (seriePlanilha.toUpperCase() === "EM" && ["1EM","2EM","3EM"].includes(sNorm));

      if (paraEstaSerie) {
        recados.push({
          titulo: cols[1]?.replace(/"/g,"").trim() || "",
          texto:  cols[2]?.replace(/"/g,"").trim() || "",
          data:   cols[3]?.replace(/"/g,"").trim() || "",
          tag1:   cols[4]?.replace(/"/g,"").trim() || "",
          item1:  cols[5]?.replace(/"/g,"").trim() || "",
          tag2:   cols[6]?.replace(/"/g,"").trim() || "",
          item2:  cols[7]?.replace(/"/g,"").trim() || "",
          tag3:   cols[8]?.replace(/"/g,"").trim() || "",
          item3:  cols[9]?.replace(/"/g,"").trim() || "",
        });
      }
    }

    if (recados.length > 0) {
      renderizarAvisos(recados[0], recados.slice(1));
    }
  } catch(e) {
    console.log("Usando avisos locais:", e);
    renderizarAvisos(AVISOS.destaque, AVISOS.lista.map(a => ({tag1: a.tag, item1: a.texto})));
  }
}

function renderizarAvisos(destaque, extras) {
  if (!destaque) return;

  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setEl("aviso-titulo", destaque.titulo || AVISOS.destaque.titulo);
  setEl("aviso-texto",  destaque.texto  || AVISOS.destaque.texto);
  setEl("aviso-data",   destaque.data   || AVISOS.destaque.data);

  const lista = document.getElementById("avisos-lista");
  if (!lista) return;

  // Itens extras do recado principal
  let itens = [];
  if (destaque.tag1 && destaque.item1) itens.push({tag: destaque.tag1, texto: destaque.item1});
  if (destaque.tag2 && destaque.item2) itens.push({tag: destaque.tag2, texto: destaque.item2});
  if (destaque.tag3 && destaque.item3) itens.push({tag: destaque.tag3, texto: destaque.item3});

  // Recados extras (outras séries/todos)
  if (extras) {
    extras.forEach(r => {
      if (r.tag1 && r.item1) itens.push({tag: r.tag1, texto: r.item1});
      if (r.tag2 && r.item2) itens.push({tag: r.tag2, texto: r.item2});
      if (r.tag3 && r.item3) itens.push({tag: r.tag3, texto: r.item3});
    });
  }

  lista.innerHTML = itens.map(a => `
    <div class="aviso-item">
      <div class="aviso-item-tag">${a.tag}</div>
      <p class="aviso-item-texto">${a.texto}</p>
    </div>`).join("");
}

function renderizarTutor(aluno) {
  // DEBUG temporário — remove após confirmar a série
  console.log("Série do aluno:", JSON.stringify(aluno.serie));
  showToast(`Série: "${aluno.serie}" → normalizada: "${normalizarSerie(aluno.serie)}"`);
  document.getElementById("tutor-avatar").textContent = aluno.tutor_iniciais || iniciais(aluno.tutor || "");
  document.getElementById("tutor-name").textContent   = aluno.tutor;
  document.getElementById("tutor-turma").textContent  = aluno.serie;
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
    const linhas = csv.split("\n").slice(1).filter(l => l.trim());
    const sNorm = normalizarSerie(serie);
    const eventos = [];

    for (const linha of linhas) {
      const cols = parsearLinha(linha);
      if (cols.length < 5) continue;

      const seriePlanilha = cols[0]?.replace(/"/g,"").trim() || "todos";
      const paraEstaSerie =
        seriePlanilha.toLowerCase() === "todos" ||
        normalizarSerie(seriePlanilha) === sNorm ||
        (seriePlanilha.toUpperCase() === "EF" && ["8EF","9EF"].includes(sNorm)) ||
        (seriePlanilha.toUpperCase() === "EM" && ["1EM","2EM","3EM"].includes(sNorm));

      if (paraEstaSerie) {
        eventos.push({
          dia:        cols[1]?.replace(/"/g,"").trim() || "",
          mes:        cols[2]?.replace(/"/g,"").trim() || "",
          titulo:     cols[3]?.replace(/"/g,"").trim() || "",
          subtitulo:  cols[4]?.replace(/"/g,"").trim() || "",
          tipo:       cols[5]?.replace(/"/g,"").trim() || "prazo",
          tipo_label: cols[6]?.replace(/"/g,"").trim() || "EVENTO",
        });
      }
    }

    renderizarAgenda(eventos.length > 0 ? eventos : AGENDA);
  } catch(e) {
    console.log("Usando agenda local:", e);
    renderizarAgenda(AGENDA);
  }
}

function renderizarAgenda(eventos) {
  const container = document.getElementById("agenda-lista");
  if (!container) return;
  const lista = eventos || AGENDA;
  container.innerHTML = lista.map(ev => `
    <div class="agenda-item">
      <div class="agenda-date">
        <span class="agenda-day">${ev.dia}</span>
        <span class="agenda-month">${ev.mes}</span>
      </div>
      <div class="agenda-info">
        <div class="agenda-titulo">${ev.titulo}</div>
        <div class="agenda-subtitulo">${ev.subtitulo}</div>
        <span class="agenda-tipo tipo-${ev.tipo}">${ev.tipo_label}</span>
      </div>
    </div>`).join("");
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
//  SIMULADOR DE VESTIBULAR — fluxo em etapas
//  1. Aluno escolhe área
//  2. Aluno escolhe carreira
//  3. Aluno escolhe estado (opcional)
//  4. Ver universidades + campus + cotas
// =============================================================

// Chamada ao Apps Script via JSONP (resolve CORS)
function chamarSimulador(params) {
  return new Promise((resolve, reject) => {
    const cbName = "_simCb_" + Date.now();
    const url = SIMULADOR_URL + "?" + new URLSearchParams(params).toString() + "&callback=" + cbName;
    window[cbName] = (data) => {
      delete window[cbName];
      document.getElementById("_sim_script")?.remove();
      resolve(data);
    };
    const script = document.createElement("script");
    script.id = "_sim_script";
    script.onerror = () => { delete window[cbName]; reject(new Error("Erro de rede")); };
    script.src = url;
    document.head.appendChild(script);
  });
}

// Alternativa fetch com no-cors fallback
async function fetchSimulador(params) {
  const url = SIMULADOR_URL + "?" + new URLSearchParams(params).toString();
  try {
    const resp = await fetch(url, { redirect: "follow" });
    return await resp.json();
  } catch(e) {
    // tenta com mode no-cors como último recurso
    throw e;
  }
}

// Estado do simulador
let simEstado = { area: "", carreira: "", uf: "todas" };

// --- ETAPA 1: Carregar áreas e mostrar formulário ---
async function iniciarSimulador() {
  if (!alunoAtual) { showToast("Identifique-se com seu RA primeiro."); return; }
  simMostrarLoading("Carregando áreas de interesse...");
  try {
    const data = await fetchSimulador({ action: "areas" });
    simEsconderLoading();
    if (data.erro) { showToast(data.erro); return; }
    renderizarEtapa1(data.areas);
  } catch(e) {
    simEsconderLoading();
    showToast("Erro ao conectar. Verifique sua conexão e tente novamente.");
  }
}

function renderizarEtapa1(areas) {
  const el = document.getElementById("simulador-resultado");
  el.style.display = "block";
  document.getElementById("simulador-form").style.display = "none";

  el.innerHTML = `
    <div class="sim-etapa-header">
      <span class="sim-etapa-badge">Passo 1 de 3</span>
      <div class="sim-etapa-titulo">Qual área te interessa?</div>
      <div class="sim-etapa-sub">Apenas carreiras recomendadas pelo Ismart para universidades públicas</div>
    </div>
    <div class="sim-areas-grid">
      ${areas.map(a => `
        <button class="sim-area-btn" onclick="escolherArea('${a}')">
          ${iconeArea(a)} ${a}
        </button>`).join("")}
    </div>
    <button class="sim-voltar" onclick="resetarSimulador()">← Voltar</button>
  `;
}

function iconeArea(area) {
  const mapa = { "Exatas": "📐", "Humanas": "📖", "Medicina": "⚕️", "Tecnologia": "💻", "Biológicas": "🔬", "Interdisciplinar": "🔀" };
  return mapa[area] || "🎓";
}

// --- ETAPA 2: Escolher carreira ---
async function escolherArea(area) {
  simEstado.area = area;
  simMostrarLoading("Buscando carreiras de " + area + "...");
  try {
    const data = await fetchSimulador({ action: "carreiras", area });
    simEsconderLoading();
    if (data.erro) { showToast(data.erro); return; }
    renderizarEtapa2(area, data.carreiras);
  } catch(e) {
    simEsconderLoading();
    showToast("Erro ao buscar carreiras. Tente novamente.");
  }
}

function renderizarEtapa2(area, carreiras) {
  const el = document.getElementById("simulador-resultado");
  el.innerHTML = `
    <div class="sim-etapa-header">
      <span class="sim-etapa-badge">Passo 2 de 3</span>
      <div class="sim-etapa-titulo">Qual carreira você quer explorar?</div>
      <div class="sim-etapa-sub">Área: <strong>${area}</strong></div>
    </div>
    <div class="sim-carreiras-lista">
      ${carreiras.map(c => `
        <button class="sim-carreira-btn" onclick="escolherCarreira('${c.replace(/'/g,"\\'")}')">
          ${c} <span class="sim-carreira-arrow">›</span>
        </button>`).join("")}
    </div>
    <button class="sim-voltar" onclick="iniciarSimulador()">← Voltar</button>
  `;
}

// --- ETAPA 3: Escolher estado ---
function escolherCarreira(carreira) {
  simEstado.carreira = carreira;
  const el = document.getElementById("simulador-resultado");
  el.innerHTML = `
    <div class="sim-etapa-header">
      <span class="sim-etapa-badge">Passo 3 de 3</span>
      <div class="sim-etapa-titulo">Prefere algum estado?</div>
      <div class="sim-etapa-sub">Carreira: <strong>${carreira}</strong></div>
    </div>
    <div class="sim-ufs-grid">
      ${["todas","SP","RJ","MG","RS","PR","SC","DF","BA","CE","PE","GO","SC"].map(uf => `
        <button class="sim-uf-btn" onclick="buscarUniversidades('${uf}')">
          ${uf === "todas" ? "🗺️ Qualquer estado" : uf}
        </button>`).join("")}
    </div>
    <button class="sim-voltar" onclick="escolherArea('${simEstado.area}')">← Voltar</button>
  `;
}

// --- RESULTADO: Universidades + campus + cotas ---
async function buscarUniversidades(uf) {
  simEstado.uf = uf;
  simMostrarLoading("Buscando universidades...");
  try {
    const data = await fetchSimulador({
      action: "universidades",
      carreira: simEstado.carreira,
      uf
    });
    simEsconderLoading();
    if (data.erro) { showToast(data.erro); return; }
    renderizarUniversidades(data);
  } catch(e) {
    simEsconderLoading();
    showToast("Erro ao buscar universidades. Tente novamente.");
  }
}

function renderizarUniversidades(data) {
  const el = document.getElementById("simulador-resultado");
  const { universidades, aviso } = data;
  const ufLabel = simEstado.uf === "todas" ? "todos os estados" : simEstado.uf;

  if (!universidades || !universidades.length) {
    el.innerHTML = `
      <div class="sim-etapa-header">
        <div class="sim-etapa-titulo">📋 ${simEstado.carreira}</div>
        <div class="sim-etapa-sub">${aviso || "Nenhuma universidade encontrada para os critérios selecionados."}</div>
      </div>
      <div class="sim-dica-geo">💡 Tente ampliar para outros estados — há mais opções disponíveis!</div>
      <button class="sim-voltar" onclick="escolherCarreira('${simEstado.carreira.replace(/'/g,"\\'")}')">← Escolher outro estado</button>
      <button class="wpp-btn outline" onclick="resetarSimulador()" style="margin-top:10px;width:100%">🔄 Nova busca</button>
    `;
    return;
  }

  el.innerHTML = `
    <div class="sim-etapa-header">
      <div class="sim-etapa-titulo">📋 ${simEstado.carreira}</div>
      <div class="sim-etapa-sub">${universidades.length} universidade(s) recomendada(s) pelo Ismart · ${ufLabel}</div>
    </div>
    <div class="sim-unis-lista">
      ${universidades.map((u, i) => {
        const ampla = u.modalidades.find(m => m.tipo.toLowerCase().includes("ampla"));
        const cotas = u.modalidades.filter(m => !m.tipo.toLowerCase().includes("ampla"));
        return `
        <div class="sim-uni-card" id="simuni-${i}">
          <div class="sim-uni-header" onclick="toggleSimUni(${i})">
            <div class="sim-uni-info">
              <div class="sim-uni-sigla">${u.ies}</div>
              <div class="sim-uni-nome">${u.nomeIES}</div>
              <div class="sim-uni-local">📍 ${u.cidade} · ${u.uf}${u.turno ? " · " + u.turno : ""}</div>
            </div>
            <div class="sim-uni-right">
              ${ampla ? `<div class="sim-uni-nota-corte">${ampla.notaCorte.toFixed(1)}</div><div class="sim-uni-nota-label">nota de corte</div>` : ""}
              <span class="sim-cat-chevron">›</span>
            </div>
          </div>
          <div class="sim-uni-detalhe" id="simuni-det-${i}">
            <div class="sim-mod-titulo">Modalidades de concorrência:</div>
            ${u.modalidades.map(m => `
              <div class="sim-mod-item ${m.tipo.toLowerCase().includes("ampla") ? "ampla" : "cota"}">
                <div class="sim-mod-tipo">${m.tipo}</div>
                <div class="sim-mod-dados">
                  <span>Nota de corte: <strong>${m.notaCorte.toFixed(1)}</strong></span>
                  <span>Vagas: <strong>${m.vagas}</strong></span>
                </div>
              </div>`).join("")}
            ${cotas.length ? `<div class="sim-cotas-aviso">✅ Esta universidade oferece ${cotas.length} modalidade(s) de cota — você pode se qualificar!</div>` : ""}
          </div>
        </div>`;
      }).join("")}
    </div>
    <div class="sim-dica-geo">💡 Considere ampliar para outros estados — mais opções = mais chances de aprovação!</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">
      <button class="sim-voltar" onclick="escolherCarreira('${simEstado.carreira.replace(/'/g,"\\'")}')">← Escolher outro estado</button>
      <button class="wpp-btn outline" onclick="resetarSimulador()">🔄 Nova busca</button>
    </div>
  `;
}

function toggleSimUni(i) {
  const det = document.getElementById(`simuni-det-${i}`);
  const card = document.getElementById(`simuni-${i}`);
  if (det) {
    const aberto = det.style.display === "block";
    det.style.display = aberto ? "none" : "block";
    card?.classList.toggle("open", !aberto);
  }
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
  simEstado = { area: "", carreira: "", uf: "todas" };
  document.getElementById("simulador-resultado").style.display = "none";
  document.getElementById("simulador-loading").style.display   = "none";
  document.getElementById("simulador-form").style.display      = "flex";
}

function toggleSimCat(id) {
  document.getElementById(`simcat-${id}`)?.classList.toggle("open");
}

function resetarSimulador() {
  document.getElementById("simulador-resultado").style.display = "none";
  document.getElementById("simulador-form").style.display      = "flex";
  document.getElementById("simNota").value = "";
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
