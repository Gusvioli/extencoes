// popup.js

document.addEventListener('DOMContentLoaded', function () {
  const pasteArea = document.getElementById('pasteArea');
  const previewImage = document.getElementById('previewImage');
  const resultDiv = document.getElementById('result');
  const reloadButton = document.getElementById('reloadButton');
  const pinButton = document.getElementById('pinButton');

  if (!pasteArea || !previewImage || !resultDiv || !reloadButton) {
    alert('Erro: Elementos da interface não encontrados no HTML!');
    return;
  }

  let processing = false;
  let lastBase64 = null;
  let lastMimeType = null;

  // Foca automaticamente a área de colagem ao abrir a popup
  pasteArea.focus();
  resultDiv.style.display = 'none';


  navigator.permissions && navigator.permissions.query({ name: "clipboard-read" }).then(permissionStatus => {
    if (permissionStatus.state === "granted" || permissionStatus.state === "prompt") {
      navigator.clipboard.read && navigator.clipboard.read().then(async items => {

        resultDiv.style.display = 'block';
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
    }
    // Se "denied", não há como contornar, só resta aguardar o usuário colar manualmente.
  });

  // Também processa se o usuário colar manualmente (Ctrl+V)
  pasteArea.addEventListener('paste', async (event) => {
    resultDiv.style.display = 'block';
    if (processing) return;
    processing = true;
    resultDiv.innerText = "Processando imagem...";
    reloadButton.style.display = 'none';
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
        reloadButton.style.display = 'none';
        processing = false;
        return;
      }
      const resizedImage = await resizeImage(file);
      const base64String = await fileToBase64(resizedImage);
      const cleanBase64 = base64String.split(',')[1];
      const mimeType = file.type;

      lastBase64 = cleanBase64;
      lastMimeType = mimeType;

      previewImage.src = base64String;
      previewImage.style.display = 'block';
      resultDiv.innerText = "Enviando para o Gemini...";
      reloadButton.style.display = 'none';

      const description = await describeImageWithGemini(cleanBase64, mimeType);
      resultDiv.innerText = description;
    } catch (error) {
      resultDiv.innerText = "Erro ao processar imagem colada.";
      reloadButton.style.display = lastBase64 && lastMimeType ? 'inline-block' : 'none';
    }
    processing = false;
  }

  reloadButton.addEventListener('click', async () => {
    if (processing || !lastBase64 || !lastMimeType) return;
    processing = true;
    resultDiv.innerText = "Reenviando para o Gemini...";
    reloadButton.style.display = 'none';
    const description = await describeImageWithGemini(lastBase64, lastMimeType);
    resultDiv.innerText = description;
    // Se falhar novamente, o botão será mostrado de novo dentro da função
    processing = false;
  });

  if (pinButton) {
    pinButton.addEventListener('click', () => {
      const width = 700;
      const height = 600;
      const left = window.screen.availWidth - width - 10; // 10px de margem da borda direita
      const top = 50; // Ajuste conforme desejar

      window.open(
        chrome.runtime.getURL('src/popup/popup.html'),
        'GeminiFixada',
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
      );
      window.close(); // Fecha a popup original
    });
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  function resizeImage(file, maxWidth = 1024) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = e => {
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob(blob => {
            resolve(blob);
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
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
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        reloadButton.style.display = 'inline-block';
        return "Não foi possível descrever a imagem.";
      }
      reloadButton.style.display = 'none';
      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      reloadButton.style.display = 'inline-block';
      return "Erro ao conectar com o Gemini.";
    }
  }
});