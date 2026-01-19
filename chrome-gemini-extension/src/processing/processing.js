document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const metadataOutput = document.getElementById('metadataOutput');

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            processImage(file);
        }
    });

    function processImage(file) {
        metadataOutput.innerHTML = 'Loading metadata...';
        
        // This is a placeholder. In a real scenario, you'd use a library
        // like exif-js or a backend service to extract metadata.
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // Attempt to read some basic file info as a placeholder for metadata
                const result = e.target.result;
                let metadata = `File Name: ${file.name}\n`;
                metadata += `File Type: ${file.type}\n`;
                metadata += `File Size: ${file.size} bytes\n`;
                metadata += `Last Modified: ${file.lastModifiedDate}\n`;

                // For actual EXIF data, you'd integrate a library here
                // Example with a hypothetical EXIF library:
                // EXIF.getData(file, function() {
                //     const exifData = EXIF.pretty(this);
                //     metadata += "EXIF Data:\n" + exifData;
                //     metadataOutput.textContent = metadata;
                // });

                metadataOutput.textContent = metadata + "\n(Actual EXIF extraction requires a library)";

            } catch (error) {
                metadataOutput.innerHTML = `Error processing image: ${error.message}`;
            }
        };
        reader.onerror = () => {
            metadataOutput.innerHTML = 'Error reading file.';
        };
        reader.readAsArrayBuffer(file); // Or readAsDataURL depending on the library
    }
});