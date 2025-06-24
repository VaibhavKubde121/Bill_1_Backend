const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '../invoiceStore.json');

/**
 * Reads and returns the current invoice count from storage.
 * Creates the store file if it doesn't exist.
 * @returns {number}
 */
function readInvoiceCount() {
    if (!fs.existsSync(storePath)) {
        fs.writeFileSync(storePath, JSON.stringify({ lastInvoiceNumber: 0 }, null, 2), 'utf8');
        return 0;
    }

    try {
        const data = fs.readFileSync(storePath, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.lastInvoiceNumber || 0;
    } catch (err) {
        console.error('Error reading invoice store:', err);
        return 0;
    }
}

/**
 * Increments and returns the next invoice number.
 * Format: INV-<number>
 */
function getNextInvoiceNumber() {
    const current = readInvoiceCount();
    const next = current + 1;

    try {
        fs.writeFileSync(storePath, JSON.stringify({ lastInvoiceNumber: next }, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing to invoice store:', err);
    }

    return `INV-${next}`;
}

/**
 * Resets invoice number to zero
 */
function resetInvoiceCount() {
    try {
        fs.writeFileSync(storePath, JSON.stringify({ lastInvoiceNumber: 0 }, null, 2), 'utf8');
        console.log('Invoice count reset to 0');
    } catch (err) {
        console.error('Error resetting invoice count:', err);
    }
}

module.exports = {
    getNextInvoiceNumber,
    resetInvoiceCount
};
