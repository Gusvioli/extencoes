// Este arquivo contém o código do script de fundo da extensão. Ele gerencia eventos que ocorrem em segundo plano, como a inicialização da extensão e a comunicação entre diferentes partes da extensão.

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extensão formatar-impressao-delivery instalada.');
});

// Exemplo de escuta de mensagens do script de conteúdo
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'doSomething') {
        // Lógica para lidar com a mensagem
        sendResponse({ status: 'success' });
    }
});