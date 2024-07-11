    document.addEventListener('DOMContentLoaded', function () {
    const inputElement = document.getElementById('valorASerApagado');
    const buttonElementLimpar = document.getElementById('limpar');
    const buttonElementLimparAll = document.getElementById('limparAll');
    const resultadoElement = document.getElementById('resultado');

    const selectHistory = document.getElementById('select-History');
    const selectHistoryLabel = document.getElementById('labe-select-History');
    
    const selectH2Title = document.getElementById('traduzir-titulo');
    const selectLimpar = document.getElementById('limpar');
    const selectLimparAll = document.getElementById('limparAll');
    const selectdescricaoSelecione = document.getElementById('labe-select-History');
    const selectvalorASerApagado = document.getElementById('valorASerApagado');
    const selectdesenvolvidopor = document.getElementById('desenvolvidopor');
    const selectlinkGusvioli = document.getElementById('linkGusvioli');
    const selectInterrogacao = document.getElementById('interrogacao');

    const selectBrasil = document.getElementById('brasil');
    const selectEUA = document.getElementById('eua');
    const selectEspanha = document.getElementById('espanha');


    const data = new Promise((resolve, reject) => {
        fetch('traducao.json')
            .then(response => {
                return response.json();
            })
            .then(jsonData => {
                resolve(jsonData);
            })
            .catch(err => {
                reject(err);
            });
    });

    localStorage.getItem('traduzir') === 'pt-br' ? selectBrasil.style.opacity = '1' : selectBrasil.style.opacity = '0.5';
    localStorage.getItem('traduzir') === 'en' ? selectEUA.style.opacity = '1' : selectEUA.style.opacity = '0.5';
    localStorage.getItem('traduzir') === 'es' ? selectEspanha.style.opacity = '1' : selectEspanha.style.opacity = '0.5';

    if (!localStorage.getItem('traduzir')) {
        localStorage.setItem('traduzir', 'pt-br');
    }

    selectBrasil.addEventListener('click', function (e) {
        localStorage.setItem('traduzir', 'pt-br');
        selectBrasil.style.opacity = '1';
        selectBrasil.style.cursor = 'pointer';
        selectBrasil.style.pointerEvents = 'all';
        selectEUA.style.opacity = '0.5';
        selectEUA.style.cursor = 'not-allowed';
        selectEUA.style.pointerEvents = 'none';
        selectEspanha.style.opacity = '0.5';
        selectEspanha.style.cursor = 'not-allowed';
        selectEspanha.style.pointerEvents = 'none';
    });

    selectEUA.addEventListener('click', function (e) {
        localStorage.setItem('traduzir', 'en');
        selectEUA.style.opacity = '1';
        selectEUA.style.cursor = 'pointer';
        selectEUA.style.pointerEvents = 'all';
        selectBrasil.style.opacity = '0.5';
        selectBrasil.style.cursor = 'not-allowed';
        selectBrasil.style.pointerEvents = 'none';
        selectEspanha.style.opacity = '0.5';
        selectEspanha.style.cursor = 'not-allowed';
        selectEspanha.style.pointerEvents = 'none';
    });

    selectEspanha.addEventListener('click', function (e) {
        localStorage.setItem('traduzir', 'es');
        selectEspanha.style.opacity = '1';
        selectEspanha.style.cursor = 'pointer';
        selectEspanha.style.pointerEvents = 'all';
        selectBrasil.style.opacity = '0.5';
        selectBrasil.style.cursor = 'not-allowed';
        selectBrasil.style.pointerEvents = 'none';
        selectEUA.style.opacity = '0.5';
        selectEUA.style.cursor = 'not-allowed';
        selectEUA.style.pointerEvents = 'none';
    });

    document.getElementById('brasil').addEventListener('click', function() {
        chrome.runtime.reload();
    });

    document.getElementById('eua').addEventListener('click', function() {
        chrome.runtime.reload();
    });

    document.getElementById('espanha').addEventListener('click', function() {
        chrome.runtime.reload();
    });
    
    data.then((jsonData) => {
        selectH2Title.innerText = jsonData[localStorage.getItem('traduzir')].titulo;
        selectLimpar.innerText = jsonData[localStorage.getItem('traduzir')].limpar;
        selectLimpar.title = jsonData[localStorage.getItem('traduzir')].limparTitle;
        selectLimparAll.innerText = jsonData[localStorage.getItem('traduzir')].limparAll;
        selectLimparAll.title = jsonData[localStorage.getItem('traduzir')].limparAllTitle;
        selectdescricaoSelecione.innerText = jsonData[localStorage.getItem('traduzir')].descricaoSelecione;
        selectvalorASerApagado.placeholder = jsonData[localStorage.getItem('traduzir')].placeholder;
        selectvalorASerApagado.title = jsonData[localStorage.getItem('traduzir')].placeholderTitle;
        selectdesenvolvidopor.innerText = jsonData[localStorage.getItem('traduzir')].desenvolvidopor;
        selectdesenvolvidopor.title = jsonData[localStorage.getItem('traduzir')].desenvolvidoporTitle;
        selectInterrogacao.title = jsonData[localStorage.getItem('traduzir')].interrogacaoTitle;
        selectlinkGusvioli.title = jsonData[localStorage.getItem('traduzir')].desenvolvidoporTitle;
    });   
    

    chrome.history.search({text: '', maxResults: 1000}, (results) => {
        for (let i = 0; i < results.length; i+=1) {
            const option = document.createElement('option', { id: 'option' });
            selectHistory.appendChild(option);
            option.textContent = results[i].url.slice(0, 45) + '...';
            option.value = results[i].url.slice(0, 127);
            option.style.fontSize = '14px';
            option.style.padding = '5px';
            option.style.margin = '5px';
            option.style.height = 'auto';
            option.title = results[i].url;
        }
    });

    selectHistory.addEventListener('click', function (e) {
        inputElement.value = e.target.value;
    });

    buttonElementLimpar.addEventListener('click', function (e) {
        e.preventDefault();
        const valorDigitado = inputElement.value;
        if (valorDigitado === '') {
            data.then((jsonData) => {
                resultadoElement.textContent = jsonData[localStorage.getItem('traduzir')].erroNenumValorInserido;
            });
            return;
        } else {
            if(valorDigitado.length >= 128){
                data.then((jsonData) => {
                    resultadoElement.textContent = jsonData[localStorage.getItem('traduzir')].erroLimite128;
                });
            } else {
                chrome.history.search({ text: valorDigitado }, function (results) {
                    if (results.length === 0) {

                        data.then((jsonData) => {
                            resultadoElement.textContent = `${jsonData[localStorage.getItem('traduzir')].ItemNaoEncontrado[0]}"${valorDigitado}"${jsonData[localStorage.getItem('traduzir')].ItemNaoEncontrado[1]}`;
                        });
                    } else {
                        if (!chrome.runtime.lastError) {
                            for (let i = 0; i < results.length; i++) {
                                chrome.history.deleteUrl({ url: results[i].url });
                            }
                            data.then((jsonData) => {
                                resultadoElement.textContent = `${jsonData[localStorage.getItem('traduzir')].itemHistorico[0]}'${valorDigitado}' ${jsonData[localStorage.getItem('traduzir')].itemHistorico[1]}${results.length} ${jsonData[localStorage.getItem('traduzir')].itemHistorico[2]}`;
                            });
                            inputElement.value = '';
                        }
                    }
                });
            }
        }
    });

    buttonElementLimparAll.addEventListener('click', function (e) {
        e.preventDefault();
        inputElement.value = '';

        selectHistory.style.opacity = '0.5';
        selectHistory.style.cursor = 'not-allowed';
        selectHistory.style.pointerEvents = 'none';

        selectHistoryLabel.style.opacity = '0.5';
        selectHistoryLabel.style.cursor = 'not-allowed';
        selectHistoryLabel.style.pointerEvents = 'none';

        buttonElementLimparAll.style.opacity = '0.5';
        buttonElementLimparAll.style.cursor = 'not-allowed';
        buttonElementLimparAll.style.pointerEvents = 'none';

        buttonElementLimpar.style.opacity = '0.5';
        buttonElementLimpar.style.cursor = 'not-allowed';
        buttonElementLimpar.style.pointerEvents = 'none';

        inputElement.style.opacity = '0.5';
        inputElement.style.cursor = 'not-allowed';
        inputElement.style.pointerEvents = 'none';

        const valorDigitado = inputElement.value;

        chrome.history.search({ text: valorDigitado, maxResults: 1000 }, function (results) {
            if (results.length === 0) {
                data.then((jsonData) => {
                    resultadoElement.textContent = jsonData[localStorage.getItem('traduzir')].erroNenhumHistoricoEncontrado;
                });

                selectHistory.style.opacity = '1';
                selectHistory.style.cursor = 'pointer';
                selectHistory.style.pointerEvents = 'all';

                selectHistoryLabel.style.opacity = '1';
                selectHistoryLabel.style.cursor = 'pointer';
                selectHistoryLabel.style.pointerEvents = 'all';

                buttonElementLimparAll.style.opacity = '1';
                buttonElementLimparAll.style.cursor = 'pointer';
                buttonElementLimparAll.style.pointerEvents = 'all';

                buttonElementLimpar.style.opacity = '1';
                buttonElementLimpar.style.cursor = 'pointer';
                buttonElementLimpar.style.pointerEvents = 'all';

                inputElement.style.opacity = '1';
                inputElement.style.cursor = 'text';
                inputElement.style.pointerEvents = 'all';

            } else {

                data.then((jsonData) => {
                    resultadoElement.textContent = jsonData[localStorage.getItem('traduzir')].tamHistorico + results.length + ' iten(s).';
                });
                const pergunta = document.createElement('div', { id: 'pergunta' });
                data.then((jsonData) => {
                    pergunta.textContent = jsonData[localStorage.getItem('traduzir')].temCertezaDeletarHistorico;
                });
                document.body.appendChild(pergunta);
                pergunta.style.textAlign = 'center';
                pergunta.style.marginTop = '10px';
                pergunta.style.marginBottom = '10px';
                pergunta.style.fontSize = '14px';
                pergunta.style.border = '2px dashed #ccc';
                pergunta.style.padding = '10px';
                pergunta.style.display = 'flex';
                pergunta.style.justifyContent = 'center';
                pergunta.style.alignItems = 'center';
                pergunta.style.flexDirection = 'row wrap';                

                data.then((jsonData) => {
                    const createButtonYes = document.createElement('button',
                    { id: 'confirmar' });
                    createButtonYes.textContent = jsonData[localStorage.getItem('traduzir')].comfirmarSim;

                    pergunta.appendChild(createButtonYes);
                    createButtonYes.style.alignItems = 'center';
                    createButtonYes.style.marginRight = '10px';
                    createButtonYes.style.marginTop = '10px';
                    createButtonYes.style.fontSize = '16px';

                    createButtonYes.addEventListener('click', function (e) {
                        chrome.history.deleteAll(function () {
                            if (!chrome.runtime.lastError) {
                                pergunta.remove();
    
                                selectHistory.style.opacity = '1';
                                selectHistory.style.cursor = 'pointer';
                                selectHistory.style.pointerEvents = 'all';
    
                                selectHistoryLabel.style.opacity = '1';
                                selectHistoryLabel.style.cursor = 'pointer';
                                selectHistoryLabel.style.pointerEvents = 'all';
    
                                buttonElementLimparAll.style.opacity = '1';
                                buttonElementLimparAll.style.cursor = 'pointer';
                                buttonElementLimparAll.style.pointerEvents = 'all';
    
                                buttonElementLimpar.style.opacity = '1';
                                buttonElementLimpar.style.cursor = 'pointer';
                                buttonElementLimpar.style.pointerEvents = 'all';
    
                                inputElement.style.opacity = '1';
                                inputElement.style.cursor = 'text';
                                inputElement.style.pointerEvents = 'all';
    
    
                                data.then((jsonData) => {
                                    resultadoElement.textContent = jsonData[localStorage.getItem('traduzir')].excluzaoOk;
                                });
                            }
                        });
                    });
                });

                data.then((jsonData) => {

                    const createButtonNo = document.createElement('button',
                        { id: 'noConfirmar' });
                    createButtonNo.textContent = jsonData[localStorage.getItem('traduzir')].comfirmarNao;
                    pergunta.appendChild(createButtonNo);
                    createButtonNo.style.alignItems = 'center';
                    createButtonNo.style.marginRight = '10px';
                    createButtonNo.style.marginTop = '10px';
                    createButtonNo.style.fontSize = '16px';
    
                    createButtonNo.addEventListener('click', function (e) {
                        pergunta.remove();
    
                        selectHistory.style.opacity = '1';
                        selectHistory.style.cursor = 'pointer';
                        selectHistory.style.pointerEvents = 'all';
    
                        selectHistoryLabel.style.opacity = '1';
                        selectHistoryLabel.style.cursor = 'pointer';
                        selectHistoryLabel.style.pointerEvents = 'all';
    
                        buttonElementLimparAll.style.opacity = '1';
                        buttonElementLimparAll.style.cursor = 'pointer';
                        buttonElementLimparAll.style.pointerEvents = 'all';
    
                        buttonElementLimpar.style.opacity = '1';
                        buttonElementLimpar.style.cursor = 'pointer';
                        buttonElementLimpar.style.pointerEvents = 'all';
    
                        inputElement.style.opacity = '1';
                        inputElement.style.cursor = 'text';
                        inputElement.style.pointerEvents = 'all';
                        resultadoElement.textContent = '';
                    });
                });

            }
        });
    });
});