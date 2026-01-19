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
  chrome.contextMenus.create({
    id: "analyze-image",
    title: "Analisar imagem com Gemini",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyze-image" && info.srcUrl) {
    processImageUrl(info.srcUrl);
  }
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
  } else if (request.type === "START_CROP") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        // Tenta enviar a mensagem. Se falhar, injeta o script e tenta novamente.
        chrome.tabs.sendMessage(activeTab.id, { type: "INIT_CROP" }, () => {
          if (chrome.runtime.lastError) {
            console.log(
              "Content script not ready, injecting...",
              chrome.runtime.lastError.message,
            );

            const url = activeTab.url || "";
            if (
              url.startsWith("chrome://") ||
              url.startsWith("edge://") ||
              url.startsWith("about:") ||
              url.startsWith("view-source:") ||
              url.startsWith("https://chrome.google.com/webstore") ||
              url.startsWith("https://chromewebstore.google.com")
            ) {
              console.warn("Cannot crop on restricted pages.");
              chrome.scripting
                .executeScript({
                  target: { tabId: activeTab.id },
                  func: () =>
                    alert(
                      "Não é possível capturar esta página (página restrita do navegador).",
                    ),
                })
                .catch(() => {}); // Ignora erros se não puder injetar o alerta
              return;
            }

            chrome.scripting.executeScript(
              {
                target: { tabId: activeTab.id },
                files: ["src/content.js"],
              },
              () => {
                if (!chrome.runtime.lastError) {
                  chrome.tabs.sendMessage(activeTab.id, { type: "INIT_CROP" });
                }
              },
            );
          }
        });
      }
    });
  } else if (request.type === "CROP_DATA") {
    handleCropData(request.data, sender.tab);
  }
});

async function processImageUrl(url) {
  try {
    await chrome.storage.local.set({
      processingState: "in_progress",
      geminiResult: null,
      currentImage: null,
    });
    chrome.tabs.create({ url: "src/popup/popup.html?mode=result" });

    const response = await fetch(url);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    const mimeType = blob.type;

    await describeImageWithGemini(base64, mimeType, null);
  } catch (error) {
    console.warn("Error processing image URL:", error);
    await chrome.storage.local.set({
      processingState: "error",
      geminiResult: { success: false, error: error.message },
    });
  }
}

async function handleCropData(cropData, tab) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
    });

    await chrome.storage.local.set({
      processingState: "in_progress",
      geminiResult: null,
      currentImage: null,
    });
    chrome.tabs.create({ url: "src/popup/popup.html?mode=result" });

    const croppedBase64 = await cropImage(dataUrl, cropData);
    await describeImageWithGemini(croppedBase64, "image/png", null);
  } catch (error) {
    console.warn("Error handling crop:", error);
    await chrome.storage.local.set({
      processingState: "error",
      geminiResult: { success: false, error: error.message },
    });
  }
}

async function cropImage(dataUrl, { x, y, width, height, devicePixelRatio }) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);

  const scale = devicePixelRatio || 1;
  const canvas = new OffscreenCanvas(width * scale, height * scale);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    bitmap,
    x * scale,
    y * scale,
    width * scale,
    height * scale,
    0,
    0,
    width * scale,
    height * scale,
  );

  const croppedBlob = await canvas.convertToBlob({ type: "image/png" });
  return blobToBase64(croppedBlob);
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function describeImageWithGemini(base64, mimeType, sendResponse) {
  try {
    // Set initial processing state in local storage
    await chrome.storage.local.set({
      processingState: "in_progress",
      geminiResult: null, // Clear any previous result
      currentImage: { base64, mimeType },
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
      if (sendResponse) sendResponse(successResult);
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
      if (sendResponse) sendResponse(errorResult);
    } catch (e) {
      console.warn("Failed to send response (popup likely closed):", e);
    }
  }
}
