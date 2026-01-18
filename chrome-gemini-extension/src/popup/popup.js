document.addEventListener('DOMContentLoaded', function () {
    const mainContent = document.querySelector('.main-content');
    const userMessage = document.getElementById('userMessage');

    function showErrorMessage(message) {
        if (mainContent) mainContent.style.display = 'none';
        if (userMessage) {
            userMessage.textContent = message;
            userMessage.className = 'user-message error-message'; // Adiciona classes para estilização
        }
    }

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0] && tabs[0].id) {
            const tab = tabs[0];
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('https://chrome.google.com')) {
                showErrorMessage("Não é possível usar a extensão em páginas restritas do Chrome.");
                return;
            }

            try {
                // Injeta o content script de forma programática
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['src/content.js']
                });

                // Envia a mensagem após garantir que o script foi injetado
                await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_FLOATING_WINDOW' });
                
                window.close(); // Fecha o popup somente em caso de sucesso
            } catch (error) {
                console.error("Erro ao injetar script ou enviar mensagem:", error);
                showErrorMessage("Falha ao comunicar com a página. Tente recarregar a aba.");
            }
        } else {
            showErrorMessage("Nenhuma aba ativa encontrada.");
        }
    });
});