const fs = require('fs');
const path = require('path');

// Ensure rootDir is set (adjust if needed)
const rootDir = path.resolve(__dirname, '../');

// File configuration
const logoFileName = 'company_logo.jpg'; // ✅ use consistent name used in your invoice generator
const logoPath = path.join(rootDir, 'public', 'temp', logoFileName);

let logoBase64 = '';

try {
    // ✅ Check if logo file exists
    if (fs.existsSync(logoPath)) {
        const imageBuffer = fs.readFileSync(logoPath);

        // 🔍 Detect MIME type
        const ext = path.extname(logoFileName).toLowerCase();
        let mimeType = '';

        if (ext === '.jpg' || ext === '.jpeg') {
            mimeType = 'image/jpeg';
        } else if (ext === '.png') {
            mimeType = 'image/png';
        } else {
            console.warn('⚠️ Unsupported logo file type:', ext);
        }

        // ✅ Convert to base64 if valid image
        if (mimeType) {
            logoBase64 = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        }
    } else {
        console.warn('⚠️ Logo file not found at:', logoPath);
    }
} catch (err) {
    console.error('❌ Error while reading or converting logo file:', err.message);
}

// 🛡️ Optional fallback base64 if nothing loaded
if (!logoBase64) {
    logoBase64 = ''; // You can optionally use a static base64 image string here
}

module.exports = logoBase64;
