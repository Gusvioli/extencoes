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

  let processing = true;
  let lastBase64 = null;
  let lastMimeType = null;

  // Foca automaticamente a área de colagem ao abrir a popup
  pasteArea.focus();
  resultDiv.style.display = 'none';

  if (navigator.permissions && navigator.clipboard && navigator.clipboard.read) {
    navigator.permissions.query({ name: "clipboard-read" }).then(permissionStatus => {
      if (permissionStatus.state === "granted") {
        navigator.clipboard.read().then(async (items) => {
          resultDiv.style.display = 'block';
          for (const item of items) {
            if (item.types.includes('image/png')) {
              const blob = await item.getType('image/png');
              await processImage(blob);
              break;
            }
          }
        }).catch(() => {
          resultDiv.innerText = "Erro ao ler a área de transferência.";
          processing = false;
        });
      }
      else {
        resultDiv.innerText = "Permissão para acessar a área de transferência negada.";
        reloadButton.style.display = lastBase64 && lastMimeType ? 'inline-block' : 'none';
        processing = false;
      }
    });
  }

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

  // Permite enviar a imagem ao clicar no texto da área de colagem
  pasteArea.addEventListener('click', async () => {
    if (
      !processing &&
      previewImage &&
      previewImage.src &&
      previewImage.style.display !== 'none' &&
      lastBase64 &&
      lastMimeType
    ) {
      processing = true;
      resultDiv.style.display = 'block';
      resultDiv.innerText = "Carregando...";
      reloadButton.style.display = 'none';
      const description = await describeImageWithGemini(lastBase64, lastMimeType);
      resultDiv.innerText = description;
      processing = false;
    } else if (!previewImage.src || previewImage.style.display === 'none') {
      showUserMessage("Nenhuma imagem foi colada ainda.", "warning");
    }
  });

  // MENU DE CONTEXTO PERSONALIZADO PARA COLAR IMAGEM
  const contextMenu = document.getElementById('contextMenu');
  const pasteImageOption = document.getElementById('pasteImageOption');

  pasteArea.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
  });

  document.addEventListener('click', (e) => {
    if (contextMenu.style.display === 'block') {
      contextMenu.style.display = 'none';
    }
  });

  pasteImageOption.addEventListener('click', async () => {
    contextMenu.style.display = 'none';
    // Tenta ler a imagem da área de transferência
    if (navigator.clipboard && navigator.clipboard.read) {
      try {
        const items = await navigator.clipboard.read();
        let found = false;
        for (const item of items) {
          if (item.types.includes('image/png')) {
            const blob = await item.getType('image/png');
            await processImage(blob);
            found = true;
            break;
          }
        }
        if (!found) {
          resultDiv.style.display = 'block';
          resultDiv.innerText = "Nenhuma imagem encontrada na área de transferência.";
        }
      } catch (err) {
        resultDiv.style.display = 'block';
        resultDiv.innerText = "Erro ao acessar a área de transferência.";
      }
    } else {
      resultDiv.style.display = 'block';
      resultDiv.innerText = "Seu navegador não suporta colar imagens dessa forma.";
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
      resultDiv.innerText = "Erro ao processar a imagem.";
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

  // Adicione o event listener do botão de configurações aqui, apenas uma vez!
  const settingsButton = document.getElementById('settingsButton');
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      window.location.href = 'settings.html';
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
    resultDiv.style.display = 'block';
    resultDiv.innerText = "Carregando...";

    // Busca configurações do usuário
    const { geminiApiToken, geminiModel, customPrompt } = await new Promise(resolve =>
      chrome.storage.sync.get(['geminiApiToken', 'geminiModel', 'customPrompt'], resolve)
    );
    const apiKey = geminiApiToken || "AIzaSyD7ZfRIHu8ant9ztajuMtnvKROGkbSmUfQ";
    const model = geminiModel || "gemini-2.0-flash";
    const prompt = customPrompt && customPrompt.length > 0
      ? customPrompt
      : "Analise cuidadosamente a imagem fornecida e extraia todas as informações visuais e textuais possíveis. Descreva em detalhes tudo o que for identificado, incluindo textos, números, gráficos, tabelas, símbolos, elementos visuais, contexto, estrutura e qualquer outro dado relevante presente na imagem. Se possível, organize as informações de forma clara e estruturada, destacando pontos importantes e explicando o significado de cada elemento. Responda sempre em português do Brasil.";

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          parts: [
            { text: prompt },
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
        return "Não foi possível descrever a imagem.";
      }
      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      return "Erro ao conectar com o Gemini.";
    }
  }

  function showUserMessage(message, type = "info", timeout = 3500) {
    const msgDiv = document.getElementById("userMessage");
    msgDiv.className = "";
    msgDiv.classList.add(type);
    msgDiv.innerText = message;
    msgDiv.style.display = "block";
    if (timeout > 0) {
      setTimeout(() => {
        msgDiv.style.display = "none";
      }, timeout);
    }
  }
  resultDiv.style.display = 'none';
});
