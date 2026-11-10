require('dotenv').config({ path: require('node:path').join(__dirname, '.env'), quiet: true });
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.get('/healthz', (req, res) => res.json({ ok: true }));
app.get('/api/tests', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, price, provider_id FROM Tests ORDER BY id');
    res.json(result.rows.map((test) => ({ ...test, price: Number(test.price) })));
  } catch {
    res.status(500).json({ error: 'Unable to load tests.' });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));
}

module.exports = app;
