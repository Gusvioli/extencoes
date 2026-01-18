# Desenvolvimento da Extensão Chrome Gemini

## Versão 1.2.5

### Melhorias

- **Experiência do Usuário**: A extensão agora exibe uma mensagem de erro clara na interface do usuário ao tentar interagir com páginas restritas, em vez de apenas registrar um erro no console.

## Versão 1.2.4

### Melhorias

- **Localização**: As mensagens de erro no popup foram traduzidas para o português, melhorando a experiência do usuário.

## Versão 1.2.3

### Correções de Bugs

- **Erro "Receiving end does not exist"**: A injeção do content script agora é feita de forma programática, garantindo que o script esteja pronto antes de receber mensagens. Isso resolve o erro de forma definitiva.

## Versão 1.2.2

### Correções de Bugs

- **Erro "Receiving end does not exist"**: Corrigido um erro que ocorria ao tentar se comunicar com o content script antes que ele estivesse pronto. Foi implementado um mecanismo de nova tentativa para garantir que a mensagem seja enviada com sucesso.
- **Interação com Páginas Restritas**: Adicionada uma verificação para impedir que a extensão tente interagir com páginas restritas do Chrome, como `chrome://extensions`.

## Versão 1.2.1

### Novas Funcionalidades

- **Descrição de Imagens**: A extensão agora permite que os usuários colem imagens em uma janela flutuante para obter uma descrição gerada pela API Gemini.
- **Janela Flutuante Interativa**: A janela flutuante foi aprimorada para aceitar a colagem de imagens e exibir os resultados da API.
- **Verificação de Chave de API**: A extensão agora verifica se a chave da API Gemini está configurada e exibe uma mensagem de erro caso não esteja.

### Melhorias

- **Tratamento de Erros**: O tratamento de erros foi aprimorado para fornecer feedback mais claro ao usuário em caso de falha na chamada da API.
- **Interface do Usuário**: A interface da janela flutuante foi atualizada para ser mais intuitiva.