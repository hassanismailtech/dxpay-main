# DxPay

Diagnostic billing and payment coordination for healthcare teams, prepared for the **Access Bank Youth Forge Hackathon**.

DxPay brings diagnostic orders, patient invoices, payment status, provider revenue views, and technician fulfillment into one workflow. This is a local development prototype, not a production healthcare or banking service. Provider allocations are not evidence of actual bank settlement.

## Repository layout

- `frontend/` — Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Zustand, and Axios.
- `backend/` — Node.js, Express, and PostgreSQL through `pg`.
- `docs/` — local verification and repository handling guidance.

See [frontend setup](frontend/README.md), [backend setup](backend/README.md), and the [verification checklist](docs/verification.md).

## Local development

Use Node.js 22 or later and npm (verified locally with Node.js 24). PostgreSQL is needed for database-backed workflows. Each application has its own package manifest; there is no root npm workspace.

From the repository root:

```bash
cd backend
npm ci
```

Create a private `backend/.env` following the backend guide. Initialize a dedicated local database using `backend/schema.sql` and `backend/seed.sql`, then run `npm run dev` from `backend/`. The default local API address is `http://localhost:5000`.

In a separate terminal, from the repository root:

```bash
cd frontend
npm ci
```

Create `frontend/.env.local`:

```dotenv
BACKEND_URL=http://localhost:5000
```

Run `npm run dev` from `frontend/` and open `http://localhost:3000`. Variables prefixed `NEXT_PUBLIC_` are browser-visible; never place secrets in them.

## Status and safeguards

- Local development only. A fresh deployment is a separate, later task; no hosted demo is advertised here.
- Checkout and payment verification use the configured Forge sandbox. Missing configuration or mismatched confirmation fails closed.
- Use synthetic patient data. Do not enter real patient information, bank credentials, or production payment keys.
- Label demo and sandbox activity explicitly. A checkout callback does not establish confirmed payment or settlement.
- Verification commands in `docs/verification.md` are instructions, not claims that tests or builds passed.

## Repository hygiene

The private hackathon folder, environment files, credentials, dependencies, builds, test reports, and design scratch output are excluded by `.gitignore`. Sanitized `.env.example` templates and dependency lockfiles remain eligible for version control. Exclusion does not remove local files or revoke exposed credentials.

The repository is prepared locally on `main` without staging, commits, or remote publication. Review all files before any future first commit. Existing license and attribution records are preserved.

## Team

- [Hassan Ismail](https://github.com/hassanismailtech) — Product and Frontend Lead
- [Ayomide Ayodele-Soyebo](https://github.com/AyomideA-S) — Backend and Data Engineer
- [Simbiat Jinadu](https://github.com/Simby1) — Frontend and UX/UI Design
- [Olamitunji Akinwale](https://github.com/tunnji) — Product Manager / Operations
