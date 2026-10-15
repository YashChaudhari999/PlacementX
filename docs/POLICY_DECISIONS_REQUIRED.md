# Policy Decisions Required

## Source limitation

`Final Placement Policy - Batch 2027.pdf` was not available in the repository on 2026-10-13. The implementation uses the extracted requirements in the task prompt and identifies them as `BATCH_2027_EXTRACTED_V1`; it must not be presented as an approved transcription of the original PDF.

## PDR-001: eligibility after a confirmed offer

- Source references identified by the supplied requirements: Section 2.8 job-category table and Section 2.8.1.
- Conflict: the two provisions appear to produce different future-drive eligibility outcomes after an offer.
- Current safe behaviour: a student with a confirmed offer receives reason code `OFFER_POLICY_AMBIGUOUS`; the evaluation sets `requiresReview=true` and does not silently authorize or irreversibly restrict the student.
- Required decision owner: authorized Placement Cell administrator.
- Required amendment: approve a versioned rule defining outcomes by offer category, placement phase, chronology, competing offers, exceptions, and effective date.
- Evidence required: signed policy amendment or authoritative written interpretation referencing the original clauses.

## PDR-002: ten-company-choice skip exceptions

The extracted requirement gives the limit but not a complete machine-readable definition of a “choice,” “skip,” or every exception. Confirm counting events, reset period, excused skips, and review authority before enforcement.

## PDR-003: offer categories

Confirm the canonical definitions and thresholds for Niche/Core, IT Services, International, and Dream Offer, including whether thresholds vary by program or phase.

## PDR-004: attendance effects

Confirm whether attendance below 75% is an automatic restriction or reviewable, the authoritative attendance source, acceptable evidence, and phase-specific absence rules. Missing attendance currently routes to review and is not treated as a verified violation.

## Implemented extracted configuration

- Phase 1: 20 July 2026 through 31 December 2026, Asia/Kolkata.
- Phase 2: 4 January 2027 through 15 May 2027, Asia/Kolkata.
- No-campus-process dates: 9–11 November 2026 and 25 December 2026.
- Minimum pre-placement training attendance: 75%.
- Offer eligibility interpretation: explicitly unresolved.

The runtime constants are in `apps/api/src/domain/batch2027.policy.ts`; the schema supports approved, effective-dated `PlacementPolicyVersion` records and audited eligibility snapshots.
