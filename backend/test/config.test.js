const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

function probe(script, env = {}) {
  const result = spawnSync(process.execPath, ['-e', script], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
    timeout: 10000,
    env: { ...process.env, ...env },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout.trim().split('\n').at(-1));
}

test('remote database TLS verifies certificates and does not force TLS for local URLs', () => {
  const script = `const pg = require('pg'); let config;
    pg.Pool = class { constructor(value) { config = value; } on() {} };
    require('./config/db'); console.log(JSON.stringify(config));`;
  const remote = probe(script, {
    DATABASE_URL: 'postgres://synthetic:synthetic@db.example.test/dxpay',
    PGSSLMODE: 'require',
  });
  assert.equal(remote.ssl.rejectUnauthorized, true);
  const local = probe(script, {
    DATABASE_URL: 'postgres://synthetic:synthetic@localhost/dxpay',
    PGSSLMODE: 'disable',
  });
  assert.equal(local.ssl, false);
});

test('server exports a non-listening app and never fabricates success for unsupported writes', () => {
  const result = probe(`
    const app = require('./server');
    if (typeof app.listen !== 'function') { console.error('Server must export its app'); process.exit(1); }
    const server = app.listen(0, '127.0.0.1', async () => {
      const base = 'http://127.0.0.1:' + server.address().port;
      const health = await fetch(base + '/healthz');
      const unsupported = await fetch(base + '/api/tests', {method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
      const verify = await fetch(base + '/api/payment/verify');
      console.log(JSON.stringify({health: health.status, unsupported: unsupported.status, verify: verify.status}));
      server.close(() => process.exit(0));
    });`);
  assert.equal(result.health, 200);
  assert.equal(result.unsupported, 404);
  assert.equal(result.verify, 400);
});
