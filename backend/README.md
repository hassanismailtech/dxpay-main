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

No hosted service or production deployment is configured automatically; the repository is deliberately deployment-agnostic. Container and Kubernetes manifests for the Access Bank Youth Forge Hackathon production environment are provided under `deploy/`.

## Recommended production layout

Host the Next.js frontend and Express API as two separate services behind a reverse proxy. Run PostgreSQL in a managed provider or as a sidecar container in the same cluster.

Container prerequisites:

- `backend/Dockerfile`: multi-stage build for the Node 24 slim image; produces a standalone Next.js server and a bundled Express API in one image.
- `deploy/`: `app.yaml` (cluster deployment manifest), `registry.yaml` (image manifest references), `readiness.yaml`, and `run-local.ps1` (local bootstrap).

Environment variables required at runtime:

- `PORT` (server)
- `FRONTEND_URL` (browser origin for redirects)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGSSLMODE`
- `DATABASE_URL` (takes precedence over individual PG variables)
- `BANK_API_URL` (reachable Forge sandbox gateway URL)
- `FORGE_MERCHANT_ID` (sandbox merchant id)
- `GATEWAY_KEY` (sandbox gateway key)

If PostgreSQL is remote, set `PGSSLMODE` to `require` and keep certificate validation enabled. The server binds to `127.0.0.1` for local development and to `0.0.0.0` for cluster deployment.
