import { AnalyticsFilterInput } from '../../schemas/analytics.schema';
import { prisma, buildImportedStudentWhere } from './analytics.service';

export interface CompanyStats {
  companyName: string;
  offers: number;
  averagePackage: number;
  highestPackage: number;
  departments: string[];
}

export interface RecruiterRetention {
  returning: string[];
  new: string[];
  lost: string[];
  returningCount: number;
  newCount: number;
  lostCount: number;
  retentionRate: number | null;
}

export interface CompanyResponse {
  topCompanies: CompanyStats[];
  totalCompanies: number;
  previousCompanies: number;
  retention: RecruiterRetention | null;
}

export async function getCompanies(filters: AnalyticsFilterInput): Promise<CompanyResponse> {
  const currentWhere = buildImportedStudentWhere(filters);
  const limit = filters.limit || 20;

  // Top companies by offers
  const companies = await prisma.importedStudent.groupBy({
    by: ['companyName'],
    where: { ...currentWhere, placementStatus: 'Placed', companyName: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { companyName: 'desc' } },
    take: limit,
  });

  const topCompanies: CompanyStats[] = await Promise.all(
    companies.map(async (c: any) => {
      const [stats, depts] = await Promise.all([
        prisma.importedStudent.aggregate({
          where: { ...currentWhere, companyName: c.companyName, placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
          _avg: { fixedSalaryLpa: true },
          _max: { fixedSalaryLpa: true },
        }),
        prisma.importedStudent.groupBy({
          by: ['department'],
          where: { ...currentWhere, companyName: c.companyName, placementStatus: 'Placed' },
        }),
      ]);

      return {
        companyName: c.companyName!,
        offers: c._count._all,
        averagePackage: stats._avg.fixedSalaryLpa ? parseFloat(stats._avg.fixedSalaryLpa.toFixed(2)) : 0,
        highestPackage: stats._max.fixedSalaryLpa || 0,
        departments: depts.map((d: any) => d.department),
      };
    })
  );

  // Total companies count
  const allCompanies = await prisma.importedStudent.groupBy({
    by: ['companyName'],
    where: { ...currentWhere, placementStatus: 'Placed', companyName: { not: null } },
  });
  const totalCompanies = allCompanies.length;

  // Recruiter retention analysis
  let retention: RecruiterRetention | null = null;
  let previousCompanies = 0;

  if (filters.compareWith) {
    const prevWhere = buildImportedStudentWhere(filters, filters.compareWith);
    const prevCompanyGroups = await prisma.importedStudent.groupBy({
      by: ['companyName'],
      where: { ...prevWhere, placementStatus: 'Placed', companyName: { not: null } },
    });
    previousCompanies = prevCompanyGroups.length;

    const currentNames = new Set(allCompanies.map(c => c.companyName as string));
    const prevNames = new Set(prevCompanyGroups.map(c => c.companyName as string));

    const returning = [...currentNames].filter(n => prevNames.has(n));
    const newCompanies = [...currentNames].filter(n => !prevNames.has(n));
    const lost = [...prevNames].filter(n => !currentNames.has(n));

    retention = {
      returning,
      new: newCompanies,
      lost,
      returningCount: returning.length,
      newCount: newCompanies.length,
      lostCount: lost.length,
      retentionRate: prevNames.size > 0
        ? parseFloat(((returning.length / prevNames.size) * 100).toFixed(1))
        : null,
    };
  }

  return {
    topCompanies,
    totalCompanies,
    previousCompanies,
    retention,
  };
}
