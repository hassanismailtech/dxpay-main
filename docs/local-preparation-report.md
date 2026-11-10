# Local preparation verification

## Verified

- Production frontend build: Next.js 16.4.6, React 19.2.9. The generated route table contains `/`, `/dashboard`, `/terminal`, `/tech`, and the two intended dynamic patient-payment routes; no accidental legacy composition routes.
- Frontend strict ESLint (zero warnings), TypeScript compilation, and Prettier checks passed.
- Backend Node suite: 19 tests passed. Covers safe database failure, input validation, integer-kobo order totals, PostgreSQL NUMERIC catalogue serialization, checkout retries, payment response validation, allocation replay, rollback, reversal, and delayed-success/reversal races.
- Frontend payment Node suite: 5 tests passed.
- Playwright suite: 14 tests passed using Microsoft Edge and explicit synthetic API fixtures. Covers landing navigation, interactive NGN totals, provider ledger, failure/retry, catalogue selection, invoice reload, untrusted checkout destinations, and desktop/tablet/phone widths.
- Production-page visual inspection at 1440px, 768px, and 390px: no failing measurements on landing or dashboard. Final screenshots were reviewed. The dashboard was inspected with its honest unavailable-backend state, not fabricated financial data.
- Public repository candidates contained no matches for legacy event branding, former hosted application URLs, or credential signatures in the performed scan. This is a bounded scan, not a guarantee of secret absence.
- Private hackathon correspondence/configuration, local environment files, dependencies, generated builds, and test reports are ignored. Sanitized environment examples and lockfiles are not ignored.
- Git is initialized on `main`, with no HEAD commit, no staged files, and no remote.

## Dependency findings

The pinned vulnerable Next.js release was upgraded within version 16; matching lint configuration and React patch versions were updated. The unused shadcn generator was removed from runtime dependencies; checked-in UI components remain.

The npm advisory bulk endpoint was checked against both lockfiles after installation. No advisories were returned for production dependencies. One moderate `minimatch` advisory remains in development tooling in each application. A cross-major transitive override was not forced solely to silence a tooling advisory. Ordinary `npm audit` timed out locally; the registry bulk API was the successful fallback used for this check.

## Deliberate visual decisions

The landing uses product UI rather than stock imagery or footage and avoids decorative motion. The inspector's picture/motion quotas were explicitly waived for this scope. Muted supporting copy still exceeds normal-text AA contrast. Its margin warning is based on visible glyph bounds rather than unequal container padding. A dashboard chart-hue warning is inapplicable: the screen contains no transaction chart or fabricated series.

## Not verified or implemented

- No live PostgreSQL-to-Forge end-to-end transaction was executed. Local database configuration, an authorised sandbox key, and explicit connectivity to the cluster-internal bank API are prerequisites.
- Backend regression tests isolate database/network boundaries. Browser tests stub APIs with clearly synthetic fixtures. These do not prove live settlement, payment-provider availability, or deployment readiness.
- Authentication, production access control, fulfillment persistence, and bank settlement are outside this cleanup. The fulfillment screen states its missing integration. Do not use real patient data or production funds.
- No staging, commit, push, remote creation, or hosted deployment was performed.

## Reproduce

From `backend/`, run `npm test`. From `frontend/`, run `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run test:payment`, `npm run test:e2e`, and `npm run build`. Edge is the default browser; see the frontend README for a Chromium alternative.
