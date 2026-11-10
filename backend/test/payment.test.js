const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const axios = require('axios');
const pool = require('../config/db');
const router = require('../routes/paymentRoutes');

async function verify(payment, reference = 'TXN-test', options = {}) {
  const oldGet = axios.get;
  const oldQuery = pool.query;
  const oldKey = process.env.GATEWAY_KEY;
  let writes = 0;
  let reads = 0;
  let bankCalls = 0;
  const sqlLog = [];
  let successful = options.alreadySuccessful || false;
  if (options.unconfigured) delete process.env.GATEWAY_KEY;
  else process.env.GATEWAY_KEY = 'isolated-test-key';
  pool.query = async () => {
    reads++;
    return {
      rows: options.notFound
        ? []
        : [
            {
              id: reference,
              transaction_reference: reference,
              order_id: 'ORD-test',
              amount: '100.00',
            },
          ],
    };
  };
  const oldConnect = pool.connect;
  pool.connect = async () => {
    writes++;
    return {
      query: async (sql) => {
        sqlLog.push(sql);
        if (/INSERT INTO PaymentSplits/.test(sql) && options.failAllocation)
          throw new Error('Isolated database error');
        if (/UPDATE Transactions/.test(sql)) successful = true;
        return { rows: [{ payment_status: successful ? 'successful' : 'pending' }] };
      },
      release() {},
    };
  };
  axios.get = async () => {
    bankCalls++;
    if (payment instanceof Error) throw payment;
    return {
      data: options.badEnvelope
        ? { status: 'error', data: payment }
        : { status: 'success', data: payment },
    };
  };
  const app = express();
  app.use('/api/payment', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/payment/verify?transaction_reference=${encodeURIComponent(reference)}`,
    );
    return {
      status: response.status,
      body: await response.json(),
      writes,
      reads,
      bankCalls,
      sqlLog,
    };
  } finally {
    await new Promise((resolve) => server.close(resolve));
    axios.get = oldGet;
    pool.query = oldQuery;
    pool.connect = oldConnect;
    if (oldKey === undefined) delete process.env.GATEWAY_KEY;
    else process.env.GATEWAY_KEY = oldKey;
  }
}

const confirmation = {
  status: 'successful',
  amount: '100.00',
  amount_paid: '100.00',
  currency: 'NGN',
  reference: 'TXN-test',
};

test('successful confirmations require an exact, valid amount_paid before database writes', async () => {
  for (const amount_paid of [undefined, null, 0, -1, '99.99', '100.01', '1e2', '100.001', true, {}, Infinity]) {
    const result = await verify({ ...confirmation, amount_paid });
    assert.equal(result.status, 502, `amount_paid=${String(amount_paid)}`);
    assert.notEqual(result.body.payment_status, 'successful');
    assert.equal(result.writes, 0);
  }
});

test('confirmed payment reports NGN allocation rather than claiming settlement', async () => {
  const result = await verify(confirmation);
  assert.equal(result.status, 200);
  assert.equal(result.body.payment_status, 'successful');
  assert.equal(result.body.currency, 'NGN');
  assert.equal(result.body.allocation_status, 'allocated');
  assert.equal(result.sqlLog.filter((sql) => /INSERT INTO PaymentSplits/.test(sql)).length, 1);
  assert.equal(result.sqlLog.at(-1), 'COMMIT');
});

test('documented omitted currency still reports NGN and allocates exact payment only', async () => {
  const payment = { ...confirmation };
  delete payment.currency;
  const result = await verify(payment);
  assert.equal(result.status, 200);
  assert.equal(result.body.currency, 'NGN');
  assert.equal(result.body.allocation_status, 'allocated');
  assert.equal(result.sqlLog.filter((sql) => /INSERT INTO PaymentSplits/.test(sql)).length, 1);
});

test('non-success states without amount_paid never allocate', async () => {
  for (const status of ['pending', 'failed', 'partial', 'overpaid', 'reversed']) {
    const payment = { ...confirmation, status };
    delete payment.currency;
    delete payment.amount_paid;
    const result = await verify(payment);
    assert.equal(result.status, 200);
    assert.equal(result.body.payment_status, status);
    assert.equal(result.body.allocation_status, undefined);
    assert.equal(result.sqlLog.filter((sql) => /INSERT INTO PaymentSplits/.test(sql)).length, 0);
  }
});

test('replayed verification never inserts another provider allocation', async () => {
  const result = await verify(confirmation, 'TXN-test', { alreadySuccessful: true });
  assert.equal(result.body.payment_status, 'successful');
  assert.equal(result.sqlLog.filter((sql) => /INSERT INTO PaymentSplits/.test(sql)).length, 0);
});

test('database allocation failure rolls back and cannot report success', async () => {
  const result = await verify(confirmation, 'TXN-test', { failAllocation: true });
  assert.equal(result.status, 502);
  assert.equal(result.sqlLog.at(-1), 'ROLLBACK');
});

test('provider failures, absent configuration and missing transactions fail closed', async () => {
  for (const [payment, options, status] of [
    [new Error('Isolated timeout'), {}, 502],
    [confirmation, { badEnvelope: true }, 502],
    [confirmation, { unconfigured: true }, 503],
    [confirmation, { notFound: true }, 404],
  ]) {
    const result = await verify(payment, 'TXN-test', options);
    assert.equal(result.status, status);
    assert.equal(result.writes, 0);
  }
});

test('a reversed payment removes only local allocations and records the reversal atomically', async () => {
  const result = await verify({ ...confirmation, status: 'reversed' }, 'TXN-test', {
    alreadySuccessful: true,
  });
  assert.equal(result.body.payment_status, 'reversed');
  assert.ok(result.sqlLog.some((sql) => /DELETE FROM PaymentSplits/.test(sql)));
  assert.equal(result.sqlLog.at(-1), 'COMMIT');
});

test('pending, failed, reversed, partial and overpaid never allocate', async () => {
  for (const status of ['pending', 'failed', 'reversed', 'partial', 'overpaid']) {
    const result = await verify({ ...confirmation, status });
    assert.equal(result.body.payment_status, status);
    assert.equal(result.sqlLog.filter((sql) => /INSERT INTO PaymentSplits/.test(sql)).length, 0);
  }
});

test('malformed references are rejected before touching the database or bank', async () => {
  for (const reference of ['', '../unexpected', ' reference ', 'x'.repeat(256)]) {
    const result = await verify({}, reference);
    assert.equal(result.status, 400);
    assert.equal(result.reads, 0);
    assert.equal(result.bankCalls, 0);
  }
});

test('verification rejects untrusted provider confirmations before allocating', async () => {
  for (const patch of [
    { reference: 'another-invoice' },
    { reference: undefined },
    { currency: 'USD' },
    { currency: null },
    { currency: '' },
    { currency: undefined },
    { amount: null },
    { amount: '1e2' },
    { amount: '100.001' },
    { status: 'unrecognised' },
  ]) {
    const result = await verify({
      ...confirmation,
      ...patch,
    });
    assert.equal(result.status, 502, JSON.stringify(patch));
    assert.equal(result.writes, 0);
  }
});

test('a successful provider status with the wrong amount never becomes payment success', async () => {
  const result = await verify({
    status: 'successful',
    amount: '99.00',
    currency: 'NGN',
    reference: 'TXN-test',
  });
  assert.equal(result.status, 502);
  assert.notEqual(result.body.payment_status, 'successful');
  assert.equal(result.writes, 0);
});
