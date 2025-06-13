# Chrome Gemini Extension

This project is a Chrome extension that integrates with Google's Gemini API to capture screenshots of selected areas on the screen and provide descriptions of the captured content.

## Project Structure

```
chrome-gemini-extension
├── src
│   ├── background.js        # Background script managing global events and communication
│   ├── content.js          # Content script for screen selection and screenshot capture
│   ├── popup
│   │   ├── popup.html      # HTML structure for the popup interface
│   │   ├── popup.js        # Logic for user interaction and screenshot capture
│   │   └── popup.css       # Styles for the popup interface
│   ├── gemini
│   │   └── api.js          # Integration with Google's Gemini API
│   └── utils
│       └── screenshot.js    # Utility functions for screenshot capture and image manipulation
├── manifest.json           # Manifest file defining permissions and settings
└── README.md               # Documentation for installation and usage
```

## Installation

1. Clone the repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click on "Load unpacked" and select the `chrome-gemini-extension` directory.

## Usage

1. Click on the extension icon in the Chrome toolbar.
2. Use the popup interface to select the area of the screen you want to capture.
3. The extension will take a screenshot of the selected area and send it to the Gemini API.
4. The description of the content in the screenshot will be displayed in the popup.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.