// popup.js

document.addEventListener('DOMContentLoaded', function() {
    const captureButton = document.getElementById('capture-button');
    captureButton.addEventListener('click', captureScreen);
});

function captureScreen() {
    chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
        sendToGemini(dataUrl);
    });
}

function sendToGemini(imageData) {
    fetch('https://gemini.googleapis.com/v1/describe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getAccessToken() // Implement getAccessToken to retrieve the token
        },
        body: JSON.stringify({ image: imageData })
    })
    .then(response => response.json())
    .then(data => {
        displayDescription(data.description);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayDescription(description) {
    const descriptionElement = document.getElementById('description');
    descriptionElement.textContent = description;
}