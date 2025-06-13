// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("Chrome Gemini Extension installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureScreenshot") {
        chrome.tabs.captureVisibleTab(null, {}, (image) => {
            sendResponse({ image: image });
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});