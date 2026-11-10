const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const axios = require('axios');
const pool = require('../config/db');
const router = require('../routes/invoiceRoutes');

async function scenario(
  run,
  checkout = { status: 'success', data: { payment_url: 'https://pay.xtradot.co/pay/test-token' } },
) {
  const saved = {
    query: pool.query,
    connect: pool.connect,
    post: axios.post,
    key: process.env.GATEWAY_KEY,
  };
  const transactions = [];
  const posts = [];
  const queries = [];
  const query = async (sql, params = []) => {
    queries.push(sql);
    if (/SELECT.*FROM Orders/i.test(sql))
      return {
        rows: [{ id: 'ORD-test', patient_name: 'Sandbox Patient', total_amount: '100.00' }],
      };
    if (/INSERT INTO Transactions/i.test(sql)) {
      const row = {
        id: params[0],
        order_id: params[1],
        transaction_reference: params[2],
        amount: params[3],
        payment_status: 'pending',
        patient_name: 'Sandbox Patient',
        created_at: '2026-11-10T12:00:00Z',
      };
      transactions.push(row);
      return { rows: [row] };
    }
    if (/UPDATE Transactions SET payment_url/i.test(sql)) {
      transactions[0].payment_url = params[0];
      return { rows: [transactions[0]] };
    }
    if (/FROM Transactions/i.test(sql)) return { rows: transactions };
    if (/FROM OrderItems/i.test(sql))
      return { rows: [{ name: 'Blood test', price: '100.00', provider_name: 'Sandbox Lab' }] };
    return { rows: [] };
  };
  pool.query = query;
  pool.connect = async () => ({ query, release() {} });
  process.env.GATEWAY_KEY = 'isolated-test-key';
  axios.post = async (...args) => {
    posts.push(args);
    if (checkout instanceof Error) throw checkout;
    return { data: checkout };
  };
  const app = express();
  app.use(express.json());
  app.use('/api/invoices', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const request = async (path = '', method = 'POST') => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/invoices${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(method === 'POST' ? { body: JSON.stringify({ order_id: 'ORD-test' }) } : {}),
    });
    return { status: response.status, body: await response.json() };
  };
  try {
    await run({ request, transactions, posts, queries });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    pool.query = saved.query;
    pool.connect = saved.connect;
    axios.post = saved.post;
    if (saved.key === undefined) delete process.env.GATEWAY_KEY;
    else process.env.GATEWAY_KEY = saved.key;
  }
}

test('an uncertain checkout timeout keeps one reference and replays the same idempotent request', async () => {
  await scenario(async ({ request, transactions, posts }) => {
    const first = await request();
    const retry = await request();
    assert.equal(first.status, 502);
    assert.equal(retry.status, 502);
    assert.equal(first.body.invoice_id, retry.body.invoice_id);
    assert.equal(transactions.length, 1);
    assert.deepEqual(posts[0][1], posts[1][1]);
    assert.equal(posts[0][2].headers['Idempotency-Key'], posts[1][2].headers['Idempotency-Key']);
    assert.equal(transactions[0].payment_url, undefined);
  }, new Error('Isolated provider timeout'));
});

test('invalid provider envelopes and untrusted checkout destinations never become payment links', async () => {
  for (const checkout of [
    { status: 'error', data: { payment_url: 'https://pay.xtradot.co/pay/token' } },
    { status: 'success', data: { payment_url: 'https://unexpected.example/pay/token' } },
    { status: 'success', data: { payment_url: 'javascript:alert(1)' } },
    { status: 'success', data: {} },
  ]) {
    await scenario(async ({ request, transactions }) => {
      const result = await request();
      assert.equal(result.status, 502);
      assert.equal(result.body.payment_link, undefined);
      assert.equal(transactions[0].payment_url, undefined);
    }, checkout);
  }
});

test('checkout is persisted, reloadable and reused for the same order', async () => {
  await scenario(async ({ request, transactions, posts }) => {
    const created = await request();
    assert.equal(created.status, 201);
    assert.equal(transactions[0].payment_url, 'https://pay.xtradot.co/pay/test-token');
    const repeated = await request();
    assert.equal(repeated.body.invoice_id, created.body.invoice_id);
    assert.equal(posts.length, 1);
    const loaded = await request(`/${created.body.invoice_id}`, 'GET');
    assert.equal(loaded.status, 200);
    assert.equal(loaded.body.payment_link, created.body.payment_link);
    assert.equal(loaded.body.total, 100);
    assert.equal(posts[0][1].currency, 'NGN');
    assert.match(posts[0][2].headers['Idempotency-Key'], /^[0-9a-f-]{36}$/);
  });
});
