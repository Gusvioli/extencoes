// src/content.js

// Função para capturar a seleção da tela
function captureSelection() {
    // Cria um canvas para desenhar a imagem
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Obtém a seleção do usuário
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Define o tamanho do canvas com base na seleção
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Desenha a seleção no canvas
    context.drawImage(document.body, -rect.left, -rect.top);

    // Converte o canvas em uma imagem
    canvas.toBlob(blob => {
        const file = new File([blob], 'screenshot.png', { type: 'image/png' });
        sendToGemini(file);
    }, 'image/png');
}

// Função para enviar a imagem para a API do Gemini
function sendToGemini(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('https://api.gemini.google.com/describe', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Descrição:', data.description);
    })
    .catch(error => {
        console.error('Erro ao enviar a imagem:', error);
    });
}

// Adiciona um listener para a seleção de texto
document.addEventListener('mouseup', () => {
    if (window.getSelection().toString()) {
        captureSelection();
    }
});