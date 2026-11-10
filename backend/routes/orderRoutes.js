const express = require('express');
const { randomUUID } = require('node:crypto');
const pool = require('../config/db');
const { amountInKobo } = require('../utils/paymentValidation');
const router = express.Router();

router.post('/', async (req, res) => {
  const { patient_name, test_ids } = req.body || {};
  if (
    typeof patient_name !== 'string' ||
    !patient_name.trim() ||
    patient_name.trim().length > 255 ||
    !Array.isArray(test_ids) ||
    test_ids.length === 0 ||
    test_ids.length > 100 ||
    test_ids.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
    new Set(test_ids).size !== test_ids.length
  )
    return res
      .status(400)
      .json({ error: 'A patient reference and unique positive integer test_ids are required.' });

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const tests = await client.query(
      'SELECT id, price, provider_id FROM Tests WHERE id = ANY($1::int[])',
      [test_ids],
    );
    if (tests.rows.length !== test_ids.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'One or more selected tests are unavailable.' });
    }
    const prices = tests.rows.map((test) => amountInKobo(test.price));
    if (prices.some((price) => price === null)) throw new Error('Invalid catalogue price.');
    const totalKobo = prices.reduce((sum, price) => sum + price, 0);
    if (!Number.isSafeInteger(totalKobo)) throw new Error('Invalid order total.');
    const totalAmount = totalKobo / 100;
    const orderId = `ORD-${randomUUID()}`;
    await client.query('INSERT INTO Orders (id, patient_name, total_amount) VALUES ($1, $2, $3)', [
      orderId,
      patient_name.trim(),
      totalAmount,
    ]);
    for (const test of tests.rows) {
      await client.query(
        'INSERT INTO OrderItems (order_id, test_id, provider_id, price) VALUES ($1, $2, $3, $4)',
        [orderId, test.id, test.provider_id, test.price],
      );
    }
    await client.query('COMMIT');
    return res.status(201).json({ id: orderId, order_id: orderId, total_amount: totalAmount });
  } catch {
    if (client) await client.query('ROLLBACK').catch(() => {});
    return res
      .status(client ? 500 : 503)
      .json({
        error: client
          ? 'Unable to create the diagnostic order.'
          : 'The order database is unavailable. Please try again.',
      });
  } finally {
    client?.release();
  }
});

module.exports = router;
