/**
 * content.js
 * Script de conteúdo para a extensão Chrome Gemini.
 * Este script será injetado nas páginas para interagir com o DOM ou enviar mensagens ao background.
 */

// Enviar uma mensagem ao background script indicando que o content script foi carregado
chrome.runtime.sendMessage({ type: "CONTENT_SCRIPT_LOADED" });

// --- Message Listener from Popup ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TOGGLE_FLOATING_WINDOW") {
        if (floatingWindow) {
            destroyFloatingWindow();
        } else {
            createFloatingWindow();
        }
        sendResponse({ status: "ok" });
        return true; // Indicate asynchronous response
    } else if (message.type === "GEMINI_ACTION") {
        // Existing message handler
        console.log("Ação recebida do background:", message.data);
        sendResponse({ status: "ok", received: message.data });
        return true;
    } else if (message.type === 'GEMINI_RESULT') {
        const resultDiv = floatingWindow.querySelector('#gemini-floating-content');
        if (message.success) {
            resultDiv.innerHTML = `<p>${message.description}</p>`;
        } else {
            resultDiv.innerHTML = `<p style="color: red;">${message.error}</p>`;
        }
    }
});

let floatingWindow = null;
let isDragging = false;
let offset = { x: 0, y: 0 }; // Offset for dragging
let initialMouseX, initialMouseY; // Initial mouse position for drag
let initialWindowX, initialWindowY; // Initial window position for drag

const STORAGE_KEY = 'geminiFloatingWindow';

// --- Floating Window Functions ---
function createFloatingWindow() {
    if (floatingWindow) return; // Window already exists

    floatingWindow = document.createElement('div');
    floatingWindow.id = 'gemini-floating-window';
    floatingWindow.style.cssText = `
        position: fixed;
        min-width: 350px;
        min-height: 200px;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 2147483647; /* Max z-index to be always on top */
        resize: both; /* Allow resizing */
        overflow: auto; /* Scroll if content overflows */
        cursor: default;
        display: flex;
        flex-direction: column;
        font-family: 'Inter', sans-serif;
        padding: 10px;
    `;
    
    floatingWindow.innerHTML = `
        <div id="gemini-floating-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; cursor: grab;">
            <span style="font-weight: bold; font-size: 1.1em;">Extensão Gemini</span>
            <button id="gemini-close-button" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666; padding: 0;">&times;</button>
        </div>
        <div id="gemini-floating-content" style="flex-grow: 1; border: 2px dashed #ccc; padding: 10px; text-align: center;">
            <p>Cole uma imagem aqui para obter uma descrição.</p>
        </div>
    `;

    document.body.appendChild(floatingWindow);

    setupDragListeners();
    floatingWindow.querySelector('#gemini-close-button').addEventListener('click', destroyFloatingWindow);

    floatingWindow.addEventListener('paste', handlePaste);

    restoreWindowPositionAndSize(); // Restore position/size on creation
    saveWindowActiveState(true); // Mark as active
}

function handlePaste(event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf('image') === 0) {
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64 = e.target.result.split(',')[1];
                const mimeType = item.type;
                
                const contentDiv = floatingWindow.querySelector('#gemini-floating-content');
                contentDiv.innerHTML = '<p>Processando imagem...</p>';

                chrome.runtime.sendMessage({
                    type: 'PROCESS_IMAGE_WITH_GEMINI',
                    base64: base64,
                    mimeType: mimeType
                });
            };
            reader.readAsDataURL(blob);
        }
    }
}

function destroyFloatingWindow() {
    if (floatingWindow && floatingWindow.parentNode) {
        // Remove drag/resize event listeners before removing element
        // (Less critical for 'document' listeners, but good practice for specific elements)
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        floatingWindow.parentNode.removeChild(floatingWindow);
        floatingWindow = null;
        saveWindowActiveState(false); // Mark as inactive
    }
}

function setupDragListeners() {
    const header = floatingWindow.querySelector('#gemini-floating-header');
    header.addEventListener('mousedown', onMouseDown);
}

function onMouseDown(e) {
    if (e.button !== 0) return; // Only left click
    isDragging = true;
    initialMouseX = e.clientX;
    initialMouseY = e.clientY;
    initialWindowX = floatingWindow.offsetLeft;
    initialWindowY = floatingWindow.offsetTop;

    floatingWindow.style.cursor = 'grabbing';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
    if (!isDragging) return;

    const dx = e.clientX - initialMouseX;
    const dy = e.clientY - initialMouseY;

    floatingWindow.style.left = `${initialWindowX + dx}px`;
    floatingWindow.style.top = `${initialWindowY + dy}px`;
}

function onMouseUp() {
    isDragging = false;
    floatingWindow.style.cursor = 'grab'; // Change back to grab for header
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    saveWindowPositionAndSize(); // Save position after drag ends
}


// --- Storage Functions ---
function saveWindowPositionAndSize() {
    if (floatingWindow) {
        const rect = floatingWindow.getBoundingClientRect();
        chrome.storage.sync.set({
            geminiFloatingWindowPosition: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                isActive: true
            }
        });
    }
}

function saveWindowActiveState(isActive) {
    chrome.storage.sync.set({
        geminiFloatingWindowPosition: {
            ... (floatingWindow ? floatingWindow.getBoundingClientRect() : {}), // Spread existing if window exists
            isActive: isActive
        }
    });
}

function restoreWindowPositionAndSize() {
    chrome.storage.sync.get(STORAGE_KEY + 'Position', (data) => {
        const savedPosition = data[STORAGE_KEY + 'Position'];
        if (savedPosition && savedPosition.isActive) {
            // Ensure window is created before setting position
            if (!floatingWindow) {
                createFloatingWindow();
            }

            if (floatingWindow) {
                // Ensure values are numbers and fallbacks
                const top = savedPosition.top !== undefined ? parseFloat(savedPosition.top) : 20;
                const left = savedPosition.left !== undefined ? parseFloat(savedPosition.left) : window.innerWidth - 370; // Default right
                const width = savedPosition.width !== undefined ? parseFloat(savedPosition.width) : 350;
                const height = savedPosition.height !== undefined ? parseFloat(savedPosition.height) : 200;

                floatingWindow.style.top = `${top}px`;
                floatingWindow.style.left = `${left}px`;
                floatingWindow.style.width = `${width}px`;
                floatingWindow.style.height = `${height}px`;
            }
        }
    });
}


// --- Initial Setup on Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    restoreWindowPositionAndSize(); // Attempt to restore window if previously active
});

// Also try to restore if content script is injected late (e.g. dynamic pages)
// or if DOMContentLoaded already fired.
restoreWindowPositionAndSize();