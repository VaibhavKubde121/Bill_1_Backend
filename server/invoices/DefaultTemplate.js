const fs = require('fs');
const path = require('path');

// Define root directory of the project
const rootDir = path.resolve(__dirname, '../');

// Expected logo filename and path
const logoFileName = 'company_logo.jpg'; // Use consistent filename throughout
const logoPath = path.join(rootDir, 'public', 'temp', logoFileName);

let logoBase64 = '';

try {
    // ✅ Check if logo exists
    if (fs.existsSync(logoPath)) {
        const imageBuffer = fs.readFileSync(logoPath);

        // ✅ Determine correct MIME type
        const ext = path.extname(logoFileName).toLowerCase();
        let mimeType = '';
        if (ext === '.jpg' || ext === '.jpeg') {
            mimeType = 'image/jpeg';
        } else if (ext === '.png') {
            mimeType = 'image/png';
        } else {
            console.warn('⚠️ Unsupported logo file type:', ext);
        }

        // ✅ Convert image to base64 if MIME type is valid
        if (mimeType) {
            const base64Data = imageBuffer.toString('base64');
            logoBase64 = `data:${mimeType};base64,${base64Data}`;
        }
    } else {
        console.warn(`⚠️ Logo file not found at: ${logoPath}`);
    }
} catch (err) {
    console.error('❌ Error reading or converting logo file:', err.message);
}

// Optional fallback base64 image string (empty if none)
if (!logoBase64) {
    logoBase64 = ''; // Optionally add a fallback base64 logo here
}

module.exports = logoBase64;
