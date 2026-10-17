CREATE TABLE "PasswordResetChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "otpExpiresAt" TIMESTAMP(3) NOT NULL,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "resendEligibleAt" TIMESTAMP(3) NOT NULL,
    "resetGrantHash" TEXT,
    "resetGrantExpiresAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PasswordResetChallenge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetChallenge_resetGrantHash_key" ON "PasswordResetChallenge"("resetGrantHash");
CREATE INDEX "PasswordResetChallenge_email_status_createdAt_idx" ON "PasswordResetChallenge"("email", "status", "createdAt");
CREATE INDEX "PasswordResetChallenge_userId_status_idx" ON "PasswordResetChallenge"("userId", "status");
CREATE INDEX "PasswordResetChallenge_otpExpiresAt_idx" ON "PasswordResetChallenge"("otpExpiresAt");
CREATE INDEX "PasswordResetChallenge_resetGrantExpiresAt_idx" ON "PasswordResetChallenge"("resetGrantExpiresAt");
ALTER TABLE "PasswordResetChallenge" ADD CONSTRAINT "PasswordResetChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
