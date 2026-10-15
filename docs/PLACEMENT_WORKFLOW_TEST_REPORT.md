# Placement Workflow Test Report

Execution date: 2026-10-13

## Executed checks

| Command/check | Result | Notes |
|---|---|---|
| `npx prisma format --schema apps/api/prisma/schema.prisma` | PASS | Schema formatted successfully |
| `npx prisma generate --schema apps/api/prisma/schema.prisma` | PASS | Prisma Client 5.22.0 generated |
| API type-check | PASS | `tsc --noEmit` |
| Web type-check | PASS | `tsc --noEmit` |
| API build | PASS | `tsc` |
| Web build | PASS | 8,810 modules transformed; chunk-size warnings only |
| API Jest | PASS | 4 suites, 17 tests, 0 failures |
| Web lint | FAIL | Existing line-ending/Prettier baseline: 30,410 reported problems |

Jest initially could not bind loopback ports inside the restricted sandbox. It was rerun with loopback permission and a workspace-local cache; all tests then passed.

## Covered behaviours

- Valid and invalid placement eligibility.
- Gap, resume, GitHub, backlog-history and semester criteria.
- Missing attendance routes to administrative review.
- Confirmed-offer ambiguity routes to administrative review.
- Timezone-aware Batch 2027 phases and no-campus dates.
- Valid drive transitions, application windows, and terminal-state protection.
- Unauthenticated admin denial, malicious input rejection, security headers, text sanitization, and production error hiding.

## Not run

- Migration apply/rollback against PostgreSQL.
- Firebase account provisioning or activation mail delivery.
- Redis/BullMQ delivery and retry integration.
- Concurrent application requests against a real database.
- CSV import with real Firebase/PostgreSQL fixtures.
- Result upload publication and notification delivery.
- The required 28-step browser/API end-to-end scenario and independent admin-created-drive browser path.

These checks require a disposable PostgreSQL database, isolated Firebase project/emulators, Redis, mail sink, seeded role accounts, and browser automation configuration. No production records or external recipients were used.

## Recommended E2E fixture plan

1. Apply migrations to an ephemeral PostgreSQL database.
2. Start Firebase Auth/RTDB emulators and Redis; route mail to a local sink.
3. Seed one super admin, coordinator, HR invitation, eligible student, and ineligible student.
4. Execute the complete scenario through API tests, then repeat critical paths through Playwright.
5. Assert audit rows, notification idempotency, invitation revocation, published-result visibility, offer chronology, and cross-role denial after every state change.
