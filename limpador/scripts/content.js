document.addEventListener('DOMContentLoaded', async () => {
  // Elementos
  const inputElement = document.getElementById('valorASerApagado');
  const buttonLimpar = document.getElementById('limpar');
  const buttonLimparAll = document.getElementById('limparAll');
  const resultadoElement = document.getElementById('resultado');
  const resultadoPergunta = document.getElementById('resultadoPergunta');
  const selectHistory = document.getElementById('select-History');
  const selectHistoryLabel = document.getElementById('labe-select-History');
  const selectH2Title = document.getElementById('traduzir-titulo');
  const selectLimpar = document.getElementById('limpar');
  const selectLimparAll = document.getElementById('limparAll');
  const selectDescricaoSelecione = document.getElementById('labe-select-History');
  const selectValorASerApagado = document.getElementById('valorASerApagado');
  const selectDesenvolvidoPor = document.getElementById('desenvolvidopor');
  const selectLinkGusvioli = document.getElementById('linkGusvioli');
  const selectBrasil = document.getElementById('brasil');
  const selectEUA = document.getElementById('eua');
  const selectEspanha = document.getElementById('espanha');

  resultadoElement.style.display = 'none';
  resultadoPergunta.style.display = 'none';

  // Traduções
  let translations = {};
  try {
    const response = await fetch('traducao.json');
    translations = await response.json();
  } catch (err) {
    resultadoElement.style.display = 'block';
    resultadoElement.textContent = "Erro ao carregar traduções.";
  }

  // Idioma padrão
  if (!localStorage.getItem('traduzir')) {
    localStorage.setItem('traduzir', 'pt-br');
  }

  // Atualiza idioma visual
  const updateLanguage = (lang) => {
    selectH2Title.innerText = translations[lang].titulo;
    selectLimpar.innerText = translations[lang].limpar;
    selectLimpar.title = translations[lang].limparTitle;
    selectLimparAll.innerText = translations[lang].limparAll;
    selectLimparAll.title = translations[lang].limparAllTitle;
    selectDescricaoSelecione.innerText = translations[lang].descricaoSelecione;
    selectValorASerApagado.placeholder = translations[lang].placeholder;
    selectValorASerApagado.title = translations[lang].placeholderTitle;
    selectDesenvolvidoPor.innerText = translations[lang].desenvolvidopor;
    selectDesenvolvidoPor.title = translations[lang].desenvolvidoporTitle;
    selectLinkGusvioli.title = translations[lang].desenvolvidoporTitle;
  };

  updateLanguage(localStorage.getItem('traduzir'));

  // Troca de idioma
  const setLanguage = (lang) => {
    localStorage.setItem('traduzir', lang);
    updateLanguage(lang);

    // Atualize visualmente os botões de idioma, se desejar
    [selectBrasil, selectEUA, selectEspanha].forEach(btn => {
      btn.style.opacity = '0.5';
      btn.style.cursor = 'pointer';
      btn.style.pointerEvents = 'auto';
    });
    if (lang === 'pt-br') selectBrasil.style.opacity = '1';
    if (lang === 'en') selectEUA.style.opacity = '1';
    if (lang === 'es') selectEspanha.style.opacity = '1';
  };

  selectBrasil.addEventListener('click', () => setLanguage('pt-br'));
  selectEUA.addEventListener('click', () => setLanguage('en'));
  selectEspanha.addEventListener('click', () => setLanguage('es'));

  // Preenche o select com o histórico
  chrome.history.search({ text: '', maxResults: 1000 }, (results) => {
    selectHistory.innerHTML = '';
    results.forEach(item => {
      const option = document.createElement('option');
      option.textContent = item.url.length > 45 ? item.url.slice(0, 45) + '...' : item.url;
      option.value = item.url;
      option.title = item.url;
      selectHistory.appendChild(option);
    });
  });

  // Ao clicar em um item do select, preenche o input
  selectHistory.addEventListener('change', (e) => {
    inputElement.value = e.target.value;
  });

  // Limpar item específico
  buttonLimpar.addEventListener('click', async (e) => {
    e.preventDefault();
    const valorDigitado = inputElement.value.trim();
    const lang = localStorage.getItem('traduzir');
    if (!valorDigitado) {
    resultadoElement.style.display = 'block';
      resultadoElement.textContent = translations[lang].erroNenumValorInserido;
      return;
    }
    if (valorDigitado.length >= 128) {
    resultadoElement.style.display = 'block';
      resultadoElement.textContent = translations[lang].erroLimite128;
      return;
    }
    chrome.history.search({ text: valorDigitado }, (results) => {
      if (results.length === 0) {
    resultadoElement.style.display = 'block';
        resultadoElement.textContent = `${translations[lang].ItemNaoEncontrado[0]}"${valorDigitado}"${translations[lang].ItemNaoEncontrado[1]}`;
      } else {
    resultadoElement.style.display = 'block';
        results.forEach(item => chrome.history.deleteUrl({ url: item.url }));
        resultadoElement.textContent = `${translations[lang].itemHistorico[0]}'${valorDigitado}' ${translations[lang].itemHistorico[1]}${results.length} ${translations[lang].itemHistorico[2]}`;
        inputElement.value = '';
      }
    });
  });

  // Limpar todo o histórico
  buttonLimparAll.addEventListener('click', (e) => {
    e.preventDefault();
    const lang = localStorage.getItem('traduzir');
    resultadoElement.style.display = 'none';
    resultadoPergunta.innerHTML = `
      <div class="pergunta-confirmacao">
        <span>${translations[lang].temCertezaDeletarHistorico}</span>
        <button id="confirmar">${translations[lang].comfirmarSim}</button>
        <button id="noConfirmar">${translations[lang].comfirmarNao}</button>
      </div>
    `;
    document.getElementById('confirmar').onclick = () => {
      chrome.history.deleteAll(() => {
      resultadoElement.style.display = 'none';
      resultadoPergunta.style.display = 'none';
        resultadoElement.textContent = translations[lang].excluzaoOk;
        resultadoPergunta.innerHTML = '';
      });
    };
    document.getElementById('noConfirmar').onclick = () => {
      resultadoElement.style.display = 'none';
      resultadoPergunta.style.display = 'none';
      resultadoPergunta.innerHTML = '';
    };
  });

  // Exibir mensagem de resultado (sucesso, erro, etc)
  function mostrarResultado(mensagem, tipo = 'info') {
    resultadoElement.style.display = 'block';
    resultadoElement.textContent = mensagem;
    resultadoElement.style.color = tipo === 'erro' ? '#c62828' : '#222';
    resultadoElement.style.background = tipo === 'erro' ? '#ffebee' : '#f1f3f7';
  }

  // Exibir confirmação antes de limpar tudo
  function mostrarPerguntaConfirmacao(mensagem, onConfirmar, onCancelar, lang, translations) {
  resultadoPergunta.style.display = 'block';
    resultadoPergunta.innerHTML = `
      <div class="pergunta-confirmacao">
        <span>${mensagem}</span>
        <div>
          <button id="confirmar">${translations[lang].comfirmarSim}</button>
          <button id="noConfirmar">${translations[lang].comfirmarNao}</button>
        </div>
      </div>
    `;
    document.getElementById('confirmar').onclick = () => {
      resultadoElement.style.display = 'none';
      resultadoPergunta.style.display = 'none';
      resultadoPergunta.innerHTML = '';
      onConfirmar();
    };
    document.getElementById('noConfirmar').onclick = () => {
      resultadoElement.style.display = 'none';
      resultadoPergunta.style.display = 'none';
      resultadoPergunta.innerHTML = '';
      if (onCancelar) onCancelar();
    };
  }

  // Exemplo de uso ao clicar em "Limpar Tudo"
  buttonLimparAll.addEventListener('click', (e) => {
    e.preventDefault();
    const lang = localStorage.getItem('traduzir');
    mostrarPerguntaConfirmacao(
      translations[lang].temCertezaDeletarHistorico,
      () => {
        chrome.history.deleteAll(() => {
          mostrarResultado(translations[lang].excluzaoOk);
        });
      },
      null,
      lang,
      translations
    );
  });

  // Exemplo de uso para mostrar erro
  // mostrarResultado('Digite um valor para limpar.', 'erro');
});