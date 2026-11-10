const express = require('express');
const axios = require('axios');
const pool = require('../config/db');
const { validReference, validatedPayment } = require('../utils/paymentValidation');
const router = express.Router();

router.get('/verify', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const reference = req.query.transaction_reference;
  if (!validReference(reference)) {
    return res.status(400).json({ error: 'A valid transaction reference is required.' });
  }
  if (!process.env.GATEWAY_KEY)
    return res.status(503).json({ error: 'Forge sandbox is not configured.' });
  try {
    const result = await pool.query('SELECT * FROM Transactions WHERE transaction_reference = $1', [
      reference,
    ]);
    if (!result.rows.length) return res.status(404).json({ error: 'Transaction not found.' });
    const txn = result.rows[0];
    const bankUrl = (
      process.env.BANK_API_URL || 'http://bank-api.ingress-apisix.svc.cluster.local/v1'
    ).replace(/\/$/, '');
    const response = await axios.get(
      `${bankUrl}/payments/${encodeURIComponent(reference)}/verify`,
      {
        headers: { 'x-api-key': process.env.GATEWAY_KEY },
        timeout: 25000,
      },
    );
    const payment = validatedPayment(response.data, txn);
    if (!['successful', 'reversed'].includes(payment.status)) {
      return res.json({
        payment_status: payment.status,
        reference,
        amount: Number(txn.amount),
        currency: 'NGN',
      });
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const locked = await client.query(
        'SELECT payment_status FROM Transactions WHERE id=$1 FOR UPDATE',
        [txn.id],
      );
      if (!locked.rows.length) throw new Error('Transaction no longer exists.');
      // Reversal is terminal for this reference. An older in-flight success must not restore value.
      if (locked.rows[0].payment_status === 'reversed') {
        await client.query('COMMIT');
        return res.json({
          payment_status: 'reversed',
          amount: Number(txn.amount),
          reference,
          currency: 'NGN',
        });
      }
      if (payment.status === 'reversed') {
        // This reverses local accounting only; no bank transfer is attempted.
        await client.query('DELETE FROM PaymentSplits WHERE transaction_id = $1', [txn.id]);
        await client.query("UPDATE Transactions SET payment_status='reversed' WHERE id=$1", [
          txn.id,
        ]);
        await client.query("UPDATE Orders SET payment_status='reversed' WHERE id=$1", [
          txn.order_id,
        ]);
      } else if (locked.rows[0].payment_status !== 'successful') {
        await client.query("UPDATE Transactions SET payment_status='successful' WHERE id=$1", [
          txn.id,
        ]);
        await client.query("UPDATE Orders SET payment_status='successful' WHERE id=$1", [
          txn.order_id,
        ]);
        await client.query(
          "INSERT INTO PaymentSplits (transaction_id,provider_id,amount,status) SELECT $1,provider_id,SUM(price),'allocated' FROM OrderItems WHERE order_id=$2 GROUP BY provider_id",
          [txn.id, txn.order_id],
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    res.json({
      payment_status: payment.status,
      amount: Number(txn.amount),
      reference,
      currency: 'NGN',
      ...(payment.status === 'successful' ? { allocation_status: 'allocated' } : {}),
    });
  } catch {
    res.status(502).json({ error: 'Unable to verify payment with Forge sandbox.' });
  }
});
module.exports = router;
