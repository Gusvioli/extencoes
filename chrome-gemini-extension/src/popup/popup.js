document.addEventListener("DOMContentLoaded", function () {
  const mainContent = document.querySelector(".main-content");
  const userMessage = document.getElementById("userMessage");
  const settingsButton = document.getElementById("settingsButton");
  const pasteArea = document.getElementById("pasteArea");
  const previewContainer = document.getElementById("preview-container");
  const previewImage = document.getElementById("previewImage");
  const resultContainer = document.getElementById("result-container");
  const resultDiv = document.getElementById("result");
  const statusContainer = document.getElementById("status-container");
  const statusText = document.getElementById("status-text");
  const reloadButton = document.getElementById("reloadButton");

  const historyButton = document.getElementById("historyButton");
  const historyContainer = document.getElementById("history-container");
  const historyList = document.getElementById("historyList");
  const backFromHistoryButton = document.getElementById(
    "backFromHistoryButton",
  );
  const clearHistoryButton = document.getElementById("clearHistoryButton");

  let lastImageData = null; // Variable to store the last processed image data

  // Helper functions for UI
  function showStatus(message, showSpinner = true) {
    statusText.textContent = message;
    statusContainer.style.display = "flex";
    statusContainer.querySelector(".spinner").style.display = showSpinner
      ? "block"
      : "none";
    userMessage.style.display = "none";
  }

  function hideStatus() {
    statusContainer.style.display = "none";
  }

  function displayImagePreview(base64Data) {
    previewImage.src = `data:image/png;base64,${base64Data}`;
    previewContainer.style.display = "block";
    pasteArea.style.display = "none"; // Keep paste area hidden when preview is shown
  }

  function clearContentAndHideContainers() {
    if (mainContent) mainContent.style.display = "flex";
    previewContainer.style.display = "none";
    resultContainer.style.display = "none";
    statusContainer.style.display = "none";
    if (historyContainer) historyContainer.style.display = "none";
    pasteArea.style.display = "block"; // Show paste area again
    resultDiv.innerHTML = ""; // Clear previous results
    reloadButton.style.display = "none"; // Hide reload button
    userMessage.style.display = "none"; // Hide any user messages
  }

  function showErrorMessage(message) {
    if (mainContent) mainContent.style.display = "none";
    if (userMessage) {
      userMessage.textContent = message;
      userMessage.className = "user-message error-message";
      userMessage.style.display = "block"; // Ensure userMessage is visible
    }
  }

  // Event listener for paste in the paste area
  if (pasteArea) {
    pasteArea.addEventListener("paste", handlePaste);
    pasteArea.addEventListener("click", async () => {
      clearContentAndHideContainers(); // Clear previous content

      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
          for (const type of clipboardItem.types) {
            if (type.startsWith("image/")) {
              const blob = await clipboardItem.getType(type);
              if (blob) {
                processImageFromBlob(blob, type);
                return; // Process first image found and exit
              }
            }
          }
        }
        // If no image found in clipboard
        showStatus(
          "Nenhuma imagem encontrada na área de transferência.",
          false,
        );
        userMessage.textContent =
          "Nenhuma imagem encontrada na área de transferência. Cole uma imagem (Ctrl+V).";
        userMessage.className = "user-message";
        userMessage.style.display = "block";
      } catch (err) {
        console.error("Failed to read clipboard contents: ", err);
        showStatus("Erro ao ler a área de transferência.", false);
        userMessage.textContent =
          "Erro ao ler a área de transferência. Por favor, certifique-se de que a extensão tem permissão para ler a área de transferência.";
        userMessage.className = "user-message error-message";
        userMessage.style.display = "block";
      }
    });
  }

  // Event listener for reload button
  if (reloadButton) {
    reloadButton.addEventListener("click", () => {
      if (lastImageData) {
        clearContentAndHideContainers(); // Clear existing results for re-analysis
        sendImageToGemini(lastImageData.base64, lastImageData.mimeType);
      } else {
        // If no image was processed yet, just clear the containers for new input
        clearContentAndHideContainers();
        userMessage.textContent =
          "Nenhuma imagem para re-analisar. Cole ou selecione uma imagem.";
        userMessage.style.display = "block";
      }
    });
  }

  // Function to handle image paste
  function handlePaste(event) {
    event.preventDefault(); // Prevent default paste behavior
    clearContentAndHideContainers(); // Clear previous content

    const items = (event.clipboardData || event.originalEvent.clipboardData)
      .items;
    for (const item of items) {
      if (item.type.indexOf("image") === 0) {
        const blob = item.getAsFile();
        if (blob) {
          processImageFromBlob(blob, item.type);
          return; // Only process the first image found
        }
      }
    }
    // If no image found in paste
    showStatus("Nenhuma imagem encontrada para colar.", false);
    userMessage.textContent = "Cole uma imagem para análise (Ctrl+V).";
    userMessage.className = "user-message";
    userMessage.style.display = "block";
  }

  // Helper function to send image data to Gemini API
  function sendImageToGemini(base64, mimeType) {
    lastImageData = { base64: base64, mimeType: mimeType };

    // Show preview
    previewImage.src = `data:${mimeType};base64,${base64}`;
    previewContainer.style.display = "block";
    pasteArea.style.display = "none";

    showStatus("Analisando imagem...", true);

    chrome.runtime.sendMessage(
      {
        type: "PROCESS_IMAGE_WITH_GEMINI",
        base64: base64,
        mimeType: mimeType,
      },
      (response) => {
        hideStatus();
        if (chrome.runtime.lastError) {
          showErrorMessage("Erro: " + chrome.runtime.lastError.message);
          return;
        }

        if (response && response.success) {
          resultDiv.innerHTML = response.description.replace(/\n/g, "<br>");
          resultContainer.style.display = "block";
          reloadButton.style.display = "block";
        } else {
          showErrorMessage(response.error || "Erro ao processar imagem.");
          reloadButton.style.display = "block";
        }
      },
    );
  }

  // Helper function to process an image from a Blob (File) object
  function processImageFromBlob(blob, originalMimeType) {
    console.log(
      "processImageFromBlob called with blob:",
      blob,
      "and MIME type:",
      originalMimeType,
    );
    clearContentAndHideContainers(); // Clear previous content

    if (!blob || !blob.type.startsWith("image/")) {
      console.error("Invalid blob or non-image file provided:", blob);
      showStatus("Por favor, selecione um arquivo de imagem válido.", false);
      userMessage.textContent =
        "Formato de arquivo não suportado. Por favor, selecione uma imagem.";
      userMessage.className = "user-message error-message";
      userMessage.style.display = "block";
      return;
    }

    showStatus("Lendo arquivo de imagem...");
    const reader = new FileReader();
    reader.onload = function (e) {
      console.log("FileReader loaded image data.");
      const originalDataUrl = e.target.result;
      let processedBase64;
      let processedMimeType;

      // Attempt to convert to image/png if not already png or jpeg
      if (
        originalMimeType === "image/png" ||
        originalMimeType === "image/jpeg"
      ) {
        console.log("Image is already PNG or JPEG, using original format.");
        processedBase64 = originalDataUrl.split(",")[1];
        processedMimeType = originalMimeType;
        sendImageToGemini(processedBase64, processedMimeType);
      } else {
        console.log("Image is not PNG or JPEG, attempting conversion to PNG.");
        showStatus("Convertendo imagem para PNG...");
        // Use a canvas to convert to PNG
        const img = new Image();
        img.onload = () => {
          console.log("Image loaded into canvas for conversion.");
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const pngDataUrl = canvas.toDataURL("image/png");

          processedBase64 = pngDataUrl.split(",")[1];
          processedMimeType = "image/png";
          console.log("Image converted to PNG. Sending to Gemini.");
          sendImageToGemini(processedBase64, processedMimeType);
        };
        img.onerror = (err) => {
          console.error("Error loading image for conversion:", err);
          hideStatus();
          reloadButton.style.display = "block";
          resultDiv.innerHTML = `<p style="color: red;">Erro ao preparar imagem para envio (Falha na conversão).</p>`;
          resultContainer.style.display = "block";
          showStatus("Erro ao preparar imagem (conversão).", false);
          userMessage.textContent =
            "Não foi possível converter a imagem para um formato suportado.";
          userMessage.className = "user-message error-message";
          userMessage.style.display = "block";
        };
        img.src = originalDataUrl;
      }
    };
    reader.onerror = function (err) {
      console.error("FileReader error:", err);
      hideStatus();
      reloadButton.style.display = "block";
      resultDiv.innerHTML = `<p style="color: red;">Erro ao ler o arquivo de imagem.</p>`;
      resultContainer.style.display = "block";
      showStatus("Erro ao ler o arquivo de imagem.", false);
      userMessage.textContent = "Ocorreu um erro ao ler o arquivo selecionado.";
      userMessage.className = "user-message error-message";
      userMessage.style.display = "block";
    };
    reader.readAsDataURL(blob);
  }

  // Initial state: ensure paste area is visible and others hidden
  clearContentAndHideContainers();

  // Add the listener for the settings button at the end
  if (settingsButton) {
    settingsButton.addEventListener("click", () => {
      window.location.href = "settings.html"; // Load settings within the current popup
    });
  }

  // History functionality
  if (historyButton) {
    historyButton.addEventListener("click", () => {
      if (mainContent) mainContent.style.display = "flex";
      // Hide other containers
      pasteArea.style.display = "none";
      previewContainer.style.display = "none";
      resultContainer.style.display = "none";
      statusContainer.style.display = "none";
      userMessage.style.display = "none";

      // Show history
      historyContainer.style.display = "block";
      loadHistory();
    });
  }

  if (backFromHistoryButton) {
    backFromHistoryButton.addEventListener("click", () => {
      clearContentAndHideContainers();
    });
  }

  if (clearHistoryButton) {
    clearHistoryButton.addEventListener("click", () => {
      chrome.storage.local.remove("history", () => {
        loadHistory();
      });
    });
  }

  function loadHistory() {
    chrome.storage.local.get("history", (data) => {
      const history = data.history || [];
      historyList.innerHTML = "";

      if (history.length === 0) {
        historyList.innerHTML =
          "<p style='text-align:center; color: var(--muted-color);'>Nenhum histórico encontrado.</p>";
        return;
      }

      history.forEach((item) => {
        const div = document.createElement("div");
        div.className = "history-item";
        const date = new Date(item.timestamp).toLocaleString();

        let imageHtml = "";
        if (item.imageData) {
          imageHtml = `<img src="${item.imageData}" class="history-image" alt="Imagem analisada">`;
        }

        div.innerHTML = `<div class="history-date">${date}</div>${imageHtml}<div style="font-weight:bold; margin-bottom:0.25rem;">Prompt: ${item.prompt}</div><div style="margin-bottom:0.5rem;">${(item.result || "").replace(/\n/g, "<br>")}</div>`;

        const copyBtn = document.createElement("button");
        copyBtn.className = "text-button";
        copyBtn.textContent = "Copiar";
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(item.result).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "Copiado!";
            setTimeout(() => {
              copyBtn.textContent = originalText;
            }, 2000);
          });
        });

        div.appendChild(copyBtn);
        historyList.appendChild(div);
      });
    });
  }
});
