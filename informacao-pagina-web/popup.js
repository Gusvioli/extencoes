document.addEventListener("DOMContentLoaded", () => {
  // Configurar abas
  const tabs = document.querySelectorAll(".tablinks");
  tabs.forEach((tab) => {
    tab.addEventListener("click", (event) => {
      openTab(event, tab.getAttribute("data-tab"));
    });
  });

  // Abrir a primeira aba por padrão
  if (tabs.length > 0) {
    tabs[0].click();
  }

  // Configurar botão de exportação
  document.getElementById("export-json").addEventListener("click", exportJson);

  // Iniciar análise da página
  analyzePage();
});

let extractedData = null;

function openTab(evt, tabName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function analyzePage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    // Verifica se temos permissão para injetar script (evita erro em páginas chrome://)
    if (
      !activeTab.url ||
      activeTab.url.startsWith("chrome://") ||
      activeTab.url.startsWith("about:") ||
      activeTab.url.includes("chrome.google.com/webstore") ||
      activeTab.url.includes("chromewebstore.google.com")
    ) {
      document.getElementById("metadata-content").textContent =
        "Não é possível analisar páginas do sistema ou a Chrome Web Store.";
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: activeTab.id },
        func: extractPageDetails,
      },
      (results) => {
        if (chrome.runtime.lastError || !results || !results[0]) {
          const errorMsg = chrome.runtime.lastError
            ? chrome.runtime.lastError.message
            : "Erro desconhecido";
          console.error("Falha na execução:", errorMsg);
          document.getElementById("metadata-content").textContent =
            "Erro ao analisar a página: " + errorMsg;
          return;
        }

        extractedData = results[0].result;
        if (extractedData && extractedData.error) {
          document.getElementById("metadata-content").textContent =
            "Erro na análise: " + extractedData.error;
          return;
        }
        displayResults(extractedData);
      },
    );
  });
}

