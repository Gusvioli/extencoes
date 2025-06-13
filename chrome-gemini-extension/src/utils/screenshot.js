const screenshotUtils = {
    captureScreenshot: function() {
        return new Promise((resolve, reject) => {
            chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(dataUrl);
                }
            });
        });
    },

    sendToGemini: async function(imageData) {
        const response = await fetch('https://gemini.googleapis.com/v1/images:describe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${YOUR_API_KEY}` // Replace with your actual API key
            },
            body: JSON.stringify({ image: imageData })
        });

        if (!response.ok) {
            throw new Error('Failed to send image to Gemini API');
        }

        const result = await response.json();
        return result.description; // Assuming the API returns a description field
    }
};

export default screenshotUtils;