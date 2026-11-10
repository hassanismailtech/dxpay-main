const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const axios = require('axios');
const pool = require('../config/db');
const router = require('../routes/paymentRoutes');

test('delayed success cannot resurrect allocations after a newer reversal', async () => {
  const original = {
    query: pool.query,
    connect: pool.connect,
    get: axios.get,
    key: process.env.GATEWAY_KEY,
  };
  let status = 'successful';
  let allocations = 1;
  let calls = 0;
  let releaseOlder;
  let markOlderStarted;
  const olderStarted = new Promise((resolve) => {
    markOlderStarted = resolve;
  });
  const delayed = new Promise((resolve) => {
    releaseOlder = resolve;
  });
  const confirmation = { reference: 'TXN-race', currency: 'NGN', amount: '100.00' };
  process.env.GATEWAY_KEY = 'isolated-test-key';
  pool.query = async () => ({
    rows: [
      { id: 'TXN-race', transaction_reference: 'TXN-race', order_id: 'ORD-test', amount: '100.00' },
    ],
  });
  pool.connect = async () => ({
    query: async (sql) => {
      if (/SELECT payment_status/.test(sql)) return { rows: [{ payment_status: status }] };
      if (/UPDATE Transactions SET payment_status='reversed'/.test(sql)) status = 'reversed';
      if (/UPDATE Transactions SET payment_status='successful'/.test(sql)) status = 'successful';
      if (/DELETE FROM PaymentSplits/.test(sql)) allocations = 0;
      if (/INSERT INTO PaymentSplits/.test(sql)) allocations++;
      return { rows: [] };
    },
    release() {},
  });
  axios.get = async () => {
    if (++calls === 1) {
      markOlderStarted();
      await delayed;
      return { data: { status: 'success', data: { ...confirmation, status: 'successful' } } };
    }
    return { data: { status: 'success', data: { ...confirmation, status: 'reversed' } } };
  };
  const app = express();
  app.use('/api/payment', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/payment/verify?transaction_reference=TXN-race`;
  try {
    const older = fetch(url);
    await olderStarted;
    const reversal = await fetch(url);
    assert.equal((await reversal.json()).payment_status, 'reversed');
    assert.equal(status, 'reversed');
    releaseOlder();
    const response = await older;
    const body = await response.json();
    assert.equal(body.payment_status, 'reversed');
    assert.equal(body.allocation_status, undefined);
    assert.equal(status, 'reversed');
    assert.equal(allocations, 0);
  } finally {
    releaseOlder();
    await new Promise((resolve) => server.close(resolve));
    pool.query = original.query;
    pool.connect = original.connect;
    axios.get = original.get;
    if (original.key === undefined) delete process.env.GATEWAY_KEY;
    else process.env.GATEWAY_KEY = original.key;
  }
});
