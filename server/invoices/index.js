const fs = require('fs');
const path = require('path');
const { moneyFormat } = require('../utils/index.js');

const rootDir = path.resolve(__dirname, '../');

module.exports = function DefaultTemplate({
  details: {
    currency,
    companyLogo = 'company_logo.jpg', // ✅ Updated to match your actual filename
    companyName = 'Ashok Disposal Store',
    companyAddress = 'Vitoba Chowk Mainline,Hinganghat,442301',
    invoiceNumber,
    invoiceDate,
    billingName = 'Customer',
    billingPhone = '',
    billingAddress = '',
    shippingName = 'Rahul Gujar',
    shippingAddress = 'Vitoba Chowk , Hinganghat',
  },
  lineItems,
}) {
  // ✅ Embed logo as base64
  let logoBase64 = '';
  const logoPath = path.join(rootDir, 'public', 'temp', companyLogo);

  try {
    if (fs.existsSync(logoPath)) {
      const imageBuffer = fs.readFileSync(logoPath);
      const ext = path.extname(companyLogo).toLowerCase();
      const mimeType =
        ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : ext === '.png'
            ? 'image/png'
            : '';
      if (mimeType) {
        logoBase64 = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      } else {
        console.warn('⚠️ Unsupported logo file type:', ext);
      }
    } else {
      console.warn('⚠️ Logo file not found at:', logoPath);
    }
  } catch (e) {
    console.warn('⚠️ Failed to load logo image:', e.message);
  }

  // 🧾 Create line items
  let itemsPurchased = '';
  let total = 0;

  lineItems.forEach((item) => {
    const amount = Number(item.quantity || 0) * parseFloat(item.price || 0);
    total += amount;
    itemsPurchased += `
      <tr>
        <td>${item.description || ''}</td>
        <td>${item.quantity || 0}</td>
        <td>${moneyFormat(currency, item.price || 0)}</td>
        <td><b>${moneyFormat(currency, amount)}</b></td>
      </tr>`;
  });

  // 🔧 Return HTML string
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Invoice</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f9f9f9;
      color: #333;
    }
    .logo {
      max-width: 180px;
      background-color: #f9f9f9;
      padding: 4px;
      margin-top: -8px;
      margin-bottom: 9px;
      border-radius: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 8px;
      border: 1px solid #ccc;
      text-align: left;
    }
    .header-table {
      margin-bottom: 20px;
    }
    .header-table td {
      border: none;
      vertical-align: top;
    }
    .company-info {
      padding-left: 10px;
    }
    .company-info h1 {
      margin: 0;
      font-size: 26px;
      margin-top: 10px;
    }
    .company-info p {
      margin: 2px 0;
      font-size: 14px;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info h2 {
      margin: 0 0 6px 0;
      font-size: 18px;
    }
    .invoice-info p {
      font-size: 13px;
    }
    .footer-summary {
      float: right;
      margin-top: 20px;
      text-align: right;
    }
    .signature {
      margin-top: 40px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <!-- Header Section -->
  <table class="header-table">
    <tr>
      <td style="width: 20%;">
        ${logoBase64 ? `<img class="logo" src="${logoBase64}" alt="Company Logo" />` : ''}
      </td>
      <td class="company-info" style="width: 50%;">
        <h1>${companyName}</h1>
        <p>${companyAddress}</p>
        <p>📞 +91-8421997651, 📞 +91-9021816598</p>
      </td>
      <td class="invoice-info" style="width: 30%;">
        <h2>Invoice</h2>
        <p><strong>No:</strong> ${invoiceNumber}</p>
        <p><strong>Date:</strong> ${invoiceDate}</p>
      </td>
    </tr>
  </table>

  <!-- Billing / Shipping -->
  <table>
    <tr>
      <td>
        <p><strong>${billingName}</strong></p>
        <p>${billingAddress ? billingAddress.split('/').join('<br/>') : ''}</p>
        <p>📞 +91-${billingPhone}</p>
      </td>
      <td>
        <p><strong>${shippingName}</strong></p>
        <p>${shippingAddress ? shippingAddress.split('/').join('<br/>') : ''}</p>
        <p>📞 +91-9021816598</p>
      </td>
    </tr>
  </table>

  <!-- Items Table -->
  <table style="margin-top: 20px;">
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty.</th>
        <th>Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsPurchased}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="footer-summary">
    <p><strong>Subtotal:</strong> ${moneyFormat(currency, total)}</p>
    <p><strong>Total:</strong> <b>${moneyFormat(currency, total)}</b></p>
  </div>

  <!-- Signature -->
  <div class="signature">
    <p><strong>Signature By</strong><br>${companyName}</p>
  </div>
</body>
</html>`;
};
