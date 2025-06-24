const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const routes = require('./routes/web.js'); // Import your routes

// Initialize express app
const app = express();

// Stores server port number
const PORT = process.env.PORT || 5001;

// 🔢 Ensure invoice-count.txt exists
const invoiceCountFile = path.join(__dirname, 'invoice-count.txt');
if (!fs.existsSync(invoiceCountFile)) {
  fs.writeFileSync(invoiceCountFile, '0', 'utf8');
}

// ===== Middleware =====
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 1024 * 1024 }, // 1MB
    abortOnLimit: true,
  })
);

// ===== Routes =====
app.use('/', routes);

// Catch-all middleware for unmatched routes
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message,
    },
  });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
