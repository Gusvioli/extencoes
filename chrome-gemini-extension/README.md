# Chrome Gemini Extension

Extensão para Google Chrome que integra funcionalidades do Gemini com uma interface moderna e intuitiva.

## Funcionalidades

- **Descrição de Imagens**: Cole uma imagem em uma janela flutuante e receba uma descrição gerada por IA.
- **Interface Popup:** Acesse rapidamente as funções principais da extensão.
- **Página de Configurações:** Personalize o comportamento da extensão conforme sua necessidade.
- **Mensagens Modais:** Ao retornar das configurações, uma janela de mensagem confirma a ação realizada.
- **Ocultação de Resultados:** O resultado anterior é automaticamente ocultado ao voltar das configurações.
- **Design Responsivo:** Estilização moderna para melhor experiência do usuário.
- **Melhor Experiência do Usuário**: Exibe uma mensagem de erro clara na interface ao interagir com páginas restritas.

## Changelog

### Versão 1.2.5

- A extensão agora exibe uma mensagem de erro clara na interface do usuário ao tentar interagir com páginas restritas.

### Versão 1.2.4

- As mensagens de erro no popup foram traduzidas para o português.

### Versão 1.2.3

- A injeção do content script agora é feita de forma programática, garantindo que o script esteja pronto antes de receber mensagens. Isso resolve o erro "Receiving end does not exist" de forma definitiva.

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
