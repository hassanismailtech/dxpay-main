# DxPay backend

Express and PostgreSQL service for the Access Bank Youth Forge Hackathon prototype. Run commands from `backend/` unless stated otherwise.

## Prerequisites

- Node.js 22 or later and npm for a consistent toolchain with the frontend.
- PostgreSQL and the `psql` client for database-backed development.
- A dedicated local database. Do not run demo initialization scripts against production.

## Install and configure

```bash
npm ci
```

Create a private `.env` in this directory:

```dotenv
PORT=5000
PGUSER=your_local_user
PGPASSWORD=your_local_password
PGHOST=localhost
PGPORT=5432
PGDATABASE=dxpay
```

The database configuration also accepts `DATABASE_URL`, which takes precedence over individual connection variables. Review `config/db.js` for current connection and TLS behavior before using it. Keep credentials out of source, logs, and frontend public environment variables.

Copy the secret-free `.env.example` to `.env`, then supply your authorised Forge sandbox gateway key privately. `BANK_API_URL`, `FORGE_MERCHANT_ID`, and `FRONTEND_URL` configure hosted checkout and its callback. The default bank API address is cluster-internal: local connectivity must be explicitly provided before a real sandbox journey can run. No bank key is exposed to the browser. Missing configuration fails closed.

## Initialize a local database

Create an empty development database named `dxpay` using your local PostgreSQL user. From `backend/`:

```bash
psql -h localhost -U your_local_user -d dxpay -f schema.sql
psql -h localhost -U your_local_user -d dxpay -f seed.sql
```

Review the SQL before running it. Repeatability and migration safety are not asserted here.

## Start

```bash
npm run dev
```

For a non-watching process, use `npm start`. The default local API address is `http://localhost:5000`. Run the frontend separately from `../frontend/`.

## API and verification

Routes live in `routes/` and are mounted in `server.js`.

- `GET /healthz`: process health; not proof of database or bank availability.
- `GET /api/tests`: database-backed test catalogue.
- `POST /api/orders`: diagnostic order with one instance of each selected test.
- `POST /api/invoices`: idempotent hosted checkout preparation for an order.
- `GET /api/invoices/:reference`: reload a persisted invoice.
- `GET /api/payment/verify?transaction_reference=...`: server-side status verification and local provider allocations.
- `GET /api/dashboard?provider_id=1`: provider allocation ledger.

Run `npm test` for isolated Node regression tests. They use explicit database/network test doubles rather than claiming a live banking integration. Verification validates response envelope, reference, NGN currency, and amount before allocating; transaction locking prevents duplicate allocations on replay. Reversal removes local allocations, not a bank transfer. There is no fallback payment success.

Follow [the verification checklist](../docs/verification.md). Process startup alone does not verify database queries, payment safety, fulfillment, or the end-to-end workflow. Use synthetic patient data only.

No hosted service or production deployment is configured automatically; the layout below
describes the recommended manual setup. Preserve existing license and authorship records.

## Recommended hosted layout

For a prototype, host the frontend on Vercel and this API as a Render Web Service. Use
Render Postgres (or another managed PostgreSQL provider in the same region) for the
database. This keeps the long-running Express process and PostgreSQL connection pool
on a conventional server instead of adapting the payment routes to serverless
functions.

Create the Render Web Service with:

- **Root directory:** `backend`
- **Build command:** `npm ci`
- **Start command:** `npm start`
- **Health check path:** `/healthz`

Set these Render environment variables:

```dotenv
FRONTEND_URL=https://your-project.vercel.app
DATABASE_URL=<Render Postgres internal connection URL>
PGSSLMODE=require
BANK_API_URL=<reachable Forge sandbox gateway URL>
FORGE_MERCHANT_ID=<sandbox merchant id>
GATEWAY_KEY=<sandbox gateway key>
```

Render supplies `PORT` automatically. Do not copy `GATEWAY_KEY` or `DATABASE_URL` to
Vercel or to any `NEXT_PUBLIC_*` variable. The server binds to `0.0.0.0` so Render's
health check and proxy can reach it.

The Forge default bank URL is cluster-internal and will not be reachable from Render
unless the Forge team provides a public or private-network route. Confirm that
connectivity before deploying a real sandbox payment journey; otherwise deploy the API
inside the permitted Forge environment or use the documented test doubles.
