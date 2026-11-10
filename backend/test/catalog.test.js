const test = require('node:test');
const assert = require('node:assert/strict');
const { types } = require('pg');
const pool = require('../config/db');
const app = require('../server');

test('catalogue converts PostgreSQL NUMERIC prices to the numeric frontend contract', async () => {
  const original = pool.query;
  const driverPrice = types.getTypeParser(1700)('7000.00');
  assert.equal(typeof driverPrice, 'string');
  pool.query = async () => ({
    rows: [{ id: 1, name: 'Synthetic test', price: driverPrice, provider_id: 1 }],
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/tests`);
    assert.equal(response.status, 200);
    const rows = await response.json();
    assert.equal(rows[0].price, 7000);
    assert.equal(typeof rows[0].price, 'number');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    pool.query = original;
  }
});
