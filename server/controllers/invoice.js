const pdf = require('html-pdf');
const fs = require('fs/promises');
const fsc = require('fs');
const path = require('path');
const DefaultTemplate = require('../invoices/index.js');
const { getNextInvoiceNumber } = require('../utils/invoiceUtils');

const publicTempDir = 'public/temp';
const rootDir = path.resolve(__dirname, '../');

const createInvoice = async (req, res) => {
  try {
    const invoiceData = JSON.parse(req.body.invoiceData || '{}');

    if (!invoiceData || Object.keys(invoiceData).length === 0) {
      return res.status(400).json({ message: 'Invalid or empty payload' });
    }

    // 🧾 Generate persistent invoice number
    const newInvoiceNumber = await getNextInvoiceNumber();
    invoiceData.details.invoiceNumber = newInvoiceNumber;

    // 📁 Ensure directory exists
    const tempDirPath = path.join(rootDir, publicTempDir);
    if (!fsc.existsSync(tempDirPath)) {
      await fs.mkdir(tempDirPath, { recursive: true });
    }

    // 🖼️ Handle logo upload
    if (req.files && req.files.companyLogo) {
      const companyLogo = req.files.companyLogo;
      const ext = path.extname(companyLogo.name).toLowerCase();
      const allowedExtensions = ['.jpg', '.jpeg', '.png'];

      if (!allowedExtensions.includes(ext)) {
        return res.status(400).json({ message: 'Unsupported file format' });
      }

      const logoFileName = 'company_logo' + ext;
      const savePath = path.join(tempDirPath, logoFileName);

      await new Promise((resolve, reject) => {
        companyLogo.mv(savePath, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      invoiceData.details.companyLogo = logoFileName;
    } else {
      invoiceData.details.companyLogo = 'company_logo.jpg'; // default
    }

    // ✨ Generate HTML content
    const htmlContent = DefaultTemplate(invoiceData).trim();
    const htmlPath = path.join(tempDirPath, 'invoice.html');
    await fs.writeFile(htmlPath, htmlContent, 'utf8');

    // 📄 Read HTML for PDF generation
    const invoiceHtml = await fs.readFile(htmlPath, 'utf8');

    // 🧾 Compact, single-page PDF settings
    const options = {
      width: '80mm',
      height: '297mm',
      border: '0mm',
      base: `file://${path.resolve('public/temp')}/`,
      localUrlAccess: true, // ✅ added missing comma here
      footer: {
        height: '10mm',
        contents: {
          default: `<p style="text-align:center; font-size: 10px; margin: 0;">Thank you! Visit us again.</p>`,
        },
      },
    };
    
    // 📄 Generate PDF
    const pdfPath = path.join(tempDirPath, 'invoice.pdf');
    pdf.create(invoiceHtml, options).toFile(pdfPath, (err) => {
      if (err) {
        console.error('PDF generation error:', err);
        return res.status(500).json({ message: 'Error generating PDF' });
      }

      res.json({
        message: 'Invoice created successfully',
        invoiceNumber: newInvoiceNumber,
      });
    });

  } catch (err) {
    console.error('❌ Error in createInvoice:', err.message);
    res.status(500).json({ message: 'Server error creating invoice' });
  }
};

const sendInvoice = (req, res) => {
  const pdfPath = path.join(rootDir, publicTempDir, 'invoice.pdf');
  if (!fsc.existsSync(pdfPath)) {
    return res.status(404).json({ message: 'Invoice not found' });
  }
  res.sendFile(pdfPath);
};

module.exports = { createInvoice, sendInvoice };
