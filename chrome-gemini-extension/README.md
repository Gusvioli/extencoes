# Resolva Questões por Imagem

Esta extensão para Google Chrome utiliza inteligência artificial para ajudar estudantes e profissionais a obter respostas automáticas a partir de imagens de questões. Basta colar, arrastar ou capturar uma imagem de uma questão (prova, exercício, tarefa, etc.) na janela da extensão e, em poucos segundos, você recebe a resposta detalhada.

## Estrutura do Projeto

```
chrome-gemini-extension
├── src
│   ├── background.js        # Script de background para eventos globais e comunicação
│   ├── content.js           # Script de conteúdo para interação com páginas
│   ├── popup
│   │   ├── popup.html       # Estrutura HTML da interface popup
│   │   ├── popup.js         # Lógica de interação do usuário e processamento de imagem
│   │   └── popup.css        # Estilos da interface popup
├── icons/                   # Ícones da extensão
├── manifest.json            # Manifesto com permissões e configurações
└── README.md                # Documentação de instalação e uso
```

## Instalação

1. Clone o repositório para sua máquina local.
2. Abra o Chrome e acesse `chrome://extensions/`.
3. Ative o "Modo do desenvolvedor" no canto superior direito.
4. Clique em "Carregar sem compactação" e selecione a pasta `chrome-gemini-extension`.

## Como Usar

1. Clique no ícone da extensão na barra de ferramentas do Chrome.
2. Cole, arraste ou capture uma imagem de uma questão na área indicada.
3. Aguarde alguns segundos enquanto a inteligência artificial processa a imagem.
4. Veja a resposta gerada automaticamente na tela.

## Contribuição

Sinta-se à vontade para enviar issues ou pull requests com melhorias ou correções de bugs.

## Licença

Este projeto está licenciado sob a Licença MIT.
