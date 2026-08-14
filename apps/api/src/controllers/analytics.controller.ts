import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to build where clause
const buildStudentWhereClause = (query: any, yearOverride?: string) => {
  const where: any = {};
  
  if (yearOverride) {
    where.academicYear = yearOverride;
  } else if (query.academicYear && query.academicYear !== 'All Years') {
    where.academicYear = query.academicYear;
  }
  
  if (query.department && query.department !== 'All Departments') {
    where.department = query.department;
  }
  return where;
};

// 1. Placement Overview (KPIs with YoY Comparison)
export const getPlacementOverview = async (req: Request, res: Response) => {
  try {
    const currentWhere = buildStudentWhereClause(req.query);
    const previousWhere = buildStudentWhereClause(req.query, req.query.compareWith as string);

    const fetchStats = async (where: any) => {
      const [totalStudents, eligibleStudents, placedStudents, salaries] = await Promise.all([
        prisma.importedStudent.count({ where }),
        prisma.importedStudent.count({ where: { ...where, activeBacklogs: 0 } }),
        prisma.importedStudent.count({ where: { ...where, placementStatus: 'Placed' } }),
        prisma.importedStudent.aggregate({
          where: { ...where, placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
          _avg: { fixedSalaryLpa: true },
          _max: { fixedSalaryLpa: true }
        })
      ]);

      const unplacedStudents = totalStudents - placedStudents;
      const placementRate = totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;
      
      return {
        totalStudents,
        eligibleStudents,
        placedStudents,
        unplacedStudents,
        placementRate: parseFloat(placementRate.toFixed(2)),
        averagePackage: salaries._avg.fixedSalaryLpa ? parseFloat(salaries._avg.fixedSalaryLpa.toFixed(2)) : 0,
        highestPackage: salaries._max.fixedSalaryLpa || 0
      };
    };

    const current = await fetchStats(currentWhere);
    let previous = null;

    if (req.query.compareWith) {
      previous = await fetchStats(previousWhere);
    }

    res.status(200).json({ current, previous });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching overview', error: error.message });
  }
};

// 2. Year Comparison (Trend)
export const getPlacementYearComparison = async (req: Request, res: Response) => {
  try {
    const where = buildStudentWhereClause(req.query);
    delete where.academicYear; // we group by year instead

    const stats = await prisma.importedStudent.groupBy({
      by: ['academicYear'],
      where,
      _count: { _all: true }
    });

    const results = await Promise.all(stats.map(async (stat: any) => {
      const yearWhere = { ...where, academicYear: stat.academicYear };
      const [placed, salaries] = await Promise.all([
        prisma.importedStudent.count({ where: { ...yearWhere, placementStatus: 'Placed' } }),
        prisma.importedStudent.aggregate({
          where: { ...yearWhere, placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
          _avg: { fixedSalaryLpa: true }
        })
      ]);
      const total = stat._count._all;
      return {
        year: stat.academicYear,
        totalStudents: total,
        placedStudents: placed,
        unplacedStudents: total - placed,
        placementRate: total > 0 ? parseFloat(((placed / total) * 100).toFixed(2)) : 0,
        averagePackage: salaries._avg.fixedSalaryLpa ? parseFloat(salaries._avg.fixedSalaryLpa.toFixed(2)) : 0
      };
    }));

    // Sort by year
    results.sort((a, b) => a.year.localeCompare(b.year));
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching year comparison', error: error.message });
  }
};

// 3. Departments Comparison & Heatmap
export const getPlacementDepartments = async (req: Request, res: Response) => {
  try {
    const currentYear = req.query.academicYear as string || '2026/2027';
    const previousYear = req.query.compareWith as string || '2025/2026';

    const getDeptStats = async (year: string) => {
      const depts = await prisma.importedStudent.groupBy({
        by: ['department'],
        where: { academicYear: year },
        _count: { _all: true }
      });

      const stats = await Promise.all(depts.map(async (d: any) => {
        const [placed, salaries] = await Promise.all([
          prisma.importedStudent.count({ where: { academicYear: year, department: d.department, placementStatus: 'Placed' } }),
          prisma.importedStudent.aggregate({
            where: { academicYear: year, department: d.department, placementStatus: 'Placed' },
            _avg: { fixedSalaryLpa: true }
          })
        ]);
        const total = d._count._all;
        return {
          department: d.department,
          total,
          placed,
          placementRate: total > 0 ? parseFloat(((placed / total) * 100).toFixed(2)) : 0,
          averagePackage: salaries._avg.fixedSalaryLpa ? parseFloat(salaries._avg.fixedSalaryLpa.toFixed(2)) : 0
        };
      }));
      return stats;
    };

    const currentStats = await getDeptStats(currentYear);
    const prevStats = await getDeptStats(previousYear);

    // Merge them
    const allDepts = Array.from(new Set([...currentStats.map(s => s.department), ...prevStats.map(s => s.department)]));
    
    const combined = allDepts.map(dept => {
      const curr = currentStats.find(s => s.department === dept) || { total: 0, placed: 0, placementRate: 0, averagePackage: 0 };
      const prev = prevStats.find(s => s.department === dept) || { total: 0, placed: 0, placementRate: 0, averagePackage: 0 };
      
      return {
        department: dept,
        current: curr,
        previous: prev,
        placementRateChange: parseFloat((curr.placementRate - prev.placementRate).toFixed(2)),
        packageChange: parseFloat((curr.averagePackage - prev.averagePackage).toFixed(2)),
        placedChange: curr.placed - prev.placed
      };
    });

    res.status(200).json(combined);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching department stats', error: error.message });
  }
};

// 4. Packages
export const getPlacementPackages = async (req: Request, res: Response) => {
  try {
    const currentWhere = buildStudentWhereClause(req.query);
    const previousWhere = buildStudentWhereClause(req.query, req.query.compareWith as string);

    const getPkgStats = async (where: any) => {
      const stats = await prisma.importedStudent.aggregate({
        where: { ...where, placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
        _avg: { fixedSalaryLpa: true },
        _max: { fixedSalaryLpa: true },
        _min: { fixedSalaryLpa: true }
      });
      
      const all = await prisma.importedStudent.findMany({
        where: { ...where, placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
        select: { fixedSalaryLpa: true },
        orderBy: { fixedSalaryLpa: 'asc' }
      });
      
      let median = 0;
      if (all.length > 0) {
        const mid = Math.floor(all.length / 2);
        median = all.length % 2 === 0 
          ? ((all[mid - 1].fixedSalaryLpa as number) + (all[mid].fixedSalaryLpa as number)) / 2 
          : (all[mid].fixedSalaryLpa as number);
      }

      // Distribution
      const distribution = {
        '< 3 LPA': 0,
        '3-5 LPA': 0,
        '5-8 LPA': 0,
        '8-12 LPA': 0,
        '12-20 LPA': 0,
        '20+ LPA': 0
      };

      all.forEach(s => {
        const pkg = s.fixedSalaryLpa as number;
        if (pkg < 3) distribution['< 3 LPA']++;
        else if (pkg < 5) distribution['3-5 LPA']++;
        else if (pkg < 8) distribution['5-8 LPA']++;
        else if (pkg < 12) distribution['8-12 LPA']++;
        else if (pkg < 20) distribution['12-20 LPA']++;
        else distribution['20+ LPA']++;
      });

      return {
        averagePackage: stats._avg.fixedSalaryLpa ? parseFloat(stats._avg.fixedSalaryLpa.toFixed(2)) : 0,
        highestPackage: stats._max.fixedSalaryLpa || 0,
        lowestPackage: stats._min.fixedSalaryLpa || 0,
        medianPackage: parseFloat(median.toFixed(2)),
        distribution
      };
    };

    const current = await getPkgStats(currentWhere);
    const previous = req.query.compareWith ? await getPkgStats(previousWhere) : null;

    res.status(200).json({ current, previous });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching packages', error: error.message });
  }
};

// 5. Companies
export const getPlacementCompanies = async (req: Request, res: Response) => {
  try {
    const currentWhere = buildStudentWhereClause(req.query);
    const previousWhere = buildStudentWhereClause(req.query, req.query.compareWith as string);

    const getCompanyStats = async (where: any) => {
      const companies = await prisma.importedStudent.groupBy({
        by: ['companyName'],
        where: { ...where, placementStatus: 'Placed', companyName: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { companyName: 'desc' } },
        take: 10
      });
      
      return Promise.all(companies.map(async (c: any) => {
        const stats = await prisma.importedStudent.aggregate({
          where: { ...where, companyName: c.companyName, placementStatus: 'Placed' },
          _avg: { fixedSalaryLpa: true }
        });
        return {
          companyName: c.companyName,
          offers: c._count._all,
          averagePackage: stats._avg.fixedSalaryLpa ? parseFloat(stats._avg.fixedSalaryLpa.toFixed(2)) : 0
        };
      }));
    };

    const countUniqueCompanies = async (where: any) => {
      const res = await prisma.importedStudent.groupBy({
        by: ['companyName'],
        where: { ...where, placementStatus: 'Placed', companyName: { not: null } }
      });
      return res.length;
    };

    const currentTop = await getCompanyStats(currentWhere);
    const currentCount = await countUniqueCompanies(currentWhere);
    
    let previousCount = 0;
    if (req.query.compareWith) {
      previousCount = await countUniqueCompanies(previousWhere);
    }

    res.status(200).json({ 
      topCompanies: currentTop,
      totalCompanies: currentCount,
      previousCompanies: previousCount
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
};

// 6. Placement Funnel
export const getPlacementFunnel = async (req: Request, res: Response) => {
  try {
    const where = buildStudentWhereClause(req.query);

    const totalStudents = await prisma.importedStudent.count({ where });
    const eligibleStudents = await prisma.importedStudent.count({ where: { ...where, activeBacklogs: 0 } });
    const participating = await prisma.importedStudent.count({ where: { ...where, applicationStatus: { not: null } } });
    const offers = await prisma.importedStudent.count({ where: { ...where, placementStatus: 'Placed' } });
    const placed = offers; // In this dataset, offers == placed

    res.status(200).json([
      { stage: 'Total Students', count: totalStudents, percentage: 100 },
      { stage: 'Eligible', count: eligibleStudents, percentage: totalStudents ? Math.round((eligibleStudents/totalStudents)*100) : 0 },
      { stage: 'Participating', count: participating, percentage: eligibleStudents ? Math.round((participating/eligibleStudents)*100) : 0 },
      { stage: 'Offers', count: offers, percentage: participating ? Math.round((offers/participating)*100) : 0 },
      { stage: 'Placed', count: placed, percentage: offers ? Math.round((placed/offers)*100) : 0 }
    ]);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching funnel', error: error.message });
  }
};

// 7. Intelligence (Insights & Recommendations)
export const getPlacementIntelligence = async (req: Request, res: Response) => {
  try {
    const currentYear = req.query.academicYear as string || '2026/2027';
    const previousYear = req.query.compareWith as string || '2025/2026';

    const insights: any[] = [];
    const recommendations: any[] = [];
    const risks: any[] = [];

    // 1. Overall logic
    const currCount = await prisma.importedStudent.count({ where: { academicYear: currentYear } });
    const prevCount = await prisma.importedStudent.count({ where: { academicYear: previousYear } });
    const currPlaced = await prisma.importedStudent.count({ where: { academicYear: currentYear, placementStatus: 'Placed' } });
    const prevPlaced = await prisma.importedStudent.count({ where: { academicYear: previousYear, placementStatus: 'Placed' } });

    const currRate = currCount ? (currPlaced / currCount) * 100 : 0;
    const prevRate = prevCount ? (prevPlaced / prevCount) * 100 : 0;
    const rateDiff = currRate - prevRate;

    if (rateDiff > 2) {
      insights.push({ type: 'improvement', text: `Overall placement rate improved by +${rateDiff.toFixed(1)} percentage points compared to ${previousYear}.` });
    } else if (rateDiff < -2) {
      insights.push({ type: 'risk', text: `Overall placement rate declined by ${Math.abs(rateDiff).toFixed(1)} percentage points compared to ${previousYear}.` });
      recommendations.push({ text: `Investigate the overall decline in placement rate. Focus on increasing recruiter outreach and student interview preparation.` });
    }

    // 2. Department logic
    const depts = await prisma.importedStudent.groupBy({ by: ['department'], where: { academicYear: currentYear } });
    
    let bestDept = null;
    let worstDept = null;
    let maxRate = -1;
    let minRate = 101;

    for (const d of depts) {
      const c = await prisma.importedStudent.count({ where: { academicYear: currentYear, department: d.department } });
      const p = await prisma.importedStudent.count({ where: { academicYear: currentYear, department: d.department, placementStatus: 'Placed' } });
      const rate = c ? (p / c) * 100 : 0;
      
      if (rate > maxRate) { maxRate = rate; bestDept = d.department; }
      if (rate < minRate && c > 10) { minRate = rate; worstDept = d.department; } // minimum 10 students
      
      const prevC = await prisma.importedStudent.count({ where: { academicYear: previousYear, department: d.department } });
      const prevP = await prisma.importedStudent.count({ where: { academicYear: previousYear, department: d.department, placementStatus: 'Placed' } });
      const pRate = prevC ? (prevP / prevC) * 100 : 0;
      const dDiff = rate - pRate;

      // Add a specific insight for this department
      if (dDiff > 0) {
        insights.push({ type: 'improvement', text: `${d.department} placement rate improved by +${dDiff.toFixed(1)} percentage points.` });
      } else if (dDiff < 0) {
        if (dDiff < -5) {
          risks.push({ type: 'risk', text: `${d.department} experienced a decline of ${Math.abs(dDiff).toFixed(1)} percentage points.` });
          recommendations.push({ text: `Increase specialized recruiter outreach for ${d.department} and prioritize department-specific placement training.` });
        } else {
          insights.push({ type: 'attention', text: `${d.department} placement rate slightly declined by ${Math.abs(dDiff).toFixed(1)} percentage points.` });
        }
      } else {
        insights.push({ type: 'info', text: `${d.department} placement rate remained stable.` });
      }
    }

    if (bestDept) {
      insights.push({ type: 'strong', text: `${bestDept} currently has the strongest placement performance (${maxRate.toFixed(1)}%).` });
    }
    if (worstDept && minRate < currRate - 5) {
      risks.push({ type: 'attention', text: `${worstDept} is significantly below the institutional average (${minRate.toFixed(1)}%).` });
      recommendations.push({ text: `Focus placement training and opportunities heavily on ${worstDept} to bring them up to the institutional average.` });
    }

    // 3. Salary logic
    const currSal = await prisma.importedStudent.aggregate({ where: { academicYear: currentYear, placementStatus: 'Placed' }, _avg: { fixedSalaryLpa: true } });
    const prevSal = await prisma.importedStudent.aggregate({ where: { academicYear: previousYear, placementStatus: 'Placed' }, _avg: { fixedSalaryLpa: true } });

    if (currSal._avg.fixedSalaryLpa && prevSal._avg.fixedSalaryLpa) {
      const salDiff = currSal._avg.fixedSalaryLpa - prevSal._avg.fixedSalaryLpa;
      const salGrowth = (salDiff / prevSal._avg.fixedSalaryLpa) * 100;
      
      if (salGrowth > 5) {
        insights.push({ type: 'growth', text: `Average package increased by ${salGrowth.toFixed(1)}% compared with the previous academic year.` });
      }
    }

    res.status(200).json({ insights, risks, recommendations });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching intelligence', error: error.message });
  }
};
