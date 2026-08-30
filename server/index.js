require('dotenv').config();
require('express-async-errors'); // forwards async route errors to the handler below
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Fallback error handler so route rejections return JSON, not HTML.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`POS API running on http://localhost:${PORT}`));
