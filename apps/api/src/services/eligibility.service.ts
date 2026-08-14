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

export const checkEligibility = (student: any, drive: any) => {
  const reasons: string[] = [];

  if (!student.isProfileComplete) {
    reasons.push("Profile is incomplete");
  }
  
  if (drive.minimumCgpa && (student.cgpa || 0) < drive.minimumCgpa) {
    reasons.push(`CGPA is less than required ${drive.minimumCgpa}`);
  }

  if (drive.activeBacklogsAllowed !== null && drive.activeBacklogsAllowed !== undefined && (student.activeBacklogs || 0) > drive.activeBacklogsAllowed) {
    reasons.push(`Active backlogs exceed allowed ${drive.activeBacklogsAllowed}`);
  }

  if (drive.passingYear && student.passingYear !== drive.passingYear) {
    reasons.push(`Passing year must be ${drive.passingYear}`);
  }

  if (drive.genderRestriction && drive.genderRestriction !== 'Any' && student.gender !== drive.genderRestriction) {
    reasons.push(`Gender must be ${drive.genderRestriction}`);
  }

  if (drive.eligibleBranches) {
    try {
      const branches = JSON.parse(drive.eligibleBranches);
      if (Array.isArray(branches) && branches.length > 0 && !branches.includes('All')) {
        if (!branches.includes(student.branch)) {
          reasons.push(`Branch ${student.branch} is not eligible`);
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons
  };
};
