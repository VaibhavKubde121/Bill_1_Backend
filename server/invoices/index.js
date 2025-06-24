const fs = require('fs');
const path = require('path');
const { moneyFormat } = require('../utils/index.js');

const rootDir = path.resolve(__dirname, '../');

module.exports = function DefaultTemplate({
  details: {
    currency,
    companyLogo = 'company_logo.jpg',
    companyName = 'Ashok Disposal Store',
    companyAddress = 'Vitoba Chowk Mainline, Hinganghat, 442301',
    invoiceNumber,
    invoiceDate,
    billingName = 'Customer',
    billingPhone = '',
    billingAddress = '',
    shippingName = 'Rahul Gujar',
    shippingAddress = 'Vitoba Chowk, Hinganghat',
  },
  lineItems,
}) {
  // 🖼️ Convert logo to base64
  let logoBase64 = '';
  const logoPath = path.join(rootDir, 'public', 'temp', companyLogo);

  try {
    if (fs.existsSync(logoPath)) {
      const imageBuffer = fs.readFileSync(logoPath);
      const ext = path.extname(companyLogo).toLowerCase();
      const mimeType =
        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
          : ext === '.png' ? 'image/png'
            : '';
      if (mimeType) {
        logoBase64 = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      }
    } else {
      console.warn('⚠️ Logo not found:', logoPath);
    }
  } catch (err) {
    console.error('❌ Logo load error:', err.message);
  }

  // 🧾 Build line items
  let itemsPurchased = '';
  let total = 0;
  lineItems.forEach(item => {
    const amount = Number(item.quantity || 0) * parseFloat(item.price || 0);
    total += amount;
    itemsPurchased += `
      <tr>
        <td>${item.description || ''}</td>
        <td>${item.quantity || 0}</td>
        <td>${moneyFormat(currency, item.price || 0)}</td>
        <td>${moneyFormat(currency, amount)}</td>
      </tr>`;
  });

  // 📄 Return HTML
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Invoice</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 10px;
      color: #000;
      padding: 10px;
      margin: 0;
    }
    .header-table {
      width: 100%;
      margin-bottom: 10px;
    }
    .header-table td {
      border: none;
      vertical-align: top;
    }
    .logo {
      max-width: 80px;
    }
    .company-info h1 {
      margin: 0;
      font-size: 14px;
    }
    .company-info p {
      margin: 2px 0;
      font-size: 10px;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info h2 {
      margin: 0;
      font-size: 12px;
    }
    .invoice-info p {
      margin: 2px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 4px;
      text-align: left;
    }
    .footer-summary {
      text-align: right;
      margin-top: 10px;
    }
    .signature {
      margin-top: 20px;
      font-size: 10px;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <table class="header-table">
    <tr>
      <td style="width: 25%;">
        ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Logo" />` : ''}
      </td>
      <td class="company-info" style="width: 45%;">
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

  <!-- Billing/Shipping -->
  <table>
    <tr>
      <td>
        <strong>${billingName}</strong><br/>
        ${billingAddress ? billingAddress.split('/').join('<br/>') : ''}<br/>
        📞 +91-${billingPhone}
      </td>
      <td>
        <strong>${shippingName}</strong><br/>
        ${shippingAddress ? shippingAddress.split('/').join('<br/>') : ''}<br/>
        📞 +91-9021816598
      </td>
    </tr>
  </table>

  <!-- Items -->
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
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
