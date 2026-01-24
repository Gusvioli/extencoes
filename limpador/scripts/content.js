document.addEventListener("DOMContentLoaded", async () => {
  // Elementos
  const inputElement = document.getElementById("valorASerApagado");
  const buttonLimpar = document.getElementById("limpar");
  const buttonLimparAll = document.getElementById("limparAll");
  const resultadoElement = document.getElementById("resultado");
  const resultadoPergunta = document.getElementById("resultadoPergunta");
  const selectHistory = document.getElementById("select-History");
  const selectH2Title = document.getElementById("traduzir-titulo");
  const selectHistoryLabel = document.getElementById("labe-select-History");
  const selectDesenvolvidoPor = document.getElementById("desenvolvidopor");
  const selectLinkGusvioli = document.getElementById("linkGusvioli");
  const selectBrasil = document.getElementById("brasil");
  const selectEUA = document.getElementById("eua");
  const selectEspanha = document.getElementById("espanha");
  const selectHistexport = document.getElementById("histexport");

  resultadoElement.style.display = "none";
  resultadoPergunta.style.display = "none";

  // Traduções
  let translations = {};
  try {
    const response = await fetch("traducao.json");
    translations = await response.json();
  } catch (err) {
    resultadoElement.style.display = "block";
    resultadoElement.textContent = "Erro ao carregar traduções.";
  }

  // Idioma padrão
  if (!localStorage.getItem("traduzir")) {
    localStorage.setItem("traduzir", "pt-br");
  }

  // Atualiza idioma visual
  const updateLanguage = (lang) => {
    selectH2Title.innerText = translations[lang].titulo;
    buttonLimpar.innerText = translations[lang].limpar;
    buttonLimpar.title = translations[lang].limparTitle;
    buttonLimparAll.innerText = translations[lang].limparAll;
    buttonLimparAll.title = translations[lang].limparAllTitle;
    selectHistoryLabel.innerText = translations[lang].descricaoSelecione;
    inputElement.placeholder = translations[lang].placeholder;
    inputElement.title = translations[lang].placeholderTitle;
    selectDesenvolvidoPor.innerText = translations[lang].desenvolvidopor;
    selectDesenvolvidoPor.title = translations[lang].desenvolvidoporTitle;
    selectLinkGusvioli.title = translations[lang].desenvolvidoporTitle;
    selectHistexport.innerText = translations[lang].histexport;
  };

  updateLanguage(localStorage.getItem("traduzir"));

  // Troca de idioma
  const setLanguage = (lang) => {
    localStorage.setItem("traduzir", lang);
    updateLanguage(lang);

    // Atualize visualmente os botões de idioma, se desejar
    [selectBrasil, selectEUA, selectEspanha].forEach((btn) => {
      btn.style.opacity = "0.5";
      btn.style.cursor = "pointer";
      btn.style.pointerEvents = "auto";
    });
    if (lang === "pt-br") selectBrasil.style.opacity = "1";
    if (lang === "en") selectEUA.style.opacity = "1";
    if (lang === "es") selectEspanha.style.opacity = "1";
  };

  selectBrasil.addEventListener("click", () => setLanguage("pt-br"));
  selectEUA.addEventListener("click", () => setLanguage("en"));
  selectEspanha.addEventListener("click", () => setLanguage("es"));

  // Preenche o select com o histórico
  // Melhoria: Reduzido para 50 para não travar a abertura do popup. A busca continua global.
  chrome.history.search({ text: "", maxResults: 50 }, (results) => {
    selectHistory.innerHTML = "";
    results.forEach((item) => {
      const option = document.createElement("option");
      option.textContent =
        item.url.length > 45 ? item.url.slice(0, 45) + "..." : item.url;
      option.value = item.url;
      option.title = item.url;
      selectHistory.appendChild(option);
    });
  });

  // Ao clicar em um item do select, preenche o input
  selectHistory.addEventListener("change", (e) => {
    inputElement.value = e.target.value;
  });

  // Limpar item específico
  buttonLimpar.addEventListener("click", async (e) => {
    e.preventDefault();
    const valorDigitado = inputElement.value.trim();
    const lang = localStorage.getItem("traduzir");
    if (!valorDigitado) {
      resultadoElement.style.display = "block";
      resultadoElement.textContent = translations[lang].erroNenhumValorInserido;
      return;
    }
    if (valorDigitado.length >= 128) {
      resultadoElement.style.display = "block";
      resultadoElement.textContent = translations[lang].erroLimite128;
      return;
    }
    chrome.history.search({ text: valorDigitado }, (results) => {
      if (results.length === 0) {
        resultadoElement.style.display = "block";
        resultadoElement.textContent = `${translations[lang].ItemNaoEncontrado[0]}"${valorDigitado}"${translations[lang].ItemNaoEncontrado[1]}`;
      } else {
        resultadoElement.style.display = "block";
        results.forEach((item) => chrome.history.deleteUrl({ url: item.url }));
        resultadoElement.textContent = `${translations[lang].itemHistorico[0]}'${valorDigitado}' ${translations[lang].itemHistorico[1]}${results.length} ${translations[lang].itemHistorico[2]}`;
        inputElement.value = "";
      }
    });
  });

  // Exibir mensagem de resultado (sucesso, erro, etc)
  function mostrarResultado(mensagem, tipo = "info") {
    resultadoElement.style.display = "block";
    resultadoElement.textContent = mensagem;
    resultadoElement.style.color = tipo === "erro" ? "#c62828" : "#222";
    resultadoElement.style.background = tipo === "erro" ? "#ffebee" : "#f1f3f7";
  }

  // Exibir confirmação antes de limpar tudo
  function mostrarPerguntaConfirmacao(
    mensagem,
    onConfirmar,
    onCancelar,
    lang,
    translations,
  ) {
    resultadoPergunta.style.display = "block";
    resultadoPergunta.innerHTML = `
      <div class="pergunta-confirmacao">
        <span>${mensagem}</span>
        <div>
          <button id="confirmar">${translations[lang].confirmarSim}</button>
          <button id="noConfirmar">${translations[lang].confirmarNao}</button>
        </div>
      </div>
    `;
    document.getElementById("confirmar").onclick = () => {
      resultadoElement.style.display = "none";
      resultadoPergunta.style.display = "none";
      resultadoPergunta.innerHTML = "";
      onConfirmar();
    };
    document.getElementById("noConfirmar").onclick = () => {
      resultadoElement.style.display = "none";
      resultadoPergunta.style.display = "none";
      resultadoPergunta.innerHTML = "";
      if (onCancelar) onCancelar();
    };
  }

  // Exemplo de uso ao clicar em "Limpar Tudo"
  buttonLimparAll.addEventListener("click", (e) => {
    e.preventDefault();
    const lang = localStorage.getItem("traduzir");
    mostrarPerguntaConfirmacao(
      translations[lang].temCertezaDeletarHistorico,
      () => {
        chrome.history.deleteAll(() => {
          mostrarResultado(translations[lang].exclusaoOk);
        });
      },
      null,
      lang,
      translations,
    );
  });

  // Função para obter todo o histórico
  const getAllHistory = (callback) => {
    const allResults = [];
    const seenUrls = new Set();
    let endTime;
    const fetchHistory = () => {
      const query = { text: "", maxResults: 1000, startTime: 0 };
      if (endTime !== undefined) query.endTime = endTime;
      chrome.history.search(query, (results) => {
        results.forEach((item) => {
          if (!seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            allResults.push(item);
          }
        });

        if (results.length < 1000) {
          callback(allResults);
        } else {
          const lastItem = results[results.length - 1];
          endTime = lastItem.lastVisitTime - 1; // Subtrai 1 para garantir busca de itens mais antigos
          fetchHistory();
        }
      });
    };
    fetchHistory();
  };

  //Exibir o campo exportar histórico
  selectHistexport.addEventListener("click", (e) => {
    e.preventDefault();

    // UX: Muda o cursor para indicar processamento
    document.body.style.cursor = "wait";
    const lang = localStorage.getItem("traduzir");

    getAllHistory((results) => {
      if (results.length === 0) {
        mostrarResultado(
          translations[lang].ItemNaoEncontrado[0] +
            translations[lang].histexport +
            translations[lang].ItemNaoEncontrado[1],
          "erro",
        );
        document.body.style.cursor = "default";
        return;
      }

      // Código de convertToCSV inline
      let csvContent;
      if (results.length === 0) {
        csvContent = "";
      } else {
        const headers = Array.from(
          new Set(results.flatMap((obj) => Object.keys(obj))),
        );
        results.forEach((obj) => {
          if (obj.lastVisitTime != null) {
            obj.lastVisitTime = new Date(obj.lastVisitTime).toLocaleString(
              lang, // Melhoria: Usa o idioma selecionado para formatar a data
            );
          }
        });
        const rows = results.map((obj) => {
          return headers
            .map((header) => {
              let value =
                obj[header] === null || obj[header] === undefined
                  ? ""
                  : obj[header];
              let stringValue = String(value).replace(/"/g, '""');
              return `"${stringValue}"`;
            })
            .join(",");
        });
        csvContent = [headers.join(","), ...rows].join("\n");
      }

      const filename = `historico_navegacao.csv`;

      // Código de downloadCSV inline
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download(
        {
          url: url,
          filename: filename,
          saveAs: false,
        },
        () => {
          URL.revokeObjectURL(url);
          document.body.style.cursor = "default"; // Restaura o cursor
        },
      );
    });
  });

  // Exemplo de uso para mostrar erro
  // mostrarResultado('Digite um valor para limpar.', 'erro');
});
