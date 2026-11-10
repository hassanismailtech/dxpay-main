const test = require('node:test');
const assert = require('node:assert/strict');
const pool = require('../config/db');
const app = require('../server');

async function probe(query) {
  const saved = pool.query;
  pool.query = query;
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const ready = await fetch(`${origin}/readyz`);
    const health = await fetch(`${origin}/healthz`);
    const body = ready.headers.get('content-type')?.includes('application/json') ? await ready.json() : null;
    return { status: ready.status, body, health: health.status };
  } finally {
    await new Promise(resolve => server.close(resolve));
    pool.query = saved;
  }
}

test('readiness confirms the required catalogue schema without calling the bank', async () => {
  const statements = [];
  const result = await probe(async sql => { statements.push(sql); return { rows: [] }; });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true });
  assert.equal(result.health, 200);
  assert.ok(statements.some(sql => /FROM Tests/i.test(sql)));
});

test('database failure makes readiness unavailable while process liveness stays healthy', async () => {
  const result = await probe(async () => { throw new Error('private connection detail'); });
  assert.equal(result.status, 503);
  assert.equal(result.body.ok, false);
  assert.doesNotMatch(JSON.stringify(result.body), /private connection detail/);
  assert.equal(result.health, 200);
});
