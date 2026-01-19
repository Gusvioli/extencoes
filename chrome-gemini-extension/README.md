# Chrome Gemini Extension

Extensão para Google Chrome que integra funcionalidades do Gemini com uma interface moderna e intuitiva.

## Funcionalidades

- **Descrição de Imagens**: Cole uma imagem em uma janela flutuante e receba uma descrição gerada por IA.
- **Interface Popup:** Acesse rapidamente as funções principais da extensão.
- **Página de Configurações:** Personalize o comportamento da extensão conforme sua necessidade.
- **Mensagens Modais:** Ao retornar das configurações, uma janela de mensagem confirma a ação realizada.
- **Ocultação de Resultados:** O resultado anterior é automaticamente ocultado ao voltar das configurações.
- **Design Responsivo:** Estilização moderna para melhor experiência do usuário.
- **Janela Flutuante Confiável**: Implementada execução direta de função para garantir a abertura da janela flutuante.

## Changelog

### Versão 1.2.15

- **Cancelamento de Recorte**: Adicionada funcionalidade para cancelar o modo de recorte pressionando a tecla "Esc".
- **Tutorial nas Configurações**: Incluída seção "Como funciona?" na tela de configurações explicando os recursos.
- **Melhorias na Interface**: A página de resultados agora possui um layout centralizado e moderno; feedback de salvamento de configurações reposicionado.

### Versão 1.2.14

- **Janela Flutuante Confiável**: Abertura da janela flutuante agora é feita através da execução direta de uma função no content script, contornando problemas de comunicação.

### Versão 1.2.13

- **Configurações não Abrindo**: Corrigido o problema onde a página de configurações não abria. Adicionado um event listener ao botão de configurações no `popup.js` que redireciona corretamente para `settings.html`.

### Versão 1.2.12

- **Correção de Bug Visual**: Ícone do botão "Voltar" na página de configurações foi corrigido.
- **Melhorias de Diagnóstico**: Logs detalhados foram adicionados aos scripts `content.js` e `popup/settings.js` para facilitar a identificação de problemas na inserção de imagens e na funcionalidade das configurações.

### Versão 1.2.11

- **Diagnóstico Abrangente**: Adicionados logs detalhados nos arquivos `content.js` e `popup/settings.js` para depurar problemas com a inserção de imagens e a funcionalidade das configurações. Os logs agora rastreiam a criação da janela flutuante, a anexação do ouvinte de "paste", o processamento dos dados da imagem, a inicialização do script de configurações, a detecção de elementos da UI, o carregamento e salvamento de dados nas configurações, e o redirecionamento do botão "Voltar".

### Versão 1.2.10

- **Diagnóstico de Inserção de Imagem**: Adicionados logs detalhados no `content.js` para auxiliar na depuração da funcionalidade de inserção de imagem, rastreando a criação da janela flutuante, a anexação do ouvinte de "paste", e o processamento dos dados da imagem.

### Versão 1.2.9

- **Erro "Receiving end does not exist" (Abordagem Simplificada)**: Revertidas todas as lógicas complexas de injeção programática e mecanismos de "ping-pong". A comunicação entre o popup e o content script agora é feita de forma direta, dependendo da injeção declarativa no `manifest.json`. O `content.js` foi simplificado, removendo logs agressivos e ouvintes de "ping".

### Versão 1.2.7

- **Erro "Receiving end does not exist" (Solução Definitiva)**: Implementado um mecanismo de "ping-pong" que verifica se o content script está ativo antes de enviar mensagens, injetando-o sob demanda se necessário.

### Versão 1.2.6

- **Estabilidade Geral**: Revertida a injeção programática do content script para a injeção declarativa via `manifest.json`, corrigindo instabilidades e garantindo um comportamento mais previsível.

### Versão 1.2.5

- A extensão agora exibe uma mensagem de erro clara na interface do usuário ao tentar interagir com páginas restritas.

### Versão 1.2.4

- As mensagens de erro no popup foram traduzidas para o português.

### Versão 1.2.3

- A injeção do content script agora é feita de forma programática, garantindo que o script esteja pronto antes de receber mensagens.

### Versão 1.2.2

- Corrigido o erro "Receiving end does not exist" que ocorria ao interagir com páginas restritas.
- Melhorada a estabilidade da comunicação entre o popup e o content script.

## Instalação

1. Clone este repositório:

   ```bash
   git clone https://github.com/seu-usuario/chrome-gemini-extension.git
   ```

2. No Chrome, acesse `chrome://extensions/` e ative o modo desenvolvedor.
3. Clique em "Carregar sem compactação" e selecione a pasta do projeto.

## Estrutura de Arquivos

- `src/popup/popup.html` — Interface principal do popup
- `src/popup/popup.js` — Lógica do popup
- `src/popup/settings.html` — Página de configurações
- `src/popup/settings.js` — Lógica das configurações
- `src/popup/settings.css` — Estilos das páginas

## Como Usar

1. Clique no ícone da extensão para abrir o popup.
2. Utilize as funcionalidades disponíveis.
3. Para acessar as configurações, clique no botão correspondente.
4. Ao salvar e voltar, uma mensagem de confirmação será exibida.

## Contribuição

Contribuições são bem-vindas! Para grandes mudanças, abra uma issue para discutir o que deseja modificar.

## Licença

[MIT](LICENSE)
