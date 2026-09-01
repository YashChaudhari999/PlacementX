import prisma from '../../utils/prisma';


export const getReportKPIs = async () => {
  const reportsGenerated = await prisma.reportExportHistory.count();
  const exportsThisMonth = await prisma.reportExportHistory.count({
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });
  const scheduledReports = await prisma.scheduledReport.count({
    where: { status: 'ACTIVE' },
  });
  
  const studentsReported = await prisma.importedStudent.count();
  const placementDrives = await prisma.placementDrive.count();
  
  const lastExport = await prisma.reportExportHistory.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  return {
    reportsGenerated,
    exportsThisMonth,
    scheduledReports,
    studentsReported,
    placementDrives,
    lastExport: lastExport?.createdAt || null,
  };
};

export const getReportData = async (
  reportType: string,
  filters: any = {},
  page: number = 1,
  pageSize: number = 50,
  isPreview: boolean = false
) => {
  const skip = (page - 1) * pageSize;
  const take = isPreview ? pageSize : undefined;

  switch (reportType) {
    case 'OVERALL_PLACEMENT':
    case 'STUDENT_MASTER':
      return getStudentMasterReport(filters, skip, take);
    case 'UNPLACED_STUDENTS':
      return getUnplacedStudentsReport(filters, skip, take);
    case 'DEPARTMENT_PERFORMANCE':
      return getDepartmentPerformanceReport(filters, skip, take);
    case 'COMPANY_HIRING':
      return getCompanyHiringReport(filters, skip, take);
    default:
      return getBasicStudentReport(filters, skip, take);
  }
};

const getBasicStudentReport = async (filters: any, skip?: number, take?: number) => {
  const where: any = buildStudentWhere(filters);
  const data = await prisma.importedStudent.findMany({
    where,
    skip,
    take,
    orderBy: { department: 'asc' },
  });
  const count = await prisma.importedStudent.count({ where });
  return { data, count, summary: { totalRecords: count } };
};

const getStudentMasterReport = async (filters: any, skip?: number, take?: number) => {
  const where: any = buildStudentWhere(filters);
  const data = await prisma.importedStudent.findMany({
    where,
    skip,
    take,
    select: {
      studentId: true,
      fullName: true,
      department: true,
      academicYear: true,
      placementStatus: true,
      companyName: true,
      fixedSalaryLpa: true,
      cgpa: true,
    },
    orderBy: { department: 'asc' },
  });
  const count = await prisma.importedStudent.count({ where });
  
  const placed = await prisma.importedStudent.count({ where: { ...where, placementStatus: 'Placed' } });
  
  const summary = {
    totalRecords: count,
    placedCount: placed,
    placementRate: count > 0 ? ((placed / count) * 100).toFixed(2) + '%' : '0%',
  };
  
  return { data, count, summary };
};

const getUnplacedStudentsReport = async (filters: any, skip?: number, take?: number) => {
  const where: any = { 
    ...buildStudentWhere(filters), 
    OR: [
      { placementStatus: { in: ['Unplaced', 'Pending', ''] } },
      { placementStatus: null }
    ]
  };
  const data = await prisma.importedStudent.findMany({
    where,
    skip,
    take,
    select: {
      studentId: true,
      fullName: true,
      department: true,
      academicYear: true,
      cgpa: true,
      activeBacklogs: true,
      applicationStatus: true,
    },
    orderBy: { cgpa: 'desc' },
  });
  const count = await prisma.importedStudent.count({ where });
  
  return { data, count, summary: { totalRecords: count, unplacedCount: count } };
};

const getDepartmentPerformanceReport = async (filters: any, skip?: number, take?: number) => {
  const where: any = buildStudentWhere(filters);
  const students = await prisma.importedStudent.findMany({ where });
  
  const deptMap: Record<string, any> = {};
  students.forEach(s => {
    const dept = s.department || 'Unknown';
    if (!deptMap[dept]) {
      deptMap[dept] = { department: dept, eligible: 0, participating: 0, placed: 0, maxSalary: 0, sumSalary: 0, placedWithSalary: 0 };
    }
    deptMap[dept].eligible++;
    deptMap[dept].participating++;
    if (s.placementStatus === 'Placed') {
      deptMap[dept].placed++;
      if (s.fixedSalaryLpa) {
        deptMap[dept].sumSalary += s.fixedSalaryLpa;
        deptMap[dept].placedWithSalary++;
        if (s.fixedSalaryLpa > deptMap[dept].maxSalary) {
          deptMap[dept].maxSalary = s.fixedSalaryLpa;
        }
      }
    }
  });

  const data = Object.values(deptMap).map(d => ({
    ...d,
    placementRate: d.eligible > 0 ? ((d.placed / d.eligible) * 100).toFixed(1) + '%' : '0%',
    averagePackage: d.placedWithSalary > 0 ? (d.sumSalary / d.placedWithSalary).toFixed(2) : '0',
    highestPackage: d.maxSalary > 0 ? d.maxSalary.toFixed(2) : '0',
  }));

  const paginatedData = skip !== undefined && take !== undefined ? data.slice(skip, skip + take) : data;

  return { data: paginatedData, count: data.length, summary: { totalRecords: data.length } };
};

const getCompanyHiringReport = async (filters: any, skip?: number, take?: number) => {
  const where: any = { ...buildStudentWhere(filters), placementStatus: 'Placed' };
  const students = await prisma.importedStudent.findMany({ where });
  
  const companyMap: Record<string, any> = {};
  students.forEach(s => {
    const company = s.companyName || 'Unknown';
    if (!companyMap[company]) {
      companyMap[company] = { company: company, hired: 0, maxSalary: 0, sumSalary: 0, placedWithSalary: 0 };
    }
    companyMap[company].hired++;
    if (s.fixedSalaryLpa) {
      companyMap[company].sumSalary += s.fixedSalaryLpa;
      companyMap[company].placedWithSalary++;
      if (s.fixedSalaryLpa > companyMap[company].maxSalary) {
        companyMap[company].maxSalary = s.fixedSalaryLpa;
      }
    }
  });

  const data = Object.values(companyMap)
    .sort((a, b) => b.hired - a.hired)
    .map(d => ({
      ...d,
      averagePackage: d.placedWithSalary > 0 ? (d.sumSalary / d.placedWithSalary).toFixed(2) : '0',
      highestPackage: d.maxSalary > 0 ? d.maxSalary.toFixed(2) : '0',
    }));

  const paginatedData = skip !== undefined && take !== undefined ? data.slice(skip, skip + take) : data;

  return { data: paginatedData, count: data.length, summary: { totalRecords: data.length } };
};

const buildStudentWhere = (filters: any) => {
  const where: any = {};
  if (filters.academicYear && filters.academicYear !== 'All') {
    where.academicYear = filters.academicYear;
  }
  if (filters.department && filters.department !== 'All') {
    where.department = filters.department;
  }
  if (filters.placementStatus && filters.placementStatus !== 'All') {
    where.placementStatus = filters.placementStatus;
  }
  return where;
};
