// Este arquivo é o script de conteúdo que é injetado nas páginas da web. 
// Ele pode manipular o DOM da página e interagir com o usuário.

document.addEventListener('DOMContentLoaded', () => {
    // Exemplo de manipulação do DOM
    const message = document.createElement('div');
    message.textContent = 'A extensão foi injetada com sucesso!';
    message.style.position = 'fixed';
    message.style.bottom = '10px';
    message.style.right = '10px';
    message.style.backgroundColor = 'yellow';
    message.style.padding = '10px';
    message.style.zIndex = '1000';
    
    document.body.appendChild(message);
});