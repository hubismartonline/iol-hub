// =============================================================
//  APP.JS — Hub do Aluno · Ismart Online
//  Lógica principal: RA, navegação, renderização, busca, WhatsApp
// =============================================================
 
// -------------------------------------------------------
//  ESTADO GLOBAL
// -------------------------------------------------------
let alunoAtual = null;
 
// -------------------------------------------------------
//  INICIALIZAÇÃO
// -------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Verifica se há aluno salvo (sessão)
  const raSalvo = sessionStorage.getItem("iol_ra");
  if (raSalvo && ALUNOS[raSalvo]) {
    identificarAluno(raSalvo, false);
  }
 
  // Saudação por horário
  atualizarSaudacao();
 
  // Foco automático no campo RA
  const raInput = document.getElementById("raInput");
  if (raInput && !raSalvo) {
    setTimeout(() => raInput.focus(), 400);
  }
});
 
// -------------------------------------------------------
//  SAUDAÇÃO POR HORÁRIO
// -------------------------------------------------------
function atualizarSaudacao() {
  const hora = new Date().getHours();
  let saudacao = "Bom dia! ☀️";
  if (hora >= 12 && hora < 18) saudacao = "Boa tarde! 🌤️";
  if (hora >= 18) saudacao = "Boa noite! 🌙";
 
  const el = document.getElementById("header-greeting");
  if (el) el.textContent = saudacao;
}
 
// -------------------------------------------------------
//  BUSCA POR RA
// -------------------------------------------------------
function buscarRA() {
  const input = document.getElementById("raInput");
  const ra = input ? input.value.trim() : "";
  const erro = document.getElementById("ra-error");
 
  if (!ra) {
    input && input.focus();
    return;
  }
 
  // Mostra loading breve
  mostrarLoading(true);
 
  // Simula latência (em produção: fetch ao Google Sheets)
  setTimeout(() => {
    mostrarLoading(false);
 
    if (ALUNOS[ra]) {
      sessionStorage.setItem("iol_ra", ra);
      identificarAluno(ra, true);
      if (erro) erro.style.display = "none";
    } else {
      if (erro) erro.style.display = "block";
      if (input) {
        input.style.borderColor = "var(--pink)";
        setTimeout(() => { input.style.borderColor = ""; }, 2000);
      }
    }
  }, 600);
}
 
// -------------------------------------------------------
//  IDENTIFICAR ALUNO + RENDERIZAR HUB
// -------------------------------------------------------
function identificarAluno(ra, animado) {
  const aluno = ALUNOS[ra];
  if (!aluno) return;
 
  alunoAtual = aluno;
 
  // Atualiza header
  document.getElementById("ra-header-section").style.display = "none";
  const perfil = document.getElementById("student-profile");
  perfil.style.display = "block";
  document.getElementById("student-name").textContent = aluno.nome;
  document.getElementById("badge-serie").textContent =
    `${aluno.serie} · Turma ${aluno.turma} · ${aluno.cidade}`;
 
  // Renderiza conteúdo
  renderizarTutor(aluno);
  renderizarPlataformas(aluno);
  renderizarGuias(aluno);
  renderizarAgenda();
  renderizarFAQ();
  renderizarContatos();
  renderizarAvisos();
 
  // Esconde tela de boas-vindas
  const welcome = document.getElementById("welcome-screen");
  if (welcome) welcome.classList.add("hidden");
 
  // Mostra main
  const main = document.getElementById("main-content");
  main.style.display = "block";
  if (animado) {
    main.style.opacity = "0";
    main.style.transform = "translateY(10px)";
    main.style.transition = "opacity 0.4s, transform 0.4s";
    setTimeout(() => {
      main.style.opacity = "1";
      main.style.transform = "translateY(0)";
    }, 50);
    showToast(`Bem-vindo(a), ${aluno.nome.split(" ")[0]}! 🎉`);
  }
}
 
// -------------------------------------------------------
//  SAIR
// -------------------------------------------------------
function sair() {
  sessionStorage.removeItem("iol_ra");
  alunoAtual = null;
  document.getElementById("student-profile").style.display = "none";
  document.getElementById("ra-header-section").style.display = "block";
  const welcome = document.getElementById("welcome-screen");
  if (welcome) welcome.classList.remove("hidden");
  document.getElementById("main-content").style.display = "none";
  document.getElementById("raInput").value = "";
  document.getElementById("ra-error").style.display = "none";
  trocarAba("home");
  showToast("Até logo! 👋");
}
 
// -------------------------------------------------------
//  ABRIR WHATSAPP DO TUTOR
// -------------------------------------------------------
function abrirWhatsApp() {
  if (!alunoAtual) {
    showToast("Identifique-se com seu RA primeiro.");
    return;
  }
  const msg = encodeURIComponent(alunoAtual.tutor_msg);
  const url = `https://wa.me/${alunoAtual.tutor_wpp}?text=${msg}`;
  window.open(url, "_blank", "noopener");
}
 
function abrirWhatsAppContato(wpp, msg) {
  const url = `https://wa.me/${wpp}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank", "noopener");
}
 
// -------------------------------------------------------
//  NAVEGAÇÃO POR ABAS
// -------------------------------------------------------
function trocarAba(nomeAba) {
  // Tabs
  document.querySelectorAll(".tab").forEach(t => {
    t.classList.toggle("active", t.dataset.tab === nomeAba);
  });
 
  // Conteúdos
  document.querySelectorAll(".tab-content").forEach(c => {
    c.classList.toggle("active", c.id === `tab-${nomeAba}`);
  });
 
  // Fechar busca
  fecharBusca();
 
  // Scroll suave para o topo do conteúdo
  const tabs = document.getElementById("tabs-nav");
  if (tabs) tabs.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
 
// -------------------------------------------------------
//  RENDERIZAÇÕES
// -------------------------------------------------------
 
// AVISOS
function renderizarAvisos() {
  if (!AVISOS) return;
  const d = AVISOS.destaque;
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl("aviso-titulo", d.titulo);
  setEl("aviso-texto", d.texto);
  setEl("aviso-data", d.data);
 
  const lista = document.getElementById("avisos-lista");
  if (lista && AVISOS.lista) {
    lista.innerHTML = AVISOS.lista.map(a => `
      <div class="aviso-item">
        <div class="aviso-item-tag">${a.tag}</div>
        <p class="aviso-item-texto">${a.texto}</p>
      </div>
    `).join("");
  }
}
 
// TUTOR
function renderizarTutor(aluno) {
  document.getElementById("tutor-avatar").textContent = aluno.tutor_iniciais;
  document.getElementById("tutor-name").textContent = aluno.tutor;
  document.getElementById("tutor-turma").textContent = `${aluno.serie} — Turma ${aluno.turma}`;
}
 
// PLATAFORMAS — Home (grid 2 colunas)
function renderizarPlataformas(aluno) {
  const plataformasFiltradas = PLATAFORMAS.filter(p =>
    p.series.includes(aluno.serie)
  );
 
  // Grid home (máx 4)
  const gridHome = document.getElementById("platforms-home");
  if (gridHome) {
    gridHome.innerHTML = plataformasFiltradas.slice(0, 4).map(p => `
      <a class="platform-card" href="${p.url}" target="_blank" rel="noopener">
        <div class="platform-icon" style="background:${p.cor_bg}">${p.icon}</div>
        <div class="platform-name">${p.nome}</div>
        <div class="platform-desc">${p.desc}</div>
      </a>
    `).join("");
  }
 
  // Lista completa (aba plataformas)
  const full = document.getElementById("platforms-full");
  if (full) {
    full.innerHTML = plataformasFiltradas.map(p => `
      <a class="platform-card-full" href="${p.url}" target="_blank" rel="noopener">
        <div class="platform-icon" style="background:${p.cor_bg}">${p.icon}</div>
        <div class="platform-info">
          <div class="platform-name">${p.nome}</div>
          <div class="platform-desc">${p.desc}</div>
        </div>
        <span class="platform-arrow">›</span>
      </a>
    `).join("");
  }
}
 
// GUIAS
function renderizarGuias(aluno) {
  const container = document.getElementById("guias-lista");
  if (!container) return;
 
  container.innerHTML = GUIAS.map(grupo => {
    const itensFiltrados = grupo.itens.filter(item =>
      item.series.includes(aluno.serie)
    );
    if (itensFiltrados.length === 0) return "";
 
    return `
      <div class="guias-group">
        <div class="guias-group-title">${grupo.grupo}</div>
        ${itensFiltrados.map(item => `
          <a class="guia-item" href="${item.url}" target="_blank" rel="noopener">
            <div class="guia-icon" style="background:${item.cor_bg}">${item.icon}</div>
            <div class="guia-info">
              <div class="guia-name">${item.nome}</div>
              <div class="guia-desc">${item.desc}</div>
            </div>
            <span style="color:var(--text3);font-size:18px">›</span>
          </a>
        `).join("")}
      </div>
    `;
  }).join("");
}
 
// AGENDA
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
    </div>
  `).join("");
}
 
// FAQ
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
    </div>
  `).join("");
}
 
function toggleFaq(i) {
  const item = document.getElementById(`faq-${i}`);
  if (item) item.classList.toggle("open");
}
 
function abrirFaq(pergunta) {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item, i) => {
    const texto = item.querySelector(".faq-q span")?.textContent;
    if (texto === pergunta) item.classList.add("open");
  });
}
 
// CONTATOS
function renderizarContatos() {
  const container = document.getElementById("contatos-lista");
  if (!container) return;
 
  container.innerHTML = CONTATOS.map(c => `
    <div class="contato-item" onclick="abrirWhatsAppContato('${c.wpp}', '${c.msg.replace(/'/g,"\\'")}')">
      <div class="contato-icon" style="background:${c.cor_bg}">${c.icon}</div>
      <div class="contato-info">
        <div class="contato-nome">${c.nome}</div>
        <div class="contato-desc">${c.desc}</div>
      </div>
      <span class="contato-action">💬</span>
    </div>
  `).join("");
}
 
// -------------------------------------------------------
//  BUSCA GLOBAL
// -------------------------------------------------------
function filtrarConteudo(query) {
  const resultsEl = document.getElementById("search-results");
  if (!resultsEl) return;
 
  if (!query || query.length < 2) {
    resultsEl.style.display = "none";
    return;
  }
 
  const q = query.toLowerCase();
  const matches = SEARCH_INDEX.filter(item =>
    item.texto.toLowerCase().includes(q)
  ).slice(0, 6);
 
  if (matches.length === 0) {
    resultsEl.innerHTML = `<div class="search-result-item"><div class="search-result-text" style="color:var(--text2)">Nenhum resultado encontrado.</div></div>`;
    resultsEl.style.display = "block";
    return;
  }
 
  resultsEl.innerHTML = matches.map((m, i) => `
    <div class="search-result-item" onclick="executarBusca(${i})">
      <div class="search-result-cat">${m.cat}</div>
      <div class="search-result-text">${destacar(m.texto, q)}</div>
    </div>
  `).join("");
 
  // Guarda matches no estado temporário
  window._searchMatches = matches;
  resultsEl.style.display = "block";
}
 
function executarBusca(i) {
  const match = window._searchMatches && window._searchMatches[i];
  if (match && match.acao) {
    match.acao();
    fecharBusca();
    document.getElementById("searchInput").value = "";
  }
}
 
function fecharBusca() {
  const r = document.getElementById("search-results");
  if (r) r.style.display = "none";
}
 
function destacar(texto, query) {
  const re = new RegExp(`(${query})`, "gi");
  return texto.replace(re, "<strong>$1</strong>").slice(0, 80);
}
 
// Fecha busca ao clicar fora
document.addEventListener("click", e => {
  if (!e.target.closest(".search-section")) fecharBusca();
});
 
// -------------------------------------------------------
//  TOAST
// -------------------------------------------------------
let toastTimer = null;
 
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}
 
// -------------------------------------------------------
//  LOADING
// -------------------------------------------------------
function mostrarLoading(show) {
  const el = document.getElementById("loading-overlay");
  if (el) el.style.display = show ? "flex" : "none";
}
 
// -------------------------------------------------------
//  ENTER no campo de RA
// -------------------------------------------------------
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.activeElement.id === "raInput") {
    buscarRA();
  }
});
 
