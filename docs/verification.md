# Local verification checklist

This document describes checks to perform. It is not a test report and does not assert that any application check passed.

## Before running

- Use a dedicated local PostgreSQL database and synthetic patient records.
- Follow `frontend/README.md` and `backend/README.md` for setup.
- Read current routes and payment configuration; do not assume historical API contracts.
- Never use production banking credentials or real patient data for a demonstration.

## Static and build checks

From `frontend/`:

```bash
npm run lint
npm run build
```

Record the actual command, result, and relevant error output. A build is not proof of successful database or payment integration. Only describe automated tests as passing if a real test command was executed successfully.

## Manual workflow

1. Start the backend and frontend locally.
2. Check navigation and responsive layouts with keyboard input as well as a pointer.
3. Create an order using synthetic patient details and available diagnostic tests.
4. Check invoice line items, totals, and persistence after refresh against the backend.
5. Exercise the explicitly configured demo or sandbox payment path. Verify labeling throughout.
6. Test cancellation, failed verification, network errors, unknown invoice references, and retries. None should silently become a confirmed live payment.
7. Confirm dashboard and technician views reflect persisted state rather than placeholder success.
8. Verify duplicate confirmation or retry does not duplicate provider allocations.
9. Check loading, empty, and error states. Do not describe displayed allocations as completed bank settlement without independent provider evidence.

Record unresolved defects and skipped checks honestly. A local prototype is not production-ready merely because the happy path works.

## Repository checks before a future first commit

- Review `.gitignore`, especially the private hackathon directory, credentials, environment files, dependencies, builds, and reports.
- Use `git check-ignore -v <path>` to confirm private paths are excluded.
- Ensure sanitized `.env.example` templates and package lockfiles are not ignored.
- Review all proposed files for secrets before any staging. Ignore rules alone are not a secret audit.
- For this preparation task, `git diff --cached` must be empty and `git rev-parse --verify HEAD` must report no commit. Do not stage, commit, push, or create a remote as part of preparation.

No hosted deployment is part of this checklist.
