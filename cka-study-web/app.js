const sourcePath = "../CURSO-CKA-claude.txt";

const state = {
  modules: [],
  activeModule: null,
  query: "",
};

const els = {
  nav: document.querySelector("#moduleNav"),
  content: document.querySelector("#courseContent"),
  overview: document.querySelector("#overview"),
  title: document.querySelector("#pageTitle"),
  search: document.querySelector("#searchInput"),
  searchState: document.querySelector("#searchState"),
  menuButton: document.querySelector("#menuButton"),
  expandAll: document.querySelector("#expandAll"),
  collapseAll: document.querySelector("#collapseAll"),
};

init();

async function init() {
  bindEvents();

  try {
    const response = await fetch(sourcePath, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${sourcePath}`);
    }
    const text = await response.text();
    state.modules = parseCourse(text);
    state.activeModule = state.modules[0]?.id || null;
    render();
  } catch (error) {
    els.title.textContent = "No se pudo cargar el material";
    els.content.innerHTML = `
      <div class="empty">
        Abre esta pagina desde un servidor local para que el navegador pueda leer CURSO-CKA-claude.txt.
        <br>Ejemplo: python3 -m http.server 8000
      </div>
    `;
    console.error(error);
  }
}

function bindEvents() {
  els.search.addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    renderContent();
  });

  els.menuButton.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-open");
  });

  els.expandAll.addEventListener("click", () => setAllSections(true));
  els.collapseAll.addEventListener("click", () => setAllSections(false));

  document.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy]");
    if (!copyButton) return;

    const panel = copyButton.closest(".code-panel");
    const code = panel?.querySelector("code")?.textContent || "";
    navigator.clipboard.writeText(code).then(() => {
      copyButton.textContent = "Copiado";
      setTimeout(() => {
        copyButton.textContent = "Copiar";
      }, 1200);
    });
  });
}

function parseCourse(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const moduleStarts = [];

  lines.forEach((line, index) => {
    if (/^MODULO:\s*M\d+/i.test(line.trim())) {
      const previousSeparators = [];
      for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
        if (/^=+$/.test(lines[cursor].trim())) previousSeparators.push(cursor);
        if (previousSeparators.length === 2) break;
      }
      const start = previousSeparators[1] ?? previousSeparators[0] ?? index;
      moduleStarts.push(start);
    }
  });

  return moduleStarts.map((start, idx) => {
    const end = moduleStarts[idx + 1] ?? lines.length;
    const moduleLines = trimEmpty(lines.slice(start, end));
    const moduleCode = findValue(moduleLines, "MODULO") || `M${String(idx).padStart(2, "0")}`;
    const title = extractModuleTitle(moduleLines, moduleCode);
    const meta = extractMeta(moduleLines);
    const sections = parseSections(moduleLines);
    return {
      id: slug(moduleCode),
      code: moduleCode,
      title,
      meta,
      sections,
      raw: moduleLines.join("\n"),
    };
  });
}

function extractModuleTitle(lines, moduleCode) {
  const moduleIndex = lines.findIndex((line) => /^MODULO:/i.test(line.trim()));
  const before = lines.slice(0, Math.max(moduleIndex, 0)).filter((line) => {
    const value = line.trim();
    return value && !/^=+$/.test(value);
  });
  const joined = before.join(" ").replace(/\s+/g, " ").trim();
  if (joined) return joined;
  return `${moduleCode} - Modulo de estudio`;
}

function extractMeta(lines) {
  const keys = ["TIPO", "ENTORNO", "PRERREQUISITOS", "PESO EN EXAMEN", "TIEMPO ESTIMADO"];
  return keys
    .map((key) => {
      const value = findValue(lines, key);
      return value ? { key, value } : null;
    })
    .filter(Boolean);
}

function findValue(lines, key) {
  const line = lines.find((entry) => entry.trim().toUpperCase().startsWith(`${key}:`));
  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
}

function parseSections(lines) {
  const starts = [];
  lines.forEach((line, index) => {
    const current = line.trim();
    const previous = lines[index - 1]?.trim() || "";
    const next = lines[index + 1]?.trim() || "";
    const isDecoratedHeading = current && /^-+$/.test(previous) && /^-+$/.test(next);
    const isUnderlinedHeading = current && /^-+$/.test(next) && !/^[-=]+$/.test(current);
    if ((isDecoratedHeading || isUnderlinedHeading) && !current.includes("<<'EOF'")) {
      starts.push(index);
    }
  });

  const uniqueStarts = [...new Set(starts)].filter((index) => !/^[-=]+$/.test(lines[index].trim()));

  if (!uniqueStarts.length) {
    return [{ title: "Contenido", blocks: parseBlocks(lines) }];
  }

  return uniqueStarts.map((start, idx) => {
    const end = uniqueStarts[idx + 1] ?? lines.length;
    const title = lines[start].trim();
    const bodyStart = /^-+$/.test(lines[start + 1]?.trim()) ? start + 2 : start + 1;
    return {
      title,
      blocks: parseBlocks(lines.slice(bodyStart, end)),
    };
  }).filter((section) => section.blocks.length);
}

function parseBlocks(lines) {
  const blocks = [];
  let buffer = [];
  let code = [];
  let inCode = false;
  let inHeredoc = false;

  const flushText = () => {
    const text = trimEmpty(buffer).join("\n").trim();
    if (text) blocks.push(classifyTextBlock(text));
    buffer = [];
  };

  const flushCode = () => {
    const text = trimEmpty(code).join("\n");
    if (text.trim()) blocks.push({ type: "code", text });
    code = [];
  };

  lines.forEach((line) => {
    const value = line.trim();
    const startsCode = isCodeStart(line);

    if (!inCode && startsCode) {
      flushText();
      inCode = true;
      inHeredoc = value.includes("<<'EOF'") || value.includes('<<"EOF"') || value.includes("<<EOF");
      code.push(line);
      return;
    }

    if (inCode) {
      if (inHeredoc) {
        code.push(line);
        if (value === "EOF") {
          flushCode();
          inCode = false;
          inHeredoc = false;
        }
        return;
      }

      const previous = code[code.length - 1] || "";
      const continuesCode = startsCode || line.startsWith("  ") || line.startsWith("\t") || previous.trim().endsWith("\\");

      if (!value) {
        flushCode();
        inCode = false;
        return;
      }

      if (!continuesCode || isPlainHeading(value)) {
        flushCode();
        inCode = false;
        buffer.push(line);
        return;
      }

      code.push(line);
      return;
    }

    buffer.push(line);
  });

  if (inCode) flushCode();
  flushText();
  return blocks;
}

function isCodeStart(line) {
  const value = line.trim();
  return /^(kubectl|k |cat |vim |source |alias |export |complete |sudo |systemctl|journalctl|crictl|etcdctl|kubeadm|curl |wget |apt |apt-get |modprobe |sysctl |mkdir |cp |mv |rm |grep |awk |openssl |watch |ssh |scp |containerd|swapoff|sed |echo )/.test(value)
    || value.startsWith("#")
    || value.includes("<<'EOF'")
    || /^[-\w.]+:\s*[\w"{[]/.test(value)
    || /^\s{2,}[-\w.]+:/.test(line);
}

function isPlainHeading(value) {
  return /^[A-Z0-9 .,:ÁÉÍÓÚÑ-]{4,}$/.test(value) && !value.startsWith("#") && !value.includes(": ");
}

function classifyTextBlock(text) {
  const first = text.split("\n")[0].trim().toUpperCase();
  if (first.includes("NOTA") || first.includes("IMPORTANTE") || first.includes("TRUCO") || first.includes("REGLA")) {
    return { type: "note", text };
  }
  if (first.includes("TAREA") || first.includes("OBJETIVO:")) {
    return { type: "task", text };
  }
  if (first.includes("CRITERIOS DE EXITO") || first.includes("CHECKPOINT")) {
    return { type: "success", text };
  }
  return { type: "text", text };
}

function render() {
  renderNav();
  renderOverview();
  renderContent();
}

function renderNav() {
  els.nav.innerHTML = state.modules.map((module) => `
    <button class="nav-item ${module.id === state.activeModule ? "active" : ""}" type="button" data-module="${module.id}">
      <span class="nav-code">${escapeHtml(module.code)}</span>
      <span class="nav-title">${escapeHtml(module.title)}</span>
    </button>
  `).join("");

  els.nav.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeModule = button.dataset.module;
      document.body.classList.remove("sidebar-open");
      renderNav();
      renderContent();
      document.querySelector(`#${state.activeModule}`)?.scrollIntoView({ block: "start" });
    });
  });
}

