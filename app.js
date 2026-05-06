// =============================================================
//  APP.JS — Hub do Aluno · Ismart Online
// =============================================================

// -------------------------------------------------------
//  CONFIGURAÇÃO
// -------------------------------------------------------
// Planilha 1 — tutores (CSV público)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSKNO5Y95tm1siowcKImRyPmrrzKTOAMFjIPniSNPIp5TFTQ08mcIpKDEIRIpOb4BRGA1gHHWKwYVY/pub?gid=0&single=true&output=csv";

// Planilha 2 — cadastro completo (Apps Script seguro)
const CADASTRO_URL = "https://script.google.com/macros/s/AKfycbxhwZfOXqWgsoxA0G7ZAcGEqgYaPXKAcnjLOg_iZ3STTOkSB5rrtvbKeOq48xSqNr1X/exec";

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
  renderizarPlataformas(aluno);
  renderizarGuias(aluno);
  renderizarAgenda();
  renderizarFAQ();
  renderizarContatos();
  renderizarAvisos();
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
  showToast("Até logo! 👋");
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
function renderizarAvisos() {
  if (!AVISOS) return;
  const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  s("aviso-titulo", AVISOS.destaque.titulo);
  s("aviso-texto",  AVISOS.destaque.texto);
  s("aviso-data",   AVISOS.destaque.data);
  const lista = document.getElementById("avisos-lista");
  if (lista) lista.innerHTML = AVISOS.lista.map(a => `
    <div class="aviso-item">
      <div class="aviso-item-tag">${a.tag}</div>
      <p class="aviso-item-texto">${a.texto}</p>
    </div>`).join("");
}

function renderizarTutor(aluno) {
  document.getElementById("tutor-avatar").textContent = aluno.tutor_iniciais || iniciais(aluno.tutor || "");
  document.getElementById("tutor-name").textContent   = aluno.tutor;
  document.getElementById("tutor-turma").textContent  = aluno.serie;
}

function renderizarPlataformas(aluno) {
  const filtradas = PLATAFORMAS.filter(p => p.series.includes(aluno.serie));
  const gridHome = document.getElementById("platforms-home");
  if (gridHome) gridHome.innerHTML = filtradas.slice(0, 4).map(p => `
    <a class="platform-card" href="${p.url}" target="_blank" rel="noopener">
      <div class="platform-icon" style="background:${p.cor_bg}">${p.icon}</div>
      <div class="platform-name">${p.nome}</div>
      <div class="platform-desc">${p.desc}</div>
    </a>`).join("");
  const full = document.getElementById("platforms-full");
  if (full) full.innerHTML = filtradas.map(p => `
    <a class="platform-card-full" href="${p.url}" target="_blank" rel="noopener">
      <div class="platform-icon" style="background:${p.cor_bg}">${p.icon}</div>
      <div class="platform-info">
        <div class="platform-name">${p.nome}</div>
        <div class="platform-desc">${p.desc}</div>
      </div>
      <span class="platform-arrow">›</span>
    </a>`).join("");
}

function renderizarGuias(aluno) {
  const container = document.getElementById("guias-lista");
  if (!container) return;
  container.innerHTML = GUIAS.map(grupo => {
    const itens = grupo.itens.filter(i => i.series.includes(aluno.serie));
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
  }).join("");
}

function renderizarAgenda() {
  const container = document.getElementById("agenda-lista");
  if (!container) return;
  container.innerHTML = AGENDA.map(ev => `
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

function renderizarContatos() {
  const container = document.getElementById("contatos-lista");
  if (!container) return;
  container.innerHTML = CONTATOS.map(c => {
    const onclick = c.tipo === "link"
      ? `window.open('${c.url}','_blank','noopener')`
      : `abrirWhatsAppContato('${c.wpp}','${(c.msg||"").replace(/'/g,"\\'")}')`;
    const iconeAcao = c.tipo === "link" ? "↗️" : "💬";
    return `
      <div class="contato-item" onclick="${onclick}">
        <div class="contato-icon" style="background:${c.cor_bg}">${c.icon}</div>
        <div class="contato-info">
          <div class="contato-nome">${c.nome}</div>
          <div class="contato-desc">${c.desc}</div>
        </div>
        <span class="contato-action">${iconeAcao}</span>
      </div>`;
  }).join("");
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
