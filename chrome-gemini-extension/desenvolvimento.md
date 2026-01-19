# Desenvolvimento da Extensão Chrome Gemini

## Versão 1.2.14

### Correções de Bugs

- **Janela Flutuante não Abrindo**: Implementada execução direta da função `createFloatingWindow()` no script de conteúdo, contornando problemas de comunicação e garantindo a abertura confiável da janela flutuante.

## Versão 1.2.13

### Correções de Bugs

- **Configurações não Abrindo**: Corrigido o problema onde a página de configurações não abria. Adicionado um event listener ao botão de configurações no `popup.js` que redireciona corretamente para `settings.html`.

## Versão 1.2.12

### Correções de Bugs

- **Ícone do Botão Voltar**: Corrigido o problema do ícone do botão "Voltar" na página de configurações que não estava sendo exibido.

## Versão 1.2.11

### Melhorias

- **Diagnóstico Abrangente**: Adicionados logs detalhados nos arquivos `content.js` e `popup/settings.js` para depurar problemas com a inserção de imagens e a funcionalidade das configurações. Os logs agora rastreiam a criação da janela flutuante, a anexação do ouvinte de "paste", o processamento dos dados da imagem, a inicialização do script de configurações, a detecção de elementos da UI, o carregamento e salvamento de dados nas configurações, e o redirecionamento do botão "Voltar".

## Versão 1.2.10

### Melhorias

- **Diagnóstico de Inserção de Imagem**: Adicionados logs detalhados no `content.js` para auxiliar na depuração da funcionalidade de inserção de imagem, rastreando a criação da janela flutuante, a anexação do ouvinte de "paste", e o processamento dos dados da imagem.

## Versão 1.2.9

### Correções de Bugs

- **Erro "Receiving end does not exist" (Abordagem Simplificada)**: Revertidas todas as lógicas complexas de injeção programática e mecanismos de "ping-pong". A comunicação entre o popup e o content script agora é feita de forma direta, dependendo da injeção declarativa no `manifest.json`. O `content.js` foi simplificado, removendo logs agressivos e ouvintes de "ping".

## Versão 1.2.8

### Melhorias

- **Diagnóstico de Conexão**: Adicionada uma série de logs detalhados no `content.js` para auxiliar na depuração de erros de conexão e garantir que o script esteja sendo injetado e respondendo corretamente.

## Versão 1.2.7

### Correções de Bugs

- **Erro "Receiving end does not exist" (Solução Definitiva)**: Implementado um mecanismo de "ping-pong" onde o popup verifica se o content script está ativo antes de enviar mensagens. Se não estiver, o script é injetado sob demanda. Isso resolve de forma definitiva os erros de comunicação e instabilidade.

## Versão 1.2.6

### Correções de Bugs

- **Instabilidade Geral**: Revertida a injeção programática do content script para a injeção declarativa via `manifest.json`. Isso corrige a instabilidade causada por múltiplas injeções de script e garante um comportamento mais previsível e estável da extensão.

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