function renderOverview() {
  const sectionCount = state.modules.reduce((total, module) => total + module.sections.length, 0);
  const codeCount = state.modules.reduce((total, module) => {
    return total + module.sections.reduce((sectionTotal, section) => {
      return sectionTotal + section.blocks.filter((block) => block.type === "code").length;
    }, 0);
  }, 0);

  els.overview.innerHTML = `
    <article class="stat-card"><strong>${state.modules.length}</strong><span>Modulos detectados</span></article>
    <article class="stat-card"><strong>${sectionCount}</strong><span>Secciones navegables</span></article>
    <article class="stat-card"><strong>${codeCount}</strong><span>Bloques de comandos</span></article>
    <article class="stat-card"><strong>Local</strong><span>Sin modificar el TXT original</span></article>
  `;
}

function renderContent() {
  const query = state.query.toLowerCase();
  const modules = state.modules.filter((module) => !query || module.raw.toLowerCase().includes(query));
  const active = state.modules.find((module) => module.id === state.activeModule) || state.modules[0];
  els.title.textContent = query ? `Resultados para "${state.query}"` : active?.title || "Curso CKA";

  els.searchState.hidden = !query;
  if (query) {
    els.searchState.textContent = `${modules.length} modulo(s) con coincidencias.`;
  }

  if (!modules.length) {
    els.content.innerHTML = `<div class="empty">No hay resultados para esa busqueda.</div>`;
    return;
  }

  els.content.innerHTML = modules.map((module) => renderModule(module, query)).join("");
  els.content.querySelectorAll(".module-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const body = button.closest(".module").querySelector(".module-body");
      const hidden = body.hidden;
      body.hidden = !hidden;
      button.textContent = hidden ? "−" : "+";
    });
  });
}

