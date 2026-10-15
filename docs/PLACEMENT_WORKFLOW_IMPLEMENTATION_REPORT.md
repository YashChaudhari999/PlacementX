# Placement Workflow Implementation Report

Date: 2026-10-13

## Outcome

This change completes a P0/P1 hardening slice; it does not claim the entire master workflow is complete. Existing Firebase/JWT authentication, profiles, drives, HR workspace, applications, notifications, reports, and analytics were preserved. Missing nomination, shortlist-revision, final offer-event, and full publication workflows remain documented as incomplete.

## Changes made

- Added structured, centralized eligibility results with stable reason codes, explanations, policy version, timestamp, and administrative-review state in `apps/api/src/services/eligibility.service.ts`.
- Reused the same evaluator for notification candidate selection and application authorization; application submission now records the verified-profile timestamp and eligibility snapshot.
- Added extracted Batch 2027 phase dates, blackout dates, attendance threshold, skip-limit metadata, and a deliberately unresolved offer decision in `apps/api/src/domain/batch2027.policy.ts`.
- Expanded guarded drive lifecycle transitions and prevented terminal drives from reopening.
- Converted the delete endpoint to audited cancellation so applications/results remain intact, and revoked HR links at cancellation/completion.
- Kept HR secrets hash-only, added revocation/submission timestamps, restored correction resubmission, and checked revoked links for public and workspace operations.
- Added publication completeness checks for required job details and future deadlines.
- Hardened student import with authenticated client use, 1,000-row server cap, normalized email, duplicate email/student-ID detection, optional official-domain enforcement, privileged-account protection, generated bootstrap secrets, and removal of password fields/reports.
- Required a specific reason when requesting profile corrections.

## Database migration

`apps/api/prisma/migrations/20261013000000_placement_workflow_policy/migration.sql` adds:

- unique student IDs and enrolment/policy/attendance/restriction fields;
- activation-token storage using token hashes;
- versioned placement-policy records;
- durable eligibility evaluations;
- attendance exception reviews;
- profile and eligibility snapshots on applications;
- explicit round/result publication fields;
- offer lifecycle fields;
- HR invitation revocation/submission metadata.

The migration is additive and was not applied to an external database in this environment. Deploy with `npm run db:migrate:deploy --workspace=@placementx/api` after backup and staging validation.

## API and frontend effects

- Existing endpoint paths are retained.
- `POST /api/student/applications` now persists the server-generated eligibility snapshot.
- `DELETE /api/admin/drives/:id` now cancels and preserves history instead of physically deleting.
- Drive status updates audit transitions and revoke links on terminal states.
- HR draft/submit/workspace operations reject revoked tokens; correction requests re-enable the scoped invitation.
- Admin student import now uses the shared authenticated Axios client.
- The CSV template and parser no longer accept a password column.

## Security improvements

- No imported permanent/plain-text password is accepted, defaulted from a phone number, or included in a report.
- Duplicate IDs/emails and non-student account conflicts are rejected before provisioning.
- Optional `OFFICIAL_STUDENT_EMAIL_DOMAINS` restricts imports to configured college domains.
- HR links remain stored as SHA-256 hashes and now have explicit revocation handling.
- Destructive drive deletion is replaced by an auditable, recoverable lifecycle operation.

## Configuration

Set `OFFICIAL_STUDENT_EMAIL_DOMAINS` to a comma-separated allowlist such as `nmims.edu,nmims.in`. Production activation email still requires an official mail provider; none is configured in the current repository.

## Verification summary

| Check | Result |
|---|---|
| API TypeScript type-check | PASS |
| Web TypeScript type-check | PASS |
| API production build | PASS |
| Web production build | PASS (existing chunk-size warnings) |
| API Jest suite | PASS, 17/17 |
| Web lint | FAIL: pre-existing repository-wide CRLF/Prettier debt (~30,000 errors) |
| Prisma schema format/client generation | PASS |
| Migration deployment | NOT RUN: no approved disposable database |
| Full 28-step API/browser E2E | NOT RUN: no isolated PostgreSQL/Firebase/mail test environment |

## Remaining blockers and known issues

- The original policy PDF must be inspected and approved rules seeded before policy completion.
- Official activation email cannot be sent until a provider and templates are configured.
- Student import still accepts parsed JSON from the web client; server-side multipart CSV preview/confirm batches remain to be built.
- Nomination modes, shortlist publication revisions, result approval/publication separation, and offer-event chronology are not complete.
- The web lint baseline must be normalized separately to make lint an actionable CI gate.

## Run commands

```powershell
npm install
npm run db:migrate:deploy --workspace=@placementx/api
npm run type-check
npm test --workspace=@placementx/api -- --runInBand
npm run build
npm run dev
```
