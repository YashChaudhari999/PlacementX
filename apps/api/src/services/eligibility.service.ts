import { PrismaClient, PlacementDrive } from '@prisma/client';

const prisma = new PrismaClient();

export const filterEligibleStudents = async (drive: PlacementDrive) => {
  const whereClause: any = {
    isProfileComplete: true,
  };

  if (drive.minimumCgpa) {
    whereClause.cgpa = { gte: drive.minimumCgpa };
  }

  if (drive.activeBacklogsAllowed !== null && drive.activeBacklogsAllowed !== undefined) {
    whereClause.activeBacklogs = { lte: drive.activeBacklogsAllowed };
  }

  if (drive.passingYear) {
    whereClause.passingYear = drive.passingYear;
  }
  
  if (drive.genderRestriction && drive.genderRestriction !== 'Any') {
      whereClause.gender = drive.genderRestriction;
  }

  if (drive.eligibleBranches) {
    try {
      const branches = JSON.parse(drive.eligibleBranches);
      if (Array.isArray(branches) && branches.length > 0 && !branches.includes('All')) {
        whereClause.branch = { in: branches };
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  const eligibleStudents = await prisma.studentProfile.findMany({
    where: whereClause,
    select: { userId: true },
  });

  return eligibleStudents.map(student => student.userId);
};