function renderModule(module, query) {
  const sections = module.sections
    .filter((section) => !query || section.title.toLowerCase().includes(query) || section.blocks.some((block) => block.text.toLowerCase().includes(query)));

  return `
    <article id="${module.id}" class="module">
      <header class="module-header">
        <div>
          <p class="eyebrow">${escapeHtml(module.code)}</p>
          <h3>${highlight(module.title, query)}</h3>
          <div class="module-meta">
            ${module.meta.map((item) => `<span class="pill">${escapeHtml(item.key)}: ${escapeHtml(item.value)}</span>`).join("")}
          </div>
        </div>
        <button class="module-toggle" type="button" aria-label="Contraer modulo">−</button>
      </header>
      <div class="module-body">
        ${sections.map((section, index) => renderSection(section, query, index < 2 || Boolean(query))).join("")}
      </div>
    </article>
  `;
}

function renderSection(section, query, open) {
  const blocks = section.blocks.filter((block) => !query || block.text.toLowerCase().includes(query) || section.title.toLowerCase().includes(query));
  return `
    <details class="section-card" ${open ? "open" : ""}>
      <summary>${highlight(section.title, query)}</summary>
      <div class="section-content">
        ${blocks.map((block) => renderBlock(block, query)).join("")}
      </div>
    </details>
  `;
}

function renderBlock(block, query) {
  if (block.type === "code") {
    return `
      <div class="code-panel">
        <div class="code-toolbar">
          <span>Terminal / YAML</span>
          <button class="copy-button" type="button" data-copy>Copiar</button>
        </div>
        <pre><code>${highlight(block.text, query)}</code></pre>
      </div>
    `;
  }

  const className = {
    note: "note-block",
    task: "task-block",
    success: "success-block",
    text: "text-block",
  }[block.type];
  return `<p class="${className}">${highlight(block.text, query)}</p>`;
}

function setAllSections(open) {
  document.querySelectorAll(".section-card").forEach((details) => {
    details.open = open;
  });
}

function trimEmpty(lines) {
  const copy = [...lines];
  while (copy.length && !copy[0].trim()) copy.shift();
  while (copy.length && !copy[copy.length - 1].trim()) copy.pop();
  return copy;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function highlight(value, query) {
  const safe = escapeHtml(value);
  if (!query) return safe;
  const escapedQuery = escapeRegExp(escapeHtml(query));
  return safe.replace(new RegExp(`(${escapedQuery})`, "gi"), "<mark>$1</mark>");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