// Esta função é executada no contexto da página web
function extractPageDetails() {
  try {
    // Metadados
    const allMeta = {};
    document.querySelectorAll("meta").forEach((meta) => {
      const name =
        meta.getAttribute("name") ||
        meta.getAttribute("property") ||
        meta.getAttribute("http-equiv");
      if (name) {
        allMeta[name] = meta.content;
      }
    });

    const metadata = {
      title: document.title,
      ...allMeta,
    };

    // Conteúdo
    const headers = [];
    ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
      document.querySelectorAll(tag).forEach((el) => {
        headers.push({ tag: tag.toUpperCase(), text: el.innerText.trim() });
      });
    });

    const links = Array.from(document.querySelectorAll("a")).map((a) => ({
      text: a.innerText.trim() || "[Sem texto]",
      href: a.href,
    }));

    // Técnico
    const perf = performance.getEntriesByType("navigation")[0] || {};

    // Detecção de tecnologias (portado de content.js)
    const scripts = Array.from(document.querySelectorAll("script[src]")).map(
      (s) => (s.src || "").toLowerCase(),
    );
    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    ).map((l) => l.href.toLowerCase());
    const technologies = new Set();

    scripts.forEach((script) => {
      if (script.includes("jquery")) technologies.add("jQuery");
      if (script.includes("react")) technologies.add("React");
      if (script.includes("angular")) technologies.add("Angular");
      if (script.includes("vue")) technologies.add("Vue");
      if (script.includes("bootstrap")) technologies.add("Bootstrap");
    });

    styles.forEach((style) => {
      if (style.includes("bootstrap")) technologies.add("Bootstrap");
    });

    let cookiesCount = 0;
    try {
      cookiesCount = document.cookie.split(";").filter((c) => c.trim()).length;
    } catch (e) {}

    let localStorageCount = 0;
    try {
      localStorageCount = localStorage.length;
    } catch (e) {}

    let sessionStorageCount = 0;
    try {
      sessionStorageCount = sessionStorage.length;
    } catch (e) {}

    const getSafe = (fn) => {
      try {
        return fn();
      } catch (e) {
        return "N/A";
      }
    };

    const technical = {
      loadTime: perf.loadEventEnd
        ? Math.round(perf.loadEventEnd - perf.startTime) + "ms"
        : "N/A",
      cookiesCount,
      localStorageCount,
      sessionStorageCount,
      browser: {
        userAgent: getSafe(() => navigator.userAgent),
        language: getSafe(() => navigator.language),
        platform: getSafe(() => navigator.platform),
        vendor: getSafe(() => navigator.vendor),
        cookieEnabled: getSafe(() => navigator.cookieEnabled),
        onLine: getSafe(() => navigator.onLine),
        hardwareConcurrency: getSafe(() => navigator.hardwareConcurrency),
        deviceMemory: getSafe(() => navigator.deviceMemory),
      },
      screen: {
        width: getSafe(() => screen.width),
        height: getSafe(() => screen.height),
        availWidth: getSafe(() => screen.availWidth),
        availHeight: getSafe(() => screen.availHeight),
        colorDepth: getSafe(() => screen.colorDepth),
        pixelDepth: getSafe(() => screen.pixelDepth),
        orientation: getSafe(() =>
          screen.orientation ? screen.orientation.type : "N/A",
        ),
      },
      location: {
        href: window.location.href,
        protocol: window.location.protocol,
        host: window.location.host,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        origin: window.location.origin,
      },
      document: {
        referrer: document.referrer,
        characterSet: document.characterSet,
        lastModified: document.lastModified,
        compatMode: document.compatMode,
        contentType: document.contentType,
        readyState: document.readyState,
      },
      technologies: Array.from(technologies),
    };

    // Oculto
    const hiddenInputs = Array.from(
      document.querySelectorAll("input[type='hidden']"),
    ).map((i) => ({
      name: i.name || i.id || "N/A",
      value: i.value,
    }));

    const comments = [];
    const iterator = document.createNodeIterator(
      document.documentElement,
      NodeFilter.SHOW_COMMENT,
    );
    let currentNode;
    while ((currentNode = iterator.nextNode())) {
      const val = currentNode.nodeValue.trim();
      if (val) comments.push(val);
    }

    const jsonLd = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    ).map((s) => {
      try {
        return JSON.parse(s.innerText);
      } catch (e) {
        return { error: "JSON inválido" };
      }
    });

    const iframes = Array.from(document.querySelectorAll("iframe")).map(
      (i) => i.src,
    );

    const hidden = {
      hiddenInputs,
      comments: comments.slice(0, 20),
      jsonLd,
      iframes,
    };

    return { metadata, content: { headers, links }, technical, hidden };
  } catch (e) {
    return { error: e.toString() };
  }
}

const fieldDescriptions = {
  title: "Título principal exibido na aba do navegador.",
  description: "Resumo do conteúdo utilizado por motores de busca.",
  keywords: "Palavras-chave definidas para indexação (SEO).",
  author: "Autor ou responsável pelo conteúdo da página.",
  headersCount: "Quantidade total de títulos (H1 a H6) encontrados.",
  linksCount: "Quantidade total de links (hiperligações) na página.",
  headersSample: "Amostra dos primeiros títulos encontrados.",
  linksSample: "Amostra dos primeiros links encontrados.",
  loadTime: "Tempo total para carregar a página (navegação).",
  cookiesCount: "Número de cookies armazenados por este site.",
  localStorageCount: "Itens salvos no armazenamento local (persistente).",
  sessionStorageCount: "Itens salvos na sessão (apaga ao fechar).",
  userAgent: "Identificação do seu navegador e sistema operacional.",
  language: "Idioma preferido configurado no navegador.",
  platform: "Plataforma do sistema operacional (ex: Win32, Linux).",
  referrer: "Endereço da página anterior que levou a esta.",
  technologies: "Bibliotecas ou frameworks detectados na página.",
  hiddenInputs: "Campos ocultos de formulários (tokens, IDs, etc).",
  comments: "Comentários HTML no código-fonte.",
  jsonLd: "Dados estruturados JSON-LD para motores de busca.",
  iframes: "Conteúdo externo carregado via iframe.",
};

