const { Pool } = require('pg');
require('dotenv').config({ path: require('node:path').join(__dirname, '..', '.env'), quiet: true });

const connectionString = process.env.DATABASE_URL;
const host = connectionString
  ? new URL(connectionString).hostname
  : process.env.PGHOST || 'localhost';
const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(host);
const sslMode = process.env.PGSSLMODE || (local ? 'disable' : 'verify-full');
// URL TLS options can override pg's SSL object: keep the policy explicit and safe.
let safeConnectionString = connectionString;
if (connectionString) {
  const url = new URL(connectionString);
  for (const key of ['sslmode', 'ssl', 'sslcert', 'sslkey', 'sslrootcert'])
    url.searchParams.delete(key);
  safeConnectionString = url.toString();
}
const poolConfig = {
  ...(safeConnectionString
    ? { connectionString: safeConnectionString }
    : {
        user: process.env.PGUSER || 'postgres',
        host,
        database: process.env.PGDATABASE || 'dxpay',
        password: process.env.PGPASSWORD,
        port: Number(process.env.PGPORT || 5432),
      }),
  ssl: sslMode === 'disable' ? false : { rejectUnauthorized: true },
  connectionTimeoutMillis: 5000,
};

const pool = new Pool(poolConfig);

// Test the connection immediately (Keeping the original logs)
pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
