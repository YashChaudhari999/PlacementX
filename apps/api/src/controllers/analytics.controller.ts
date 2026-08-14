import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to build where clause from query
const buildDriveWhereClause = (query: any, yearKey: string) => {
  const where: any = { status: { not: 'DRAFT' } };
  
  if (query[yearKey]) {
    where.academicYear = query[yearKey];
  }
  if (query.season && query.season !== 'All') {
    where.placementSeason = query.season;
  }
  // Add more filters as needed: department, company, etc.
  // For company
  if (query.companyId) {
    where.companyId = query.companyId;
  }
  
  return where;
};

// Helper to build student where clause
const buildStudentWhereClause = (query: any) => {
  const where: any = {};
  if (query.department && query.department !== 'All') {
    where.branch = query.department;
  }
  if (query.gender && query.gender !== 'All') {
    where.gender = query.gender;
  }
  return where;
};

// 1. Summary Endpoint
export const getAnalyticsSummary = async (req: any, res: any) => {
  try {
    const currentWhere = buildDriveWhereClause(req.query, 'currentYear');
    const prevWhere = buildDriveWhereClause(req.query, 'previousYear');
    const studentWhere = buildStudentWhereClause(req.query);

    // Group 1: Independent queries
    const [
      totalEligibleCurrent,
      currentDrives,
      prevDrives,
    ] = await Promise.all([
      prisma.studentProfile.count({
        where: { ...studentWhere, isProfileComplete: true, activeBacklogs: 0 }
      }),
      prisma.placementDrive.findMany({
        where: currentWhere,
        select: { id: true, fixedSalary: true, companyId: true }
      }),
      prisma.placementDrive.findMany({
        where: prevWhere,
        select: { id: true, fixedSalary: true, companyId: true }
      })
    ]);

    // In a real app, student batches define year. Here we'll just mock previous as slightly less for demo
    const totalEligiblePrev = Math.max(0, totalEligibleCurrent - Math.floor(Math.random() * 20));

    const currentDriveIds = currentDrives.map(d => d.id);
    const prevDriveIds = prevDrives.map(d => d.id);

    // Group 2: Dependent queries
    const [
      totalAppliedCurrent,
      totalAppliedPrev,
      currentOffers,
      prevOffers,
      placedCurrentGroup,
      placedPrevGroup
    ] = await Promise.all([
      prisma.driveApplication.count({
        where: { driveId: { in: currentDriveIds }, student: studentWhere }
      }),
      prisma.driveApplication.count({
        where: { driveId: { in: prevDriveIds } }
      }),
      prisma.driveApplication.count({
        where: { driveId: { in: currentDriveIds }, status: 'SELECTED', student: studentWhere }
      }),
      prisma.driveApplication.count({
        where: { driveId: { in: prevDriveIds }, status: 'SELECTED' }
      }),
      prisma.driveApplication.groupBy({
        by: ['studentId'],
        where: { driveId: { in: currentDriveIds }, status: 'SELECTED', student: studentWhere }
      }),
      prisma.driveApplication.groupBy({
        by: ['studentId'],
        where: { driveId: { in: prevDriveIds }, status: 'SELECTED' }
      })
    ]);

    const placedCurrent = placedCurrentGroup.length;
    const placedPrev = placedPrevGroup.length;

    // Packages
    const currentPackages = currentDrives.map(d => d.fixedSalary).filter(p => p && p > 0) as number[];
    const prevPackages = prevDrives.map(d => d.fixedSalary).filter(p => p && p > 0) as number[];

    const calcHighest = (arr: number[]) => arr.length > 0 ? Math.max(...arr) : 0;
    const calcAvg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const calcMedian = (arr: number[]) => {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    // Recruiters
    const currentCompanies = new Set(currentDrives.map(d => d.companyId)).size;
    const prevCompanies = new Set(prevDrives.map(d => d.companyId)).size;

    return res.status(200).json({
      eligibleStudents: { current: totalEligibleCurrent, previous: totalEligiblePrev },
      appliedStudents: { current: totalAppliedCurrent, previous: totalAppliedPrev },
      placedStudents: { current: placedCurrent, previous: placedPrev },
      placementPercentage: { 
        current: totalEligibleCurrent > 0 ? Math.round((placedCurrent / totalEligibleCurrent) * 100) : 0,
        previous: totalEligiblePrev > 0 ? Math.round((placedPrev / totalEligiblePrev) * 100) : 0,
      },
      totalOffers: { current: currentOffers, previous: prevOffers },
      highestPackage: { current: calcHighest(currentPackages), previous: calcHighest(prevPackages) },
      averagePackage: { 
        current: Math.round(calcAvg(currentPackages) * 100) / 100, 
        previous: Math.round(calcAvg(prevPackages) * 100) / 100 
      },
      medianPackage: { 
        current: Math.round(calcMedian(currentPackages) * 100) / 100, 
        previous: Math.round(calcMedian(prevPackages) * 100) / 100 
      },
      companiesVisited: { current: currentCompanies, previous: prevCompanies },
      newRecruiters: { current: Math.floor(currentCompanies * 0.3), previous: Math.floor(prevCompanies * 0.2) } // Mock calculation for new
    });

  } catch (error: any) {
    console.error('Summary Analytics Error:', error);
    return res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
};

// 2. Charts Endpoint
export const getAnalyticsCharts = async (req: any, res: any) => {
  try {
    const currentWhere = buildDriveWhereClause(req.query, 'currentYear');
    const studentWhere = buildStudentWhereClause(req.query);

    // Get all relevant drives
    const currentDrives = await prisma.placementDrive.findMany({
      where: currentWhere,
      include: {
        company: true,
        applications: {
          where: { student: studentWhere },
          include: { student: true }
        }
      }
    });

    // 1. Placement Trend (Mocked month-wise distribution based on total offers for speed, usually group by createdAt)
    const placementTrend = [
      { month: 'Jul', current: 0, previous: 0 },
      { month: 'Aug', current: 15, previous: 10 },
      { month: 'Sep', current: 45, previous: 35 },
      { month: 'Oct', current: 80, previous: 60 },
      { month: 'Nov', current: 50, previous: 45 },
      { month: 'Dec', current: 20, previous: 15 },
      { month: 'Jan', current: 10, previous: 12 },
    ];

    // 3. Department Wise (Horizontal Bar)
    const deptCounts: any = {};
    currentDrives.forEach(drive => {
      drive.applications.forEach(app => {
        if (app.status === 'SELECTED') {
          const b = app.student.branch || 'Unknown';
          deptCounts[b] = (deptCounts[b] || 0) + 1;
        }
      });
    });
    const departmentWise = Object.entries(deptCounts).map(([name, current]) => ({
      name,
      current,
      previous: Math.max(0, (current as number) - Math.floor(Math.random() * 5))
    }));

    // 4. Company Hiring Stacked
    const companyHiringCounts: any = {};
    currentDrives.forEach(drive => {
      const c = drive.company.name;
      if (!companyHiringCounts[c]) companyHiringCounts[c] = { applied: 0, selected: 0 };
      companyHiringCounts[c].applied += drive.applications.length;
      companyHiringCounts[c].selected += drive.applications.filter(a => a.status === 'SELECTED').length;
    });
    const companyHiring = Object.entries(companyHiringCounts)
      .map(([name, counts]: any) => ({ name, ...counts }))
      .sort((a, b) => b.selected - a.selected)
      .slice(0, 10);

    // 5. Package Distribution (Histogram approximation)
    const bins = { '3-5 LPA': 0, '5-8 LPA': 0, '8-10 LPA': 0, '10-15 LPA': 0, '15+ LPA': 0 };
    currentDrives.forEach(d => {
      if (d.fixedSalary) {
        if (d.fixedSalary >= 15) bins['15+ LPA']++;
        else if (d.fixedSalary >= 10) bins['10-15 LPA']++;
        else if (d.fixedSalary >= 8) bins['8-10 LPA']++;
        else if (d.fixedSalary >= 5) bins['5-8 LPA']++;
        else bins['3-5 LPA']++;
      }
    });
    const packageDistribution = Object.entries(bins).map(([name, current]) => ({
      name,
      current,
      previous: Math.max(0, current - Math.floor(Math.random() * 3))
    }));

    // 7. Company Category
    const categoryCounts: any = {};
    currentDrives.forEach(d => {
      const type = d.company.industry || 'Service'; // Mocking
      categoryCounts[type] = (categoryCounts[type] || 0) + 1;
    });
    const companyCategory = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

    // 9. Offer Acceptance Rate (Donut)
    const offerAcceptance = [
      { name: 'Accepted', value: 85 },
      { name: 'Rejected', value: 10 },
      { name: 'Pending', value: 5 },
    ];

    // 10. Student Funnel
    const funnel = [
      { name: 'Eligible', value: 500 },
      { name: 'Applied', value: 450 },
      { name: 'Shortlisted', value: 300 },
      { name: 'Interview', value: 200 },
      { name: 'Offer', value: 120 },
      { name: 'Placed', value: 110 },
    ];

    // 13. Gender
    const genderWise = [
      { name: 'Male', value: 60 },
      { name: 'Female', value: 40 },
    ];

    // 14. Location (Mocked for map/chart)
    const locationWise = [
      { id: 'IN-MH', state: 'Maharashtra', value: 120 },
      { id: 'IN-KA', state: 'Karnataka', value: 80 },
      { id: 'IN-DL', state: 'Delhi', value: 40 },
      { id: 'IN-TS', state: 'Telangana', value: 60 },
    ];

    // 15. Skills (Word Cloud)
    const skills = [
      { text: 'React', value: 100 },
      { text: 'Java', value: 80 },
      { text: 'Python', value: 90 },
      { text: 'AWS', value: 60 },
      { text: 'Node.js', value: 70 },
      { text: 'SQL', value: 85 },
      { text: 'Docker', value: 45 },
      { text: 'Machine Learning', value: 50 },
    ];

    // 16. CGPA vs Placement (Scatter)
    const cgpaVsPlacement = [
      { cgpa: 8.5, package: 12, status: 'Placed' },
      { cgpa: 9.1, package: 15, status: 'Placed' },
      { cgpa: 7.8, package: 8, status: 'Placed' },
      { cgpa: 6.5, package: 5, status: 'Placed' },
      { cgpa: 8.0, package: 0, status: 'Unplaced' },
      { cgpa: 9.5, package: 20, status: 'Placed' },
    ];

    // 18. Leaderboard
    const leaderboard = companyHiring.map(c => ({
      company: c.name,
      studentsHired: c.selected,
      avgPackage: 10,
      highestPackage: 15,
      department: 'Computer Engineering'
    }));

    return res.status(200).json({
      placementTrend,
      departmentWise,
      companyHiring,
      packageDistribution,
      companyCategory,
      offerAcceptance,
      funnel,
      genderWise,
      locationWise,
      skills,
      cgpaVsPlacement,
      leaderboard
    });

  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching charts', error: error.message });
  }
};

// 3. AI Insights
export const getAnalyticsAiInsights = async (req: any, res: any) => {
  try {
    // Generate deterministic insights based on data. (Mocked logic for speed)
    const insights = [
      "Placement increased by 18% compared to last year.",
      "Average package increased by 1.8 LPA.",
      "Computer Engineering department showed the highest growth.",
      "Amazon hired 35% more students this season.",
      "Placement percentage dropped slightly in Information Technology.",
      "Top recruiters shifted from service companies to product companies.",
      "Interview conversion improved by 12% across all branches."
    ];

    let predictions = {
      placementPercentage: 92,
      expectedCompanies: 45,
      highestPackage: 35,
      averagePackage: 11.5,
      trend: "Upward",
      atRisk: "AI/ML"
    };

    try {
      // Fetch real predictions from Python ML Service
      const mlResponse = await fetch('http://localhost:8000/api/ai/analytics/forecast?forecastYear=2026');
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        predictions = {
          ...predictions,
          placementPercentage: mlData.placementPercentage,
          expectedCompanies: mlData.visitingCompanies,
          highestPackage: mlData.highestPackage,
          averagePackage: mlData.averagePackage,
          trend: mlData.trend
        };
      }
    } catch (mlError) {
      console.warn("ML Service unavailable, falling back to mock predictions", mlError);
    }

    return res.status(200).json({
      insights,
      predictions
    });

  } catch (error: any) {
    return res.status(500).json({ message: 'Error generating AI insights', error: error.message });
  }
};
