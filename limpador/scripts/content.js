document.addEventListener('DOMContentLoaded', function () {
    const inputElement = document.getElementById('valorASerApagado');
    const buttonElementLimpar = document.getElementById('limpar');
    const buttonElementLimparAll = document.getElementById('limparAll');
    const resultadoElement = document.getElementById('resultado');
    // const resultadoPergunta = document.getElementById('resultadoPergunta');

    const selectHistory = document.getElementById('select-History');
    const selectHistoryLabel = document.getElementById('labe-select-History');


    chrome.history.search({text: '', maxResults: 1000}, (results) => {
        for (let i = 0; i < results.length; i+=1) {
            const option = document.createElement('option', { id: 'option' });
            selectHistory.appendChild(option);
            option.textContent = results[i].url + ' -- ' + results[i].title;
            option.value = results[i].title;
            option.style.fontSize = '14px';
            option.style.padding = '5px';
            option.style.margin = '5px';
            option.style.height = 'auto';
        }
    });

    selectHistory.addEventListener('click', function (e) {
        inputElement.value = e.target.value;
    });

    buttonElementLimpar.addEventListener('click', function (e) {
        e.preventDefault();
        const valorDigitado = inputElement.value;
        if (valorDigitado === '') {
            resultadoElement.textContent = 'Nenhum valor inserido.';
            return;
        } else {
            if(valorDigitado.length >= 128){
                resultadoElement.textContent = 'Limite de 128 caracteres ultrapassado.';
            } else {
                chrome.history.search({ text: valorDigitado }, function (results) {
                    if (results.length === 0) {
                        resultadoElement.textContent = `Item "${valorDigitado}" não encontrado.`;
                    } else {
                        if (!chrome.runtime.lastError) {
                            for (let i = 0; i < results.length; i++) {
                                chrome.history.deleteUrl({ url: results[i].url });
                            }
                            resultadoElement.textContent = `Histórico com '${valorDigitado}' excluído(s) com sucesso um total de ${results.length} ite(m/n)(s).`;
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
                resultadoElement.textContent = 'Nenhum histórico encontrado';

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

                resultadoElement.textContent = 'O tamanho do histórico é ' + results.length + ' iten(s).';
                const pergunta = document.createElement('div', { id: 'pergunta' });
                pergunta.textContent = 'Tem certeza de que deseja excluir todo o histórico? Essa ação não poderá ser desfeita.';
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

                const createButtonYes = document.createElement('button',
                    { id: 'confirmar' });

                createButtonYes.textContent = 'Sim';
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
                            resultadoElement.textContent = 'Todo o histórico foi excluído com sucesso.';
                        }
                    });
                });

                const createButtonNo = document.createElement('button',
                    { id: 'noConfirmar' });
                createButtonNo.textContent = 'Não';
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

            }
        });
    });
});