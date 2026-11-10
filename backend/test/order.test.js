const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const pool = require('../config/db');
const router = require('../routes/orderRoutes');

async function scenario(run, connect) {
  const original = pool.connect;
  pool.connect = connect;
  const app = express();
  app.use(express.json());
  app.use('/api/orders', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    await run(async (body) => {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return {
        status: response.status,
        type: response.headers.get('content-type'),
        text: await response.text(),
      };
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    pool.connect = original;
  }
}

test('invalid patient references and duplicate or non-integer test ids are rejected before database access', async () => {
  let connections = 0;
  await scenario(
    async (request) => {
      for (const payload of [
        { patient_name: '   ', test_ids: [1] },
        { patient_name: {}, test_ids: [1] },
        { patient_name: 'Sandbox', test_ids: [1, 1] },
        { patient_name: 'Sandbox', test_ids: ['1'] },
        { patient_name: 'Sandbox', test_ids: [-1] },
      ])
        assert.equal((await request(payload)).status, 400);
      assert.equal(connections, 0);
    },
    async () => {
      connections++;
      throw new Error('Must not connect');
    },
  );
});

test('database connection failure returns a safe JSON error instead of an Express HTML exception', async () => {
  await scenario(
    async (request) => {
      const result = await request({ patient_name: 'Sandbox', test_ids: [1] });
      assert.equal(result.status, 503);
      assert.match(result.type, /application\/json/);
      assert.doesNotMatch(result.text, /private-database-detail/);
    },
    async () => {
      throw new Error('private-database-detail');
    },
  );
});

test('order totals are calculated in integer kobo and references are collision-resistant', async () => {
  const statements = [];
  await scenario(
    async (request) => {
      const response = await request({ patient_name: ' Sandbox ', test_ids: [1, 2] });
      assert.equal(response.status, 201);
      const order = JSON.parse(response.text);
      assert.equal(order.total_amount, 0.3);
      assert.match(order.id, /^ORD-[0-9a-f-]{36}$/);
      const insert = statements.find(([sql]) => sql.includes('INSERT INTO Orders'));
      assert.equal(insert[1][1], 'Sandbox');
    },
    async () => ({
      query: async (sql, params) => {
        statements.push([sql, params]);
        return {
          rows: sql.includes('SELECT id, price')
            ? [
                { id: 1, price: '0.10', provider_id: 1 },
                { id: 2, price: '0.20', provider_id: 1 },
              ]
            : [],
        };
      },
      release() {},
    }),
  );
});
