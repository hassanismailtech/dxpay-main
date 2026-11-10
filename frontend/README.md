# DxPay frontend

Browser application for the Access Bank Youth Forge Hackathon prototype. This application lives directly in `frontend/`.

## Stack and structure

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui components, Zustand, and Axios. Source lives under `src/`; the `@/` alias maps to that directory. See [AGENTS.md](AGENTS.md) for contributor conventions.

## Run locally

Use Node.js 22 or later and npm (verified locally with Node.js 24). From this directory:

```bash
npm ci
```

Create an ignored `.env.local`:

```dotenv
BACKEND_URL=http://localhost:5000
```

Start the backend separately using [its guide](../backend/README.md), then run:

```bash
npm run dev
```

Open `http://localhost:3000`. Restart the development server after environment changes. Public environment values are browser-visible and must not contain secrets.

## Verification commands

```bash
npm run lint
npm run typecheck
npm run format:check
npm run test:payment
npm run test:e2e
npm run build
npm start
```

`npm start` serves a previously built application. These are instructions, not a record of successful execution. Follow the [manual verification checklist](../docs/verification.md) for workflow checks.

## Scope

Diagnostic ordering, reloadable invoices, hosted sandbox checkout, payment verification, and provider allocation views. The technician screen preserves its route but explicitly reports its unavailable backend integration; it does not fabricate paid orders. Authentication and bank settlement are not implemented. Demo and sandbox states remain distinct from live transactions.

Use synthetic patient data and preserve attribution and license records.

## Connect to a hosted backend

The recommended hosted layout is Vercel for this Next.js app and Render for the
Express API. Add this Vercel environment variable for **Production**:

```dotenv
BACKEND_URL=https://your-api.onrender.com
```

The existing Next.js rewrite sends browser requests from `/api/*` to that backend, so
the browser can keep using relative API paths and does not need a public API variable.
Redeploy after changing `BACKEND_URL`. Set `NEXT_PUBLIC_API_BASE_URL` only if you
intentionally want the browser to call the Render URL directly; in that case, set the
backend's `FRONTEND_URL` to the exact Vercel origin so CORS allows it.

The browser tests use Microsoft Edge by default; install Edge or set `PLAYWRIGHT_CHANNEL=chromium` and run `npx playwright install chromium`. Browser tests use isolated, explicitly synthetic API fixtures and do not charge a bank account. Test runner starts its own server on port 3100.

The composition layer is `src/views/` (FSD pages), not `src/pages/`, to avoid accidental legacy Next.js routes. Shadcn UI components are checked-in source; its generator CLI is not a runtime dependency.
