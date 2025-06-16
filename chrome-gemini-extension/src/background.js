// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("Chrome Gemini Extension installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureScreenshot") {
        chrome.tabs.captureVisibleTab(null, {}, (image) => {
            sendResponse({ image: image });
        });
        return true; // Indica que a resposta será enviada de forma assíncrona
    }
});