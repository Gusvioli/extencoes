# Guia de Submissão para a Chrome Web Store

Este documento contém as informações necessárias para preencher a ficha da loja e a aba de privacidade no painel de desenvolvedor do Chrome.

## 1. Ficha da Loja (Store Listing) - Português (Brasil)

**Nome da Extensão:**
`Limpador de histórico de navegação`

**Resumo (Short Description):**
`Gerencie seu histórico com facilidade: limpeza seletiva, remoção total e exportação para CSV. Suporte a múltiplos idiomas.`

**Descrição Detalhada (Detailed Description):**
> Copie e cole o texto abaixo:

Mantenha seu navegador leve e proteja sua privacidade com o Limpador de Histórico de Navegação. Esta ferramenta essencial permite gerenciar seus dados de navegação de forma rápida, segura e eficiente.

**Principais Funcionalidades:**

* **🗑️ Limpeza Seletiva:** Pesquise por termos específicos (como "facebook", "youtube" ou qualquer site) e apague apenas esses registros do seu histórico, mantendo o restante intacto.
* **🧹 Limpeza Total:** Remova todo o histórico de navegação com apenas um clique. Inclui um mecanismo de confirmação para evitar acidentes.
* **📂 Exportação de Dados (Backup):** Precisa salvar seu histórico antes de limpar? Exporte todos os dados para um arquivo CSV compatível com Excel e Planilhas Google.
* **🌍 Multi-idioma:** Interface totalmente traduzida e adaptada para Português (Brasil), Inglês e Espanhol.
* **🔒 Privacidade Garantida:** Todo o processamento é realizado localmente no seu computador. Nenhum dado é enviado para servidores externos.
* **⚡ Leve e Rápida:** Interface moderna e otimizada que não pesa no seu navegador.

Ideal para desenvolvedores, testadores e qualquer pessoa preocupada com a privacidade digital que deseja um controle granular sobre o histórico do navegador.

---

**Categoria:**
`Ferramentas de Pesquisa` ou `Produtividade`

**Idioma Principal:**
`Português (Brasil)`

## 1.1. Ficha da Loja (Store Listing) - English

Caso deseje adicionar um idioma secundário na loja (English).

**Name:**
`History Cleaner & Manager`

**Summary:**
`Easily manage your history: selective cleaning, full removal, and CSV export. Multi-language support.`

**Detailed Description:**
> Copy and paste the text below:

Keep your browser light and protect your privacy with History Cleaner. This essential tool allows you to manage your browsing data quickly, securely, and efficiently.

**Key Features:**

*   **🗑️ Selective Cleaning:** Search for specific terms (like "facebook", "youtube", or any site) and delete only those records from your history, keeping the rest intact.
*   **🧹 Full Cleaning:** Remove your entire browsing history with just one click. Includes a safety confirmation mechanism to prevent accidents.
*   **📂 Data Export (Backup):** Need to save your history before cleaning? Export all data to a CSV file compatible with Excel and Google Sheets.
*   **🌍 Multi-language:** Interface fully translated and adapted for Portuguese (Brazil), English, and Spanish.
*   **🔒 Privacy Guaranteed:** All processing is performed locally on your computer. No data is sent to external servers.
*   **⚡ Lightweight & Fast:** Modern and optimized interface that doesn't slow down your browser.

Ideal for developers, testers, and anyone concerned about digital privacy who wants granular control over their browser history.

---

## 2. Práticas de Privacidade (Privacy Practices)

Nesta seção, você deve justificar por que a extensão precisa de cada permissão listada no `manifest.json`.

**Propósito Único (Single Purpose):**
`Gerenciamento e limpeza do histórico de navegação.`

**Justificativa das Permissões (Permission Justification):**

* **`history`**:
    > A extensão precisa desta permissão para acessar a API `chrome.history`. Isso é fundamental para listar as URLs visitadas, permitir que o usuário pesquise por termos específicos dentro do histórico e executar a ação de deletar itens individuais ou limpar todo o histórico conforme solicitado pelo usuário.

* **`downloads`**:
    > Esta permissão é necessária exclusivamente para a funcionalidade de "Exportar". A extensão gera um arquivo `.csv` localmente contendo os dados do histórico e utiliza a API `chrome.downloads` para salvar este arquivo no computador do usuário.

* **`unlimitedStorage`**:
    > Utilizada para garantir que a extensão possa processar e gerar o arquivo de exportação (blob) sem restrições de cota de armazenamento temporário, assegurando que usuários com históricos de navegação muito extensos consigam realizar o backup sem erros.

**Uso de Dados (Data Usage):**

* **A extensão coleta dados do usuário?** Sim (Dados de atividade do usuário/Histórico da Web).
  * *Nota:* Marque que os dados **NÃO** são transmitidos para fora do dispositivo e **NÃO** são vendidos a terceiros. O processamento é local.

## 3. Ativos Gráficos (Graphic Assets)

Você precisará fazer upload das seguintes imagens (não incluídas no zip da extensão, devem ser enviadas separadamente):

1. **Ícone da Loja:** 128x128 pixels (PNG).
2. **Capturas de Tela (Screenshots):** Mínimo de 1 (Recomendado: 3 a 5).
    * Tamanho: 1280x800 pixels ou 640x400 pixels (JPEG ou PNG).
    * *Sugestão:* Tire prints da tela inicial, do resultado da busca e do modal de confirmação.
3. **Imagem Promocional Pequena (Marquee):** 440x280 pixels.
    * Esta imagem aparece nos resultados de busca da loja.
