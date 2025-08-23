// Este arquivo contém o código JavaScript que controla a lógica da interface do usuário no pop-up. 
// Ele pode manipular eventos e interagir com o script de fundo.

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('toggle-extension');
  const status = document.getElementById('status');

  // Recupera o estado atual ao abrir o popup
  chrome.storage.local.get(['enabled'], (result) => {
    const enabled = result.enabled ?? true;
    status.textContent = enabled ? 'Extensão Ativada' : 'Extensão Desativada';
    btn.textContent = enabled ? 'Desativar Extensão' : 'Ativar Extensão';
    document.body.style.backgroundColor = enabled ? '#90EE90' : '';
  });

  // Alterna o estado ao clicar no botão
  btn.addEventListener('click', () => {
    chrome.storage.local.get(['enabled'], (result) => {
      const enabled = !(result.enabled ?? true);
      chrome.storage.local.set({ enabled }, () => {
        status.textContent = enabled ? 'Extensão Ativada' : 'Extensão Desativada';
        btn.textContent = enabled ? 'Desativar Extensão' : 'Ativar Extensão';
        document.body.style.backgroundColor = enabled ? '#90EE90' : '';
      });
    });
  });
});