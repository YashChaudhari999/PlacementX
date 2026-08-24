import { prisma } from './analytics.service';

export interface OperationalHealthResponse {
  pendingVerifications: number;
  pendingUpdateRequests: number;
  drivesAwaitingApproval: number;
  activeDrives: number;
  completedDrives: number;
  upcomingEvents: {
    id: string;
    title: string;
    date: string | null;
    driveTitle: string | null;
    companyName: string;
  }[];
  recentDriveActivity: number;
}

export async function getOperationalHealth(): Promise<OperationalHealthResponse> {
  const [
    pendingVerifications,
    pendingUpdateRequests,
    drivesAwaitingApproval,
    activeDrives,
    completedDrives,
    upcomingRounds,
    recentDriveActivity,
  ] = await Promise.all([
    prisma.studentProfile.count({ where: { profileStatus: 'PENDING_VERIFICATION' } }),
    prisma.profileUpdateRequest.count({ where: { status: 'PENDING' } }),
    prisma.placementDrive.count({ where: { status: 'UNDER_REVIEW' } }),
    prisma.placementDrive.count({ where: { status: 'ACTIVE' } }),
    prisma.placementDrive.count({ where: { status: 'COMPLETED' } }),
    prisma.selectionRound.findMany({
      where: {
        date: { gte: new Date() },
      },
      select: {
        id: true,
        title: true,
        date: true,
        drive: {
          select: {
            driveTitle: true,
            company: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'asc' },
      take: 10,
    }),
    prisma.placementDrive.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const upcomingEvents = upcomingRounds.map((r: any) => ({
    id: r.id,
    title: r.title,
    date: r.date?.toISOString() || null,
    driveTitle: r.drive?.driveTitle || null,
    companyName: r.drive?.company?.name || 'Unknown',
  }));

  return {
    pendingVerifications,
    pendingUpdateRequests,
    drivesAwaitingApproval,
    activeDrives,
    completedDrives,
    upcomingEvents,
    recentDriveActivity,
  };
}
