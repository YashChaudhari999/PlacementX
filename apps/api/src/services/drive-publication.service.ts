import type { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../utils/prisma';
import { checkEligibility } from './eligibility.service';
import { createNotification } from './notification.service';
import { emailService } from './email/email.service';

type TransactionClient = Prisma.TransactionClient;
const PAGE_SIZE = 100;
const SUCCESS_STATUSES = new Set(['ACCEPTED', 'DELIVERED', 'CREATED', 'QUEUED', 'SKIPPED']);

const sanitizeError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/[\r\n]+/g, ' ').slice(0, 500);
};

export const buildDriveUrl = (driveId: string): string => {
  const configured = process.env.FRONTEND_URL?.trim();
  const rawBase = configured || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
  const base = rawBase && !rawBase.includes('://') ? `https://${rawBase}` : rawBase;
  if (!base) throw new Error('FRONTEND_URL is required for placement drive links');
  const url = new URL(base);
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('FRONTEND_URL must use HTTPS in production');
  }
  url.pathname = `/drives/${encodeURIComponent(driveId)}`;
  url.search = '';
  url.hash = '';
  return url.toString();
};

export const recordDrivePublication = async (
  tx: TransactionClient | PrismaClient,
  driveId: string,
  triggeredBy?: string
) =>
  tx.drivePublicationEvent.upsert({
    where: { driveId },
    create: { driveId, triggeredBy, status: 'PENDING' },
    update: {},
  });

export const dispatchDrivePublication = async (eventId: string): Promise<void> => {
  const { queueDrivePublication } = await import('./notification-queue.service');
  await queueDrivePublication(eventId);
};

export const redispatchPublishedDriveNotifications = async (): Promise<void> => {
  const events = await prisma.drivePublicationEvent.findMany({
    where: { drive: { status: 'PUBLISHED' } },
    select: { id: true },
  });
  if (!events.length) return;

  const eventIds = events.map(({ id }) => id);
  await prisma.drivePublicationEvent.updateMany({
    where: { id: { in: eventIds } },
    data: {
      status: 'PENDING',
      eligibleCount: 0,
      processedCount: 0,
      startedAt: null,
      completedAt: null,
      lastError: null,
    },
  });
  await Promise.all(eventIds.map(dispatchDrivePublication));
};

const getOrCreateDelivery = async (eventId: string, recipientId: string, channel: string) => {
  return prisma.drivePublicationDelivery.upsert({
    where: { eventId_recipientId_channel: { eventId, recipientId, channel } },
    create: { eventId, recipientId, channel },
    update: {},
  });
};

const setDelivery = async (
  id: string,
  status: string,
  extra: { providerMessageId?: string; lastError?: string; acceptedAt?: Date } = {}
) =>
  prisma.drivePublicationDelivery.update({
    where: { id },
    data: {
      status,
      attemptCount: { increment: 1 },
      lastAttemptAt: new Date(),
      providerMessageId: extra.providerMessageId,
      lastError: extra.lastError,
      acceptedAt: extra.acceptedAt,
    },
  });

const markSkipped = async (
  eventId: string,
  recipientId: string,
  channel: string,
  reason: string
) => {
  const delivery = await getOrCreateDelivery(eventId, recipientId, channel);
  if (!SUCCESS_STATUSES.has(delivery.status)) {
    await setDelivery(delivery.id, 'SKIPPED', { lastError: reason });
  }
};

