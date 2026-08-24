import { AnalyticsFilterInput } from '../../schemas/analytics.schema';
import { prisma, buildDriveWhere } from './analytics.service';

export interface DriveAnalyticsRow {
  id: string;
  driveTitle: string | null;
  companyName: string;
  jobRole: string | null;
  status: string;
  totalApplications: number;
  applied: number;
  shortlisted: number;
  interviewed: number;
  offered: number;
  rejected: number;
  offerConversion: number;
  packageLpa: number | null;
}

export interface DriveAnalyticsResponse {
  drives: DriveAnalyticsRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  summary: {
    totalDrives: number;
    activeDrives: number;
    completedDrives: number;
    totalApplications: number;
    totalOffers: number;
    avgApplicationsPerDrive: number;
  };
}

export async function getDriveAnalytics(filters: AnalyticsFilterInput): Promise<DriveAnalyticsResponse> {
  const where = buildDriveWhere(filters);
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;

  const totalCount = await prisma.placementDrive.count({ where });

  const drives = await prisma.placementDrive.findMany({
    where,
    select: {
      id: true,
      driveTitle: true,
      jobRole: true,
      status: true,
      fixedSalary: true,
      company: { select: { name: true } },
      _count: { select: { applications: true } },
      applications: {
        select: { status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const driveRows: DriveAnalyticsRow[] = drives.map((d: any) => {
    const applied = d.applications.filter((a: any) => a.status === 'APPLIED').length;
    const shortlisted = d.applications.filter((a: any) => a.status === 'SHORTLISTED').length;
    const interviewed = d.applications.filter((a: any) => a.status === 'INTERVIEWED').length;
    const offered = d.applications.filter((a: any) => a.status === 'OFFERED').length;
    const rejected = d.applications.filter((a: any) => a.status === 'REJECTED').length;
    const total = d._count.applications;

    return {
      id: d.id,
      driveTitle: d.driveTitle,
      companyName: d.company.name,
      jobRole: d.jobRole,
      status: d.status,
      totalApplications: total,
      applied,
      shortlisted,
      interviewed,
      offered,
      rejected,
      offerConversion: total > 0 ? parseFloat(((offered / total) * 100).toFixed(1)) : 0,
      packageLpa: d.fixedSalary ? parseFloat((d.fixedSalary / 100000).toFixed(2)) : null,
    };
  });

  // Summary stats
  const [activeDrives, completedDrives, allApps, allOffers] = await Promise.all([
    prisma.placementDrive.count({ where: { ...where, status: 'ACTIVE' } }),
    prisma.placementDrive.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.driveApplication.count({ where: { drive: where } }),
    prisma.driveApplication.count({ where: { drive: where, status: 'OFFERED' } }),
  ]);

  return {
    drives: driveRows,
    totalCount,
    page,
    pageSize,
    summary: {
      totalDrives: totalCount,
      activeDrives,
      completedDrives,
      totalApplications: allApps,
      totalOffers: allOffers,
      avgApplicationsPerDrive: totalCount > 0 ? parseFloat((allApps / totalCount).toFixed(1)) : 0,
    },
  };
}
