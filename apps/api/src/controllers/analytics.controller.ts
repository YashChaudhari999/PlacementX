import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAnalytics = async (req: any, res: any) => {
  try {
    // Basic Counts
    const totalStudents = await prisma.studentProfile.count();
    const totalCompanies = await prisma.company.count();
    const totalDrives = await prisma.placementDrive.count();
    
    // Total Offers (Applications with SELECTED status)
    const totalOffers = await prisma.driveApplication.count({
      where: { status: 'SELECTED' }
    });

    // Highest and Average Package
    const drives = await prisma.placementDrive.findMany({
      where: { fixedSalary: { not: null } },
      select: { fixedSalary: true }
    });
    
    const salaries = drives.map(d => d.fixedSalary).filter(s => s !== null) as number[];
    const highestPackage = salaries.length > 0 ? Math.max(...salaries) : 0;
    const averagePackage = salaries.length > 0 ? (salaries.reduce((a, b) => a + b, 0) / salaries.length) : 0;

    // Distinct placed students
    const placedStudents = await prisma.driveApplication.groupBy({
      by: ['studentId'],
      where: { status: 'SELECTED' },
      _count: true
    });
    const totalPlacedStudents = placedStudents.length;
    const placementPercentage = totalStudents > 0 ? Math.round((totalPlacedStudents / totalStudents) * 100) : 0;

    // Branch-wise Placements
    const selectedApps = await prisma.driveApplication.findMany({
      where: { status: 'SELECTED' },
      include: {
        student: {
          select: { branch: true }
        }
      }
    });

    const branchCounts: Record<string, number> = {};
    selectedApps.forEach(app => {
      const branch = app.student.branch || 'Unknown';
      branchCounts[branch] = (branchCounts[branch] || 0) + 1;
    });

    const branchWisePlacement = Object.entries(branchCounts).map(([name, value]) => ({
      name,
      value
    }));

    // Applications Per Company (Top 5)
    const appsPerCompany = await prisma.placementDrive.findMany({
      include: {
        company: { select: { name: true } },
        _count: { select: { applications: true } }
      },
      orderBy: {
        applications: { _count: 'desc' }
      },
      take: 5
    });

    const topCompaniesByApps = appsPerCompany.map(d => ({
      name: d.company.name,
      applications: d._count.applications
    }));

    // Selection Rate (Total Selected / Total Applied)
    const totalApplications = await prisma.driveApplication.count();
    const selectionRate = totalApplications > 0 ? Math.round((totalOffers / totalApplications) * 100) : 0;

    return res.status(200).json({
      summary: {
        totalStudents,
        totalPlacedStudents,
        totalCompanies,
        totalDrives,
        totalOffers,
        highestPackage,
        averagePackage: Math.round(averagePackage * 100) / 100,
        placementPercentage,
        selectionRate
      },
      charts: {
        branchWisePlacement,
        topCompaniesByApps
      }
    });

  } catch (error: any) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
