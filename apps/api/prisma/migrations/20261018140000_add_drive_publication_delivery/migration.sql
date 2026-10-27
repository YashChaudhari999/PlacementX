CREATE TABLE "DrivePublicationEvent" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "triggeredBy" TEXT,
    "eligibleCount" INTEGER NOT NULL DEFAULT 0,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DrivePublicationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DrivePublicationDelivery" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "providerMessageId" TEXT,
    "lastError" TEXT,
    "lastAttemptAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DrivePublicationDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DrivePublicationEvent_driveId_key" ON "DrivePublicationEvent"("driveId");
CREATE INDEX "DrivePublicationEvent_status_updatedAt_idx" ON "DrivePublicationEvent"("status", "updatedAt");
CREATE UNIQUE INDEX "DrivePublicationDelivery_eventId_recipientId_channel_key" ON "DrivePublicationDelivery"("eventId", "recipientId", "channel");
CREATE INDEX "DrivePublicationDelivery_eventId_status_idx" ON "DrivePublicationDelivery"("eventId", "status");
CREATE INDEX "DrivePublicationDelivery_recipientId_createdAt_idx" ON "DrivePublicationDelivery"("recipientId", "createdAt");
ALTER TABLE "DrivePublicationEvent" ADD CONSTRAINT "DrivePublicationEvent_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "PlacementDrive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DrivePublicationDelivery" ADD CONSTRAINT "DrivePublicationDelivery_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "DrivePublicationEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DrivePublicationDelivery" ADD CONSTRAINT "DrivePublicationDelivery_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
