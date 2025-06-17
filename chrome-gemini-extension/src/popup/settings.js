document.addEventListener('DOMContentLoaded', () => {
  const apiToken = document.getElementById('apiToken');
  const geminiModel = document.getElementById('geminiModel');
  const customPrompt = document.getElementById('customPrompt');
  const form = document.getElementById('settingsForm');
  const msg = document.getElementById('settingsMessage');
  const backButton = document.getElementById('backButton');

  // Carrega configurações salvas
  chrome.storage.sync.get(['geminiApiToken', 'geminiModel', 'customPrompt'], (data) => {
    apiToken.value = data.geminiApiToken || '';
    geminiModel.value = data.geminiModel || 'gemini-2.0-flash';
    customPrompt.value = data.customPrompt || '';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    chrome.storage.sync.set({
      geminiApiToken: apiToken.value.trim(),
      geminiModel: geminiModel.value,
      customPrompt: customPrompt.value.trim()
    }, () => {
      msg.textContent = 'Configurações salvas!';
      msg.style.color = 'green';
      setTimeout(() => msg.textContent = '', 2000);
    });
  });

  backButton.addEventListener('click', () => {
    chrome.storage.local.set({ hideResultDiv: true }, () => {
      window.location.href = 'popup.html';
    });
  });
});