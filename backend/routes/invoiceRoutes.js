const express = require('express');
const axios = require('axios');
const { randomUUID } = require('node:crypto');
const pool = require('../config/db');
const { amountInKobo, validReference, hostedPaymentUrl } = require('../utils/paymentValidation');
const router = express.Router();
const bankUrl = () =>
  (process.env.BANK_API_URL || 'http://bank-api.ingress-apisix.svc.cluster.local/v1').replace(
    /\/$/,
    '',
  );

router.post('/', async (req, res) => {
  const orderId = req.body?.order_id;
  if (!validReference(orderId) || orderId.length > 50) {
    return res.status(400).json({ error: 'A valid order_id is required.' });
  }
  if (!process.env.GATEWAY_KEY)
    return res.status(503).json({ error: 'Forge sandbox is not configured.' });
  let client;
  let transaction;
  let order;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const result = await client.query(
      'SELECT id, patient_name, total_amount, payment_status FROM Orders WHERE id = $1 FOR UPDATE',
      [orderId],
    );
    order = result.rows[0];
    if (!order) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (amountInKobo(order.total_amount) === null) throw new Error('Invalid invoice amount.');
    const existing = await client.query(
      'SELECT * FROM Transactions WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1',
      [orderId],
    );
    transaction = existing.rows[0];
    if (!transaction) {
      const reference = `TXN-${randomUUID()}`;
      const created = await client.query(
        `INSERT INTO Transactions (id, order_id, transaction_reference, amount, payment_status)
        VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
        [reference, orderId, reference, order.total_amount],
      );
      transaction = created.rows[0];
    }
    await client.query('COMMIT');
  } catch {
    if (client) await client.query('ROLLBACK').catch(() => {});
    return res.status(500).json({ error: 'Unable to prepare invoice.' });
  } finally {
    client?.release();
  }

  // Persist the reference before Forge; retries use the same UUID key and body.
  try {
    let paymentLink = transaction.payment_url;
    if (!paymentLink) {
      const reference = transaction.transaction_reference;
      const response = await axios.post(
        `${bankUrl()}/payments/checkout`,
        {
          merchant_id: process.env.FORGE_MERCHANT_ID || 'mer_204',
          amount: Number(transaction.amount),
          currency: 'NGN',
          reference,
          customer: { name: order.patient_name },
          callback_url: `${(process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')}/pay/${reference}/success`,
        },
        {
          headers: { 'x-api-key': process.env.GATEWAY_KEY, 'Idempotency-Key': reference.slice(4) },
          timeout: 25000,
        },
      );
      paymentLink = response.data?.data?.payment_url;
      if (response.data?.status !== 'success' || !hostedPaymentUrl(paymentLink))
        throw new Error('Invalid hosted checkout response.');
      await pool.query('UPDATE Transactions SET payment_url = $1 WHERE id = $2', [
        paymentLink,
        transaction.id,
      ]);
    }
    if (!hostedPaymentUrl(paymentLink)) throw new Error('Invalid hosted checkout URL.');
    return res.status(201).json({
      invoice_id: transaction.transaction_reference,
      payment_link: paymentLink,
      amount: Number(transaction.amount),
      currency: 'NGN',
      patient_name: order.patient_name,
    });
  } catch {
    return res
      .status(502)
      .json({
        error: 'Forge checkout is unavailable. Retry this order; no payment has been assumed.',
        invoice_id: transaction.transaction_reference,
      });
  }
});

router.get('/:reference', async (req, res) => {
  if (!validReference(req.params.reference))
    return res.status(400).json({ error: 'Invalid invoice reference.' });
  try {
    const result = await pool.query(
      `SELECT tx.*, o.patient_name FROM Transactions tx
      JOIN Orders o ON o.id = tx.order_id WHERE tx.transaction_reference = $1`,
      [req.params.reference],
    );
    const invoice = result.rows[0];
    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
    const items = await pool.query(
      `SELECT t.name, oi.price, p.name AS provider_name FROM OrderItems oi
      JOIN Tests t ON t.id = oi.test_id JOIN Providers p ON p.id = oi.provider_id
      WHERE oi.order_id = $1 ORDER BY oi.id`,
      [invoice.order_id],
    );
    res.json({
      id: invoice.transaction_reference,
      invoice_id: invoice.transaction_reference,
      invoice_number: invoice.transaction_reference,
      patient_name: invoice.patient_name,
      provider_name: [...new Set(items.rows.map((item) => item.provider_name))].join(', '),
      date: invoice.created_at,
      tests: items.rows.map((item) => ({ name: item.name, price: Number(item.price) })),
      subtotal: Number(invoice.amount),
      total: Number(invoice.amount),
      amount: Number(invoice.amount),
      currency: 'NGN',
      payment_status: invoice.payment_status,
      payment_link: hostedPaymentUrl(invoice.payment_url) ? invoice.payment_url : null,
    });
  } catch {
    res.status(500).json({ error: 'Unable to load invoice.' });
  }
});

module.exports = router;
