const express = require('express');
const router = express.Router();

const {
    createInvoice,
    sendInvoice,
} = require('../controllers/invoice.js');

const {
    resetInvoiceCount,
} = require('../utils/invoiceUtils.js');

// POST route to create a new invoice
router.post('/create', createInvoice);

// GET route to download latest generated invoice PDF
router.get('/download', sendInvoice);

// POST route to reset invoice number to 0
router.post('/reset-invoice-count', (req, res) => {
    resetInvoiceCount();
    res.json({ message: 'Invoice count has been reset to 0' });
});

module.exports = router;
