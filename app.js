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

function buscarRADesktop() {
  const input = document.getElementById("raInputDesktop");
  const ra = input?.value?.trim();
  const erro = document.getElementById("ra-error-desktop");
  if (!ra) return;
  const aluno = dadosCarregados[ra];
  if (aluno) {
    if (erro) erro.style.display = "none";
    sessionStorage.setItem("iol_aluno", JSON.stringify(aluno));
    identificarAluno(aluno);
  } else {
    if (erro) erro.style.display = "block";
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
  renderizarCalendarioVestibulares();
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
    destaque.item1 ? `<div class="aviso-item-detalhe">${destaque.item1}</div>` : "",
    destaque.item2 ? `<div class="aviso-item-detalhe">${destaque.item2}</div>` : "",
    destaque.item3 ? `<div class="aviso-item-detalhe">${destaque.item3}</div>` : "",
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
        <div class="recado-texto">${destaque.texto}</div>
        ${itens ? `<div class="recado-itens">${itens}</div>` : ""}
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
          ? `<div class="recado-texto-final">${destaque.texto_final}</div>`
          : ""}
        ${tags ? `<div class="recado-tags">${tags}</div>` : ""}
      </div>

    </div>

    <!-- Recados secundários -->
    ${extras && extras.length ? `
    <div class="recados-extras">
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
    const rows = parseCSVCompleto(csv);
    const sNorm = normalizarSerie(serie);
    const eventos = [];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      if (cols.length < 3) continue;

      const serieCol = (cols[0] || "").replace(/"/g,"").trim().toLowerCase();
      const isVestibular = serieCol === "vestibular";

      const paraEstaSerie = isVestibular ||
        serieCol === "todos" ||
        normalizarSerie(serieCol) === sNorm ||
        (serieCol === "ef" && ["8EF","9EF"].includes(sNorm)) ||
        (serieCol === "em" && ["1EM","2EM","3EM"].includes(sNorm));

      if (!paraEstaSerie) continue;

      const dataStr = (cols[3] || "").replace(/"/g,"").trim();
      const { dia, mes, dataISO } = parsearData(dataStr);

      eventos.push({
        serie:  serieCol,
        titulo: (cols[1] || "").replace(/"/g,"").trim(),
        texto:  (cols[2] || "").replace(/"/g,"").trim(),
        data:   dataStr, dataISO, dia, mes,
        tag1:   (cols[4] || "").replace(/"/g,"").trim(),
        item1:  (cols[5] || "").replace(/"/g,"").trim(),
        tag2:   (cols[6] || "").replace(/"/g,"").trim(),
        item2:  (cols[7] || "").replace(/"/g,"").trim(),
        tag3:   (cols[8] || "").replace(/"/g,"").trim(),
        item3:  (cols[9] || "").replace(/"/g,"").trim(),
        tipo:   isVestibular ? "vestibular" : "iol",
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
  // Atualiza botões ativos
  document.querySelectorAll(".agenda-filtro-btn").forEach(btn => {
    btn.classList.toggle("ativo", btn.dataset.filtro === filtro);
  });
  const eventos = window._agendaEventos || [];
  renderizarAgenda(eventos, filtro);
}

function renderizarAgenda(eventos, filtro) {
  const container = document.getElementById("agenda-lista");
  if (!container) return;

  // Renderiza filtros se ainda não existem
  let filtrosEl = document.getElementById("agenda-filtros");
  if (!filtrosEl) {
    filtrosEl = document.createElement("div");
    filtrosEl.id = "agenda-filtros";
    filtrosEl.style.cssText = "display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap";
    filtrosEl.innerHTML = `
      <button class="agenda-filtro-btn ativo" data-filtro="todos"
        onclick="filtrarAgenda('todos')"
        style="padding:6px 14px;border-radius:20px;border:1.5px solid var(--blue);
               background:var(--blue);color:#fff;font-size:12px;font-family:Montserrat,sans-serif;
               font-weight:700;cursor:pointer">
        Todos
      </button>
      <button class="agenda-filtro-btn" data-filtro="iol"
        onclick="filtrarAgenda('iol')"
        style="padding:6px 14px;border-radius:20px;border:1.5px solid var(--border);
               background:var(--bg);color:var(--text1);font-size:12px;font-family:Montserrat,sans-serif;
               font-weight:700;cursor:pointer">
        📚 IOL
      </button>
      <button class="agenda-filtro-btn" data-filtro="vestibular"
        onclick="filtrarAgenda('vestibular')"
        style="padding:6px 14px;border-radius:20px;border:1.5px solid var(--border);
               background:var(--bg);color:var(--text1);font-size:12px;font-family:Montserrat,sans-serif;
               font-weight:700;cursor:pointer">
        🎓 Vestibulares
      </button>
    `;
    container.parentNode.insertBefore(filtrosEl, container);
  }

  // Atualiza estilo dos botões ativos
  filtrosEl.querySelectorAll(".agenda-filtro-btn").forEach(btn => {
    const ativo = btn.dataset.filtro === (filtro || "todos");
    btn.style.background = ativo ? "var(--blue)" : "var(--bg)";
    btn.style.color      = ativo ? "#fff" : "var(--text1)";
    btn.style.borderColor= ativo ? "var(--blue)" : "var(--border)";
  });

  // Filtra eventos
  const lista = filtro === "todos" ? eventos
    : eventos.filter(ev => ev.tipo === filtro);

  if (!lista.length) {
    container.innerHTML = `<p style="color:var(--text2);font-size:13px;padding:16px 0;text-align:center">
      Nenhum evento encontrado.
    </p>`;
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
      ? `<div style="font-size:11px;color:var(--text2);margin-top:4px">${itens.join(" · ")}</div>`
      : "";

    return `
      <div class="agenda-item${isVest ? " agenda-item-vestibular" : ""}">
        <div class="agenda-date">
          <span class="agenda-day">${ev.dia}</span>
          <span class="agenda-month">${ev.mes}</span>
        </div>
        <div class="agenda-info">
          <div class="agenda-titulo">${ev.titulo}</div>
          ${ev.texto ? `<div class="agenda-subtitulo">${ev.texto}</div>` : ""}
          ${itensHtml}
          <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:4px">${tags}</div>
        </div>
      </div>`;
  }).join("");
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
  if (!ehEM || !notaAluno) {
    container.style.display = "none";
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

function renderizarCalendarioVestibulares() {
  const container = document.getElementById("orient-calendario-vest");
  if (!container || typeof VESTIBULARES_2026 === "undefined") return;

  // Ordem dos meses
  const ordemMes = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  const corTipo = {
    enem:    { bg:"#FEF9E7", cor:"#B7950B", label:"ENEM"    },
    fuvest:  { bg:"#EBF4FF", cor:"#1A5276", label:"FUVEST"  },
    unicamp: { bg:"#EAFAF0", cor:"#1A7A4A", label:"UNICAMP" },
    unesp:   { bg:"#FDF2F8", cor:"#7D3C98", label:"UNESP"   },
    ita:     { bg:"#FDFEFE", cor:"#2C3E50", label:"ITA"      },
    ime:     { bg:"#F0F3F4", cor:"#2C3E50", label:"IME"      },
    federal: { bg:"#EBF5FB", cor:"#1A6FA0", label:"FEDERAL" },
    privada: { bg:"#FEF5E7", cor:"#A04000", label:"PRIVADA" },
  };

  // Agrupa por mês
  const porMes = {};
  VESTIBULARES_2026.forEach(v => {
    if (!porMes[v.mes]) porMes[v.mes] = [];
    porMes[v.mes].push(v);
  });

  const mesesComDados = Object.keys(porMes).sort((a,b) => ordemMes.indexOf(a) - ordemMes.indexOf(b));

  container.innerHTML = `
    <div style="background:#F8F9FA;border-radius:12px;padding:20px;border:1.5px solid #E5E7EB">
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px">
        <span style="font-size:26px">📅</span>
        <div>
          <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:15px;color:#002561">
            Calendário de Vestibulares 2026/2027
          </div>
          <div style="font-size:12px;color:#666;margin-top:2px">
            Datas oficiais · Mantenha sempre atualizado com seu tutor
          </div>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">
        ${Object.entries(corTipo).map(([k,v]) => `
          <span style="background:${v.bg};color:${v.cor};border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;font-family:Montserrat,sans-serif">
            ${v.label}
          </span>`).join("")}
      </div>

      ${mesesComDados.map(mes => `
        <div style="margin-bottom:14px">
          <div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:12px;color:#002561;
                      text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;padding-bottom:4px;
                      border-bottom:2px solid #002561">
            ${mes}
          </div>
          ${porMes[mes].map(v => {
            const c = corTipo[v.tipo] || corTipo.federal;
            return `
              <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 10px;
                          background:${c.bg};border-radius:8px;margin-bottom:6px">
                <div style="flex-shrink:0;width:28px;text-align:center">
                  <div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:14px;color:${c.cor}">${v.dia}</div>
                </div>
                <div style="flex:1">
                  <div style="font-size:13px;font-weight:700;color:#002561;font-family:Montserrat,sans-serif">${v.evento}</div>
                  <div style="font-size:11px;color:#666;margin-top:2px">${v.detalhe}</div>
                </div>
                <span style="background:${c.bg};color:${c.cor};border:1px solid ${c.cor};border-radius:20px;
                             padding:2px 8px;font-size:10px;font-weight:700;font-family:Montserrat,sans-serif;
                             flex-shrink:0;white-space:nowrap">
                  ${c.label}
                </span>
              </div>`;
          }).join("")}
        </div>`).join("")}

      <div style="background:#EBF4FF;border-radius:8px;padding:10px 12px;font-size:12px;color:#1A5276;margin-top:4px">
        ⚠️ Datas sujeitas a alteração. Sempre confirme nos sites oficiais antes de se inscrever.
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