function renderWithExplanations(data) {
  let html =
    '<table style="width:100%; border-collapse: collapse; font-size: 13px; font-family: sans-serif;">';
  for (const [key, value] of Object.entries(data)) {
    // Formatar a chave: camelCase para Texto Legível
    const formattedKey = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      html += `<tr style="background-color: #f8f9fa;">
        <td colspan="2" style="padding: 10px; border: 1px solid #e0e0e0;">
          <strong style="color:#1a73e8; display:block; margin-bottom:6px; font-size: 1.1em;">${formattedKey}</strong>
          <div style="padding-left:0;">${renderWithExplanations(value)}</div>
        </td>
      </tr>`;
      continue;
    }

    const desc = fieldDescriptions[key];
    let displayVal = value;
    let isHtml = false;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        displayVal =
          '<span style="color:#9aa0a6; font-style:italic;">Nenhum</span>';
        isHtml = true;
      } else if (typeof value[0] === "object") {
        isHtml = true;
        displayVal =
          '<ul style="padding-left: 0; margin: 0; list-style: none;">' +
          value
            .map((item) => {
              if (item.tag && item.text)
                return `<li style="margin-bottom:4px; padding: 4px; background: #fff; border: 1px solid #dadce0; border-radius: 4px; display: flex; align-items: baseline;"><span style="background:#e8f0fe; color: #1967d2; padding:1px 6px; border-radius:4px; font-size:0.85em; font-weight:bold; margin-right:6px; min-width: 30px; text-align: center;">${item.tag}</span> <span style="flex: 1;">${item.text}</span></li>`;
              if (item.text && item.href)
                return `<li style="margin-bottom:4px; padding: 4px; background: #fff; border: 1px solid #dadce0; border-radius: 4px;"><a href="${item.href}" target="_blank" style="text-decoration:none; color:#1a73e8; font-weight:500; display: block; margin-bottom: 2px;">${item.text}</a><span style="color:#5f6368; font-size:0.85em; word-break: break-all; display: block;">${item.href}</span></li>`;
              return `<li style="margin-bottom:3px; padding: 4px; background: #fff; border: 1px solid #dadce0; border-radius: 4px;">${Object.values(item).join(" ")}</li>`;
            })
            .join("") +
          "</ul>";
      } else {
        // Array de strings (ex: tecnologias)
        displayVal = value
          .map(
            (v) =>
              `<span style="background:#e8f0fe; color:#1a73e8; padding:2px 8px; border-radius:12px; font-size:0.9em; margin-right:4px; display:inline-block; margin-bottom:4px; border: 1px solid #d2e3fc;">${v}</span>`,
          )
          .join("");
        isHtml = true;
      }
    } else if (typeof value === "string") {
      if (value.startsWith("http")) {
        displayVal = `<a href="${value}" target="_blank" style="color:#1a73e8; word-break:break-all; text-decoration: none;">${value}</a>`;
        isHtml = true;
      } else if (value.length > 100) {
        displayVal = value.substring(0, 100) + "...";
      }
    }

    html += `<tr style="border-bottom: 1px solid #f1f3f4;">
      <td style="padding: 8px; border: 1px solid #e0e0e0; width: 35%; background-color: #fafafa; vertical-align: top;">
        <strong style="color:#202124; font-size: 0.95em;">${formattedKey}</strong>
        ${desc ? `<div style="font-size:0.8em; color:#5f6368; margin-top:4px;">${desc}</div>` : ""}
      </td>
      <td style="padding: 8px; border: 1px solid #e0e0e0; vertical-align: top; color:#3c4043; word-break:break-word;">
        ${isHtml ? displayVal : displayVal}
      </td>
    </tr>`;
  }
  html += "</table>";
  return html;
}

function displayResults(data) {
  document.getElementById("metadata-content").innerHTML =
    renderWithExplanations(data.metadata);

  // Exibir resumo do conteúdo para não poluir demais a tela
  const contentSummary = {
    headersCount: data.content.headers.length,
    linksCount: data.content.links.length,
    headersSample: data.content.headers.slice(0, 5),
    linksSample: data.content.links.slice(0, 5),
  };
  document.getElementById("content-content").innerHTML =
    renderWithExplanations(contentSummary);

  document.getElementById("technical-content").innerHTML =
    renderWithExplanations(data.technical);

  document.getElementById("hidden-content").innerHTML = renderWithExplanations(
    data.hidden,
  );
}

function exportJson() {
  if (!extractedData) return;

  const blob = new Blob([JSON.stringify(extractedData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `analise-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