export const processDrivePublication = async (eventId: string): Promise<void> => {
  const claimed = await prisma.drivePublicationEvent.updateMany({
    where: { id: eventId, status: { in: ['PENDING', 'FAILED'] } },
    data: { status: 'PROCESSING', startedAt: new Date(), lastError: null },
  });
  if (!claimed.count) return;

  let failureCount = 0;
  let eligibleCount = 0;
  let cursor: string | undefined;

  try {
    const event = await prisma.drivePublicationEvent.findUnique({
      where: { id: eventId },
      include: { drive: { include: { company: true } } },
    });
    if (!event) return;
    if (event.drive.status !== 'PUBLISHED') {
      await prisma.drivePublicationEvent.update({
        where: { id: eventId },
        data: { status: 'CANCELLED', completedAt: new Date() },
      });
      return;
    }

    const driveUrl = buildDriveUrl(event.drive.id);
    const driveTitle =
      event.drive.driveTitle ||
      event.drive.jobRole ||
      `${event.drive.company.name} placement drive`;
    const notificationTitle = `New Placement Drive: ${driveTitle}`;
    const notificationMessage = `You are eligible for the ${driveTitle} opportunity at ${event.drive.company.name}. Review the details and application deadline.`;

    do {
      const students = await prisma.studentProfile.findMany({
        take: PAGE_SIZE,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { id: 'asc' },
        include: { user: { include: { notificationPreferences: true } } },
      });
      cursor = students.length === PAGE_SIZE ? students[students.length - 1].id : undefined;

      for (const student of students) {
        const eligibility = await checkEligibility(student, event.drive);
        if (!eligibility.isEligible || eligibility.requiresReview) continue;
        eligibleCount += 1;

        const prefs = student.user.notificationPreferences;
        const placementAllowed = !prefs || prefs.placement;
        const studentName =
          [student.firstName, student.lastName].filter(Boolean).join(' ') || 'Student';

        if (!placementAllowed) {
          await Promise.all([
            markSkipped(eventId, student.userId, 'IN_APP', 'Placement notifications disabled'),
            markSkipped(eventId, student.userId, 'PUSH', 'Placement notifications disabled'),
            markSkipped(eventId, student.userId, 'EMAIL', 'Placement notifications disabled'),
          ]);
          continue;
        }

        const inApp = await getOrCreateDelivery(eventId, student.userId, 'IN_APP');
        let inAppStatus = inApp.status;
        if (!SUCCESS_STATUSES.has(inApp.status)) {
          try {
            const notification = await createNotification({
              title: notificationTitle,
              message: notificationMessage,
              type: 'placement_drive',
              category: 'placement',
              priority: 'HIGH',
              receiverId: student.userId,
              senderId: event.triggeredBy || undefined,
              senderRole: 'SUPER_ADMIN',
              actionUrl: `/student/drives/${event.drive.id}`,
              deepLinkRoute: 'DriveDetails',
              deepLinkParams: { id: event.drive.id },
              metadata: { driveId: event.drive.id, publicationEventId: event.id },
            });
            await setDelivery(inApp.id, notification ? 'CREATED' : 'SKIPPED', {
              lastError: notification ? undefined : 'Notification preference disabled',
            });
            inAppStatus = notification ? 'CREATED' : 'SKIPPED';
          } catch (error) {
            failureCount += 1;
            await setDelivery(inApp.id, 'FAILED', { lastError: sanitizeError(error) });
          }
        }

        const push = await getOrCreateDelivery(eventId, student.userId, 'PUSH');
        if (!SUCCESS_STATUSES.has(push.status)) {
          const pushDisabled = Boolean(prefs && !prefs.pushEnabled);
          const pushStatus =
            pushDisabled || inAppStatus === 'SKIPPED'
              ? 'SKIPPED'
              : inAppStatus === 'CREATED'
                ? 'QUEUED'
                : 'FAILED';
          await setDelivery(push.id, pushStatus, {
            lastError: pushDisabled
              ? 'Push notifications disabled'
              : inAppStatus !== 'CREATED'
                ? 'Push was not queued because the in-app notification was not created'
                : undefined,
            acceptedAt: pushStatus === 'QUEUED' ? new Date() : undefined,
          });
        }

        const email = await getOrCreateDelivery(eventId, student.userId, 'EMAIL');
        if (!SUCCESS_STATUSES.has(email.status)) {
          const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.user.email);
          if (!validEmail || (prefs && !prefs.emailEnabled)) {
            await setDelivery(email.id, 'SKIPPED', {
              lastError: validEmail
                ? 'Email notifications disabled'
                : 'Invalid or missing email address',
            });
          } else {
            const result = await emailService.sendDrivePublicationEmail(student.user.email, {
              studentName,
              driveTitle,
              companyName: event.drive.company.name,
              jobRole: event.drive.jobRole,
              location: event.drive.location,
              employmentType: event.drive.employmentType,
              minimumCgpa: event.drive.minimumCgpa,
              fixedSalary: event.drive.fixedSalary,
              deadline: event.drive.applicationDeadline || event.drive.registrationEnd,
              driveUrl,
            });
            if (result.accepted) {
              await setDelivery(email.id, 'ACCEPTED', {
                providerMessageId: result.providerMessageId,
                acceptedAt: new Date(),
              });
            } else {
              failureCount += 1;
              await setDelivery(email.id, 'FAILED', {
                lastError: sanitizeError(result.error || 'Email provider rejected request'),
              });
            }
          }
        }
      }
    } while (cursor);

    if (failureCount) throw new Error(`${failureCount} publication delivery attempt(s) failed`);
    await prisma.drivePublicationEvent.update({
      where: { id: eventId },
      data: {
        status: 'COMPLETED',
        eligibleCount,
        processedCount: eligibleCount,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.drivePublicationEvent.updateMany({
      where: { id: eventId },
      data: {
        status: 'FAILED',
        eligibleCount,
        processedCount: eligibleCount,
        lastError: sanitizeError(error),
      },
    });
    throw error;
  }
};

export const recoverDrivePublicationEvents = async (): Promise<void> => {
  const staleBefore = new Date(Date.now() - 10 * 60 * 1000);
  await prisma.drivePublicationEvent.updateMany({
    where: { status: 'PROCESSING', updatedAt: { lt: staleBefore } },
    data: { status: 'FAILED', lastError: 'Recovered after interrupted processing' },
  });
  const pending = await prisma.drivePublicationEvent.findMany({
    where: { status: { in: ['PENDING', 'FAILED'] } },
    select: { id: true },
    take: 100,
  });
  await Promise.all(pending.map(({ id }) => dispatchDrivePublication(id)));
};
