ALTER TABLE "StudentProfile"
  ADD COLUMN "studentId" TEXT,
  ADD COLUMN "enrollmentStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "trainingAttendance" DOUBLE PRECISION,
  ADD COLUMN "policyAcknowledgedAt" TIMESTAMP(3),
  ADD COLUMN "academicRestriction" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "disciplinaryRestriction" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "StudentProfile_studentId_key" ON "StudentProfile"("studentId");

ALTER TABLE "SelectionRound"
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  ADD COLUMN "mode" TEXT,
  ADD COLUMN "resultStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "publishedAt" TIMESTAMP(3);

ALTER TABLE "DriveApplication"
  ADD COLUMN "verifiedProfileAt" TIMESTAMP(3),
  ADD COLUMN "eligibilitySnapshot" JSONB;

ALTER TABLE "OfferLetter"
  ADD COLUMN "selectionStatus" TEXT NOT NULL DEFAULT 'AWAITING_CONFIRMATION',
  ADD COLUMN "offerStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "acceptedAt" TIMESTAMP(3),
  ADD COLUMN "declinedAt" TIMESTAMP(3),
  ADD COLUMN "joiningDate" TIMESTAMP(3),
  ADD COLUMN "confirmedAt" TIMESTAMP(3),
  ADD COLUMN "packageDetails" JSONB;

ALTER TABLE "ApplicationRoundResult"
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "approvedBy" TEXT,
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "publishedAt" TIMESTAMP(3);

ALTER TABLE "HrInvitationLink"
  ADD COLUMN "revokedAt" TIMESTAMP(3),
  ADD COLUMN "submittedAt" TIMESTAMP(3),
  ADD COLUMN "lastUsedAt" TIMESTAMP(3),
  ADD COLUMN "permissions" JSONB;

CREATE TABLE "AccountActivationToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountActivationToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AccountActivationToken_tokenHash_key" ON "AccountActivationToken"("tokenHash");
CREATE INDEX "AccountActivationToken_userId_expiresAt_idx" ON "AccountActivationToken"("userId", "expiresAt");

CREATE TABLE "PlacementPolicyVersion" (
  "id" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "rules" JSONB NOT NULL,
  "sourceReference" TEXT,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlacementPolicyVersion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlacementPolicyVersion_version_key" ON "PlacementPolicyVersion"("version");
CREATE INDEX "PlacementPolicyVersion_status_effectiveFrom_idx" ON "PlacementPolicyVersion"("status", "effectiveFrom");

INSERT INTO "PlacementPolicyVersion" (
  "id", "version", "name", "status", "timezone", "effectiveFrom", "effectiveTo", "rules", "sourceReference", "updatedAt"
) VALUES (
  'batch-2027-extracted-v1',
  'BATCH_2027_EXTRACTED_V1',
  'Batch 2027 extracted requirements',
  'DRAFT',
  'Asia/Kolkata',
  '2026-07-20T00:00:00+05:30',
  '2027-05-15T23:59:59+05:30',
  '{"minimumTrainingAttendance":75,"companyChoiceSkipLimit":10,"offerEligibilityDecision":"REQUIRES_AUTHORIZED_REVIEW","phases":[{"code":"PHASE_1","startsAt":"2026-07-20T00:00:00+05:30","endsAt":"2026-12-31T23:59:59+05:30"},{"code":"PHASE_2","startsAt":"2027-01-04T00:00:00+05:30","endsAt":"2027-05-15T23:59:59+05:30"}],"noCampusProcessDates":["2026-11-09","2026-11-10","2026-11-11","2026-12-25"]}'::jsonb,
  'Extracted requirements supplied with implementation task; original PDF not available',
  CURRENT_TIMESTAMP
);

CREATE TABLE "EligibilityEvaluation" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "driveId" TEXT NOT NULL,
  "policyVersionId" TEXT,
  "eligible" BOOLEAN NOT NULL,
  "reasonCodes" JSONB NOT NULL,
  "explanations" JSONB NOT NULL,
  "requiresReview" BOOLEAN NOT NULL DEFAULT false,
  "inputSnapshot" JSONB,
  "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EligibilityEvaluation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EligibilityEvaluation_studentId_driveId_evaluatedAt_idx" ON "EligibilityEvaluation"("studentId", "driveId", "evaluatedAt");
CREATE INDEX "EligibilityEvaluation_driveId_eligible_idx" ON "EligibilityEvaluation"("driveId", "eligible");

CREATE TABLE "AttendanceExceptionReview" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "attendanceEvent" TEXT NOT NULL,
  "absenceReason" TEXT,
  "supportingDocumentRef" TEXT,
  "phase" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "eligibilityEffect" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AttendanceExceptionReview_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AttendanceExceptionReview_studentId_status_idx" ON "AttendanceExceptionReview"("studentId", "status");

ALTER TABLE "AccountActivationToken" ADD CONSTRAINT "AccountActivationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EligibilityEvaluation" ADD CONSTRAINT "EligibilityEvaluation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EligibilityEvaluation" ADD CONSTRAINT "EligibilityEvaluation_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "PlacementDrive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EligibilityEvaluation" ADD CONSTRAINT "EligibilityEvaluation_policyVersionId_fkey" FOREIGN KEY ("policyVersionId") REFERENCES "PlacementPolicyVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AttendanceExceptionReview" ADD CONSTRAINT "AttendanceExceptionReview_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
