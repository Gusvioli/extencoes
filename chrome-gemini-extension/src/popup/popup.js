// popup.js

document.addEventListener('DOMContentLoaded', function () {
  const pasteArea = document.getElementById('pasteArea');
  const previewImage = document.getElementById('previewImage');
  const resultDiv = document.getElementById('result');

  if (!pasteArea || !previewImage || !resultDiv) {
    alert('Erro: Elementos da interface não encontrados no HTML!');
    return;
  }

  let processing = false;

  // Foca automaticamente a área de colagem ao abrir a popup
  pasteArea.focus();

  // Tenta colar automaticamente ao abrir a popup (nem todo navegador permite)
  navigator.clipboard.read && navigator.clipboard.read().then(async items => {
    for (const item of items) {
      if (item.types.includes('image/png')) {
        const blob = await item.getType('image/png');
        processImage(blob);
        break;
      }
    }
  }).catch(() => {
    // Falha silenciosa, usuário pode colar manualmente se necessário
  });

  // Também processa se o usuário colar manualmente (Ctrl+V)
  pasteArea.addEventListener('paste', async (event) => {
    if (processing) return;
    processing = true;
    resultDiv.innerText = "Processando imagem...";
    event.preventDefault();
    const items = (event.clipboardData || event.originalEvent?.clipboardData)?.items || [];
    let foundImage = false;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          foundImage = true;
          await processImage(file);
          break;
        }
      }
    }
    if (!foundImage) {
      resultDiv.innerText = "Nenhuma imagem encontrada na área de transferência.";
      processing = false;
    }
  });

  async function processImage(file) {
    try {
      if (file.size > 2 * 1024 * 1024) {
        resultDiv.innerText = "Imagem muito grande! Limite: 2MB.";
        processing = false;
        return;
      }
      const base64String = await fileToBase64(file);
      const cleanBase64 = base64String.split(',')[1];
      const mimeType = file.type;

      previewImage.src = base64String;
      previewImage.style.display = 'block';
      resultDiv.innerText = "Enviando para o Gemini...";

      const description = await describeImageWithGemini(cleanBase64, mimeType);
      resultDiv.innerText = description;
    } catch (error) {
      resultDiv.innerText = "Erro ao processar imagem colada.";
    }
    processing = false;
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async function describeImageWithGemini(base64, mimeType) {
    const GEMINI_API_KEY = "AIzaSyADthtU2RfVtg9NfNC7kGRw1cY0JxXT0xI";
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY;

    const body = {
      contents: [
        {
          parts: [
            { text: "Resolva essa questão para mim em português" },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64
              }
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível descrever a imagem.";
    } catch (e) {
      return "Erro ao conectar com o Gemini.";
    }
  }
});