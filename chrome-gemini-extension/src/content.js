/**
 * content.js
 * Script de conteúdo para a extensão Chrome Gemini.
 * Este script será injetado nas páginas para interagir com o DOM ou enviar mensagens ao background.
 */

// Exemplo: Enviar uma mensagem ao background script
chrome.runtime.sendMessage({ type: "CONTENT_SCRIPT_LOADED" });

// Exemplo: Ouvir mensagens do background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GEMINI_ACTION") {
        // Faça algo com a mensagem recebida
        console.log("Ação recebida do background:", message.data);
        // Opcional: responder ao background
        sendResponse({ status: "ok", received: message.data });
    }
});

// Exemplo: Interagir com o DOM da página
function highlightText(text) {
    const regex = new RegExp(text, "gi");
    document.body.innerHTML = document.body.innerHTML.replace(
        regex,
        (match) => `<span style="background: yellow;">${match}</span>`
    );
}

// Exemplo de uso: destacar a palavra "Gemini" na página
highlightText("Gemini");