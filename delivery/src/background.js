// Este arquivo contém o código do script de fundo da extensão. Ele gerencia eventos que ocorrem em segundo plano, como a inicialização da extensão e a comunicação entre diferentes partes da extensão.

chrome.runtime.onInstalled.addListener(() => {
    // Extensão delivery instalada.
});

// Função para verificar se uma data está próxima da atual (dentro de 5 minutos)
function isDateClose(dateStr) {
    try {
        // Assumindo formato DD/MM/YYYY HH:MM
        const parts = dateStr.split(' ');
        if (parts.length !== 2) return false;
        const datePart = parts[0].split('/');
        const timePart = parts[1].split(':');
        if (datePart.length !== 3 || timePart.length !== 2) return false;
        const day = parseInt(datePart[0]);
        const month = parseInt(datePart[1]) - 1; // Mês é 0-indexado
        const year = parseInt(datePart[2]);
        const hour = parseInt(timePart[0]);
        const minute = parseInt(timePart[1]);
        const extractedDate = new Date(year, month, day, hour, minute);
        const now = new Date();
        const diffMs = extractedDate - now;
        // Considera próxima se estiver dentro de 5 minutos no futuro
        return diffMs >= 0 && diffMs <= 5 * 60 * 1000;
    } catch (error) {
        console.error('Erro ao parsear data:', dateStr, error);
        return false;
    }
}

// Função para pegar o código fonte da página e extrair datas de uma aba específica
async function getPageSourceAndDates(tabId) {
    try {
        const result = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: () => {
                const source = document.documentElement.outerHTML;
                const dateCells = document.querySelectorAll('td.td_date_created a');
                const dates = Array.from(dateCells).map(a => a.textContent.trim());
                return { source, dates };
            }
        });
        return result[0].result;
    } catch (error) {
        console.error('Erro ao pegar código fonte e datas:', error);
        return null;
    }
}

// Função para verificar aba e pegar código fonte e datas se existir
function checkTabAndGetSource(url, callback) {
    chrome.tabs.query({ url: url }, async (tabs) => {
        const exists = tabs.length > 0;
        let data = null;
        if (exists) {
            data = await getPageSourceAndDates(tabs[0].id);
        }
        callback(exists, tabs.length, data);
    });
}

// Função para atualizar a página da aba
function refreshTab(url, callback) {
    chrome.tabs.query({ url: url }, (tabs) => {
        if (tabs.length > 0) {
            chrome.tabs.reload(tabs[0].id, { bypassCache: true });
        }
        if (callback) callback();
    });
}

// Função de monitoramento
async function updateSource() {
    // Primeiro, atualizar a página da aba
    refreshTab('https://janis.in/*', async () => {
        // Aguardar um pouco para a página carregar
        setTimeout(async () => {
            // Verificar se a extensão está ativada
            const result = await chrome.storage.local.get(['enabled']);
            const enabled = result.enabled ?? true; // Padrão para true se não definido
            if (!enabled) {
                // Extensão desativada, pulando monitoramento.
                return;
            }

            checkTabAndGetSource('https://janis.in/*', (exists, count, data) => {
        if (!exists || count === 0 || !data) {
            // Nenhuma aba encontrada ou erro ao obter dados.
            chrome.storage.local.set({ aba: false }, () => {
            if (chrome.runtime.lastError) {
                console.error('Erro ao salvar aba:', chrome.runtime.lastError);
            } else {
                // Aba salva com sucesso.
            }
        });
            return;
        }

        chrome.storage.local.set({ aba: true }, () => {
            if (chrome.runtime.lastError) {
                console.error('Erro ao salvar aba:', chrome.runtime.lastError);
            } else {
                // Aba salva com sucesso.
            }
        });
        // Salvar as datas extraídas no localStorage da extensão
        chrome.storage.local.set({ extractedDates: data.dates }, () => {
            if (chrome.runtime.lastError) {
                console.error('Erro ao salvar datas:', chrome.runtime.lastError);
            } else {
                // Datas salvas no localStorage.
            }
        });
        // Aqui você pode adicionar lógica adicional, como enviar notificações ou armazenar dados
    });

    // Carregar datas do localStorage e verificar se alguma está próxima
    chrome.storage.local.get(['extractedDates', 'previousCount'], (result) => {
        const storedDates = result.extractedDates || [];
        const closeDates = storedDates.filter(date => isDateClose(date));
        const previousCount = result.previousCount || 0;
        
        // Calcular apenas os novos pedidos que chegaram
        const newOrders = closeDates.length - previousCount;
        
        // const closeDates = "13/01/2026 13:53";
        if (closeDates.length > 0) {
            console.log('Datas próximas encontradas no localStorage:', closeDates);
            console.log('Novos pedidos chegados:', newOrders);
            
            // Atualizar badge do ícone com a quantidade de novos pedidos
            if (newOrders > 0) {
                chrome.action.setBadgeText({ text: newOrders.toString() });
                chrome.action.setBadgeBackgroundColor({ color: '#FF0000' }); // Vermelho para alertar
                
                // Emitir alerta e som apenas para novos pedidos
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('delivery-bike_9561839.png'), // Ícone da extensão
                    title: 'SPID: ' + newOrders + ' Entrega(s) Próxima(s)!',
                    message: `Data e hora: ${closeDates[0]}`,
                    priority: 2
                });
                // Emitir som via TTS
                chrome.tts.speak(`SPID: ${newOrders} entrega(s) próxima(s) detectada(s)!`, { lang: 'pt-BR' });
            } else {
                // Se não há novos pedidos, manter o badge com a quantidade total
                chrome.action.setBadgeText({ text: closeDates.length.toString() });
                chrome.action.setBadgeBackgroundColor({ color: '#FF9800' }); // Laranja para avisos existentes
            }
            
            // Salvar a contagem atual para comparação futura
            chrome.storage.local.set({ previousCount: closeDates.length });
        } else {
            console.log('Nenhuma data próxima encontrada no localStorage.');
            // Limpar badge quando não houver datas próximas
            chrome.action.setBadgeText({ text: '' });
            chrome.storage.local.set({ previousCount: 0 });
        }
    });
        }, 2000); // Aguardar 2 segundos para a página carregar completamente
    });
}

// Iniciar monitoramento em background
updateSource(); // Executa imediatamente
chrome.alarms.create('updateSource', { delayInMinutes: 0, periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateSource') updateSource();
});

// Exemplo de escuta de mensagens do script de conteúdo
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'doSomething') {
        // Lógica para lidar com a mensagem
        sendResponse({ status: 'success' });
    } else if (request.action === 'checkTabExists') {
        // Verificar se existe uma aba com o URL especificado
        chrome.tabs.query({ url: request.url }, (tabs) => {
            const exists = tabs.length > 0;
            sendResponse({ exists: exists, tabCount: tabs.length });
        });
        // Retornar true para indicar que a resposta será assíncrona
        return true;
    }
});