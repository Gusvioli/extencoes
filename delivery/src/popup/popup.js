// Este arquivo contém o código JavaScript que controla a lógica da interface do usuário no pop-up.
// Ele pode manipular eventos e interagir com o script de fundo.

// Função para verificar se existe uma aba aberta com um determinado endereço
function checkTabExists(url, callback) {
    chrome.runtime.sendMessage({ action: 'checkTabExists', url: url }, (response) => {
        if (response && response.exists !== undefined) {
            callback(response.exists, response.tabCount);
        } else {
            console.error('Erro ao verificar aba:', chrome.runtime.lastError);
            callback(false, 0);
        }
    });
}

// Função para pegar o código fonte da página de uma aba específica
async function getPageSource(tabId) {
    try {
        const result = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: () => document.documentElement.outerHTML
        });
        return result[0].result;
    } catch (error) {
        console.error('Erro ao pegar código fonte:', error);
        return null;
    }
}

// Função combinada para verificar aba e pegar código fonte se existir
function checkTabAndGetSource(url, callback) {
    chrome.tabs.query({ url: url }, async (tabs) => {
        const exists = tabs.length > 0;
        let source = null;
        if (exists) {
            source = await getPageSource(tabs[0].id);
        }
        callback(exists, tabs.length, source);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('toggle-extension');
    const status = document.getElementById('status');
    const output = document.getElementById('output_');

    // Recupera o estado atual ao abrir o popup
    chrome.storage.local.get(['enabled'], (result) => {
        const enabled = result.enabled ?? true;
        status.textContent = enabled ? 'Extensão Ativada' : 'Extensão Desativada';
        btn.textContent = enabled ? 'Desativar Extensão' : 'Ativar Extensão';
        document.body.style.backgroundColor = enabled ? '#90EE90' : '';
    });

    // Alterna o estado ao clicar no botão
    btn.addEventListener('click', () => {
        chrome.storage.local.get(['enabled'], (result) => {
            const enabled = !(result.enabled ?? true);
            chrome.storage.local.set({ enabled }, () => {
                status.textContent = enabled ? 'Extensão Ativada' : 'Extensão Desativada';
                btn.textContent = enabled ? 'Desativar Extensão' : 'Ativar Extensão';
                document.body.style.backgroundColor = enabled ? '#90EE90' : '';
            });
        });
    });

    // Verifica se a aba está aberta e atualiza o indicador
    checkTabExists('https://janis.in/*', (exists, count) => {
        if (exists && count > 0) {
            output.id = "output_on";
            output.title = "Aba Janis.in está aberta";
        } else {
            output.id = "output_off";
            output.title = "Aba Janis.in não está aberta";
        }
    });
});