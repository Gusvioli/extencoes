// background.js

const SUPPORTED_IMAGE_MIMETYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/heic",
    "image/heif",
];

// Previne que erros vazem para a interface do chrome://extensions
self.addEventListener("unhandledrejection", (event) => {
    console.warn("Unhandled rejection in service worker:", event.reason);
    event.preventDefault();
});

self.addEventListener("error", (event) => {
    console.warn("Uncaught error in service worker:", event.error);
    event.preventDefault();
});

chrome.runtime.onInstalled.addListener(() => {
    console.log("Chrome Gemini Extension installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "PROCESS_IMAGE_WITH_GEMINI") {
        describeImageWithGemini(
            request.base64,
            request.mimeType,
            sendResponse,
        ).catch((err) => {
            console.warn("Unhandled error in describeImageWithGemini:", err);
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});

async function describeImageWithGemini(base64, mimeType, sendResponse) {
    try {
        // Set initial processing state in local storage
        await chrome.storage.local.set({
            processingState: "in_progress",
            geminiResult: null, // Clear any previous result
        });

        if (!SUPPORTED_IMAGE_MIMETYPES.includes(mimeType)) {
            throw new Error(
                `Tipo de imagem não suportado: "${mimeType}". Tipos suportados: ${SUPPORTED_IMAGE_MIMETYPES.join(", ")}.`,
            );
        }

        const { geminiApiToken, geminiModel, customPrompt } =
            await chrome.storage.sync.get([
                "geminiApiToken",
                "geminiModel",
                "customPrompt",
            ]);

        if (!geminiApiToken) {
            throw new Error(
                "A chave da API Gemini não foi configurada. Por favor, configure-a na página de opções da extensão.",
            );
        }

        const modelName = geminiModel || "gemini-pro-vision"; // Default model
        let prompt = customPrompt || "Descreva a imagem detalhadamente.";

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiToken}`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: mimeType, data: base64 } },
                    ],
                },
            ],
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log("Gemini API raw response data:", data);

        if (!response.ok) {
            const errorMessage =
                data?.error?.message ||
                `API error: ${response.status} - ${JSON.stringify(data)}`;
            throw new Error(errorMessage);
        }

        if (
            !data.candidates ||
            data.candidates.length === 0 ||
            !data.candidates[0].content ||
            !data.candidates[0].content.parts ||
            data.candidates[0].content.parts.length === 0 ||
            !data.candidates[0].content.parts[0].text
        ) {
            let specificError =
                "A API Gemini não retornou uma descrição válida. Isso pode ocorrer por conteúdo impróprio, problemas internos do modelo ou formato de imagem não processável.";
            if (data.promptFeedback && data.promptFeedback.blockReason) {
                specificError += ` Razão do bloqueio: ${data.promptFeedback.blockReason}.`;
            }
            throw new Error(specificError);
        }

        const description = data.candidates[0].content.parts[0].text;

        const successResult = {
            processingState: "completed",
            success: true,
            description: description,
        };

        const storageData = await chrome.storage.local.get("history");
        const history = Array.isArray(storageData.history)
            ? storageData.history
            : [];
        const newHistoryItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            prompt: prompt,
            result: description,
            imageData: `data:${mimeType};base64,${base64}`,
        };
        const updatedHistory = [newHistoryItem, ...history].slice(0, 50); // Manter apenas os últimos 50 itens

        await chrome.storage.local.set({
            geminiResult: successResult,
            processingState: "completed",
            history: updatedHistory,
        });
        try {
            sendResponse(successResult);
        } catch (e) {
            console.warn("Failed to send success response:", e);
        }
    } catch (error) {
        console.warn("Error in describeImageWithGemini:", error);
        const errorResult = {
            processingState: "error",
            success: false,
            error: error.message,
        };
        try {
            await chrome.storage.local.set({
                geminiResult: errorResult,
                processingState: "error",
            });
        } catch (e) {
            console.warn("Failed to save error state:", e);
        }
        try {
            sendResponse(errorResult);
        } catch (e) {
            console.warn("Failed to send response (popup likely closed):", e);
        }
    }
}
