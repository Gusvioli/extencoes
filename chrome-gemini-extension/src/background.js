// background.js

// Função auxiliar para cortar a imagem usando OffscreenCanvas
async function cropImage(imageDataUrl, x, y, width, height) {
    return new Promise(async (resolve, reject) => {
        try {
            // Convert Data URL to Blob
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();

            // Create ImageBitmap from Blob
            const imgBitmap = await createImageBitmap(blob);

            if (!width || !height || width <= 0 || height <= 0) {
                console.warn("Largura ou altura de recorte inválida, usando imagem original.");
                resolve(imageDataUrl); // Retorna a imagem original se os parâmetros forem inválidos
                return;
            }

            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Desenha apenas a parte desejada da imagem a partir do ImageBitmap
            ctx.drawImage(imgBitmap, x, y, width, height, 0, 0, width, height);

            // Converte o canvas de volta para um Data URL
            canvas.convertToBlob({ type: 'image/png' }).then(blobResult => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blobResult);
            }).catch(reject);
        } catch (error) {
            reject(error);
        }
    });
}

// Função para capturar e processar a tela
async function captureAndProcessScreenshot(settings) {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
            try {
                const imageBase64 = await chrome.tabs.captureVisibleTab(activeTab.windowId, { format: 'png' });
                console.log("Captura de tela completa (Base64):", imageBase64.substring(0, 100) + "..."); // Logar o início do Base64

                let processedImageBase64 = imageBase64;
                if (settings.captureRegionWidth > 0 && settings.captureRegionHeight > 0) {
                    processedImageBase64 = await cropImage(
                        imageBase64,
                        settings.captureRegionX,
                        settings.captureRegionY,
                        settings.captureRegionWidth,
                        settings.captureRegionHeight
                    );
                    console.log("Captura de tela cortada (Base64):", processedImageBase64.substring(0, 100) + "...");
                } else {
                    console.warn("Região de captura inválida, usando a captura de tela completa.");
                }

                // TODO: O que fazer com processedImageBase64?
                // Por enquanto, apenas registramos.
                // console.log("Imagem processada para uso:", processedImageBase64);

            } catch (error) {
                console.error("Erro ao capturar tela:", error);
            }
        }
    });
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("Chrome Gemini Extension installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureScreenshot") {
        chrome.tabs.captureVisibleTab(null, {}, (image) => {
            sendResponse({ image: image });
        });
        return true; // Indica que a resposta será enviada de forma assíncrona
    } else if (request.type === "CONTENT_SCRIPT_LOADED") {
        console.log("Content script loaded on a tab.");
        // No specific action needed in background for now, just acknowledge receipt
        sendResponse({ status: "acknowledged" });
        return true;
    } else if (request.type === 'PROCESS_IMAGE_WITH_GEMINI') {
        describeImageWithGemini(request.base64, request.mimeType);
        sendResponse({ status: "processing" }); // Respond immediately, actual result sent via GEMINI_RESULT
        return true;
    }
});

// Placeholder for describeImageWithGemini function
async function describeImageWithGemini(base64, mimeType) {
    const { geminiApiToken, geminiModel, customPrompt } = await chrome.storage.sync.get([
        'geminiApiToken', 'geminiModel', 'customPrompt'
    ]);
    
    if (!geminiApiToken) {
        console.error("Gemini API Token not found in storage.");
        // Find the active tab to send the message to
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { 
                    type: 'GEMINI_RESULT', 
                    success: false,
                    error: 'A chave da API Gemini não foi configurada. Por favor, configure-a na página de opções da extensão.' 
                });
            }
        });
        return;
    }

    const modelName = geminiModel || 'gemini-pro-vision'; // Default model
    const prompt = customPrompt || 'Descreva a imagem detalhadamente.';

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiToken}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: mimeType, data: base64 } }
                ]
            }
        ]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            const error = data?.error?.message || `API error: ${response.status}`;
            throw new Error(error);
        }
        
        const description = data.candidates[0].content.parts[0].text;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'GEMINI_RESULT',
                    success: true,
                    description: description
                });
            }
        });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'GEMINI_RESULT',
                    success: false,
                    error: error.message
                });
            }
        });
    }
}