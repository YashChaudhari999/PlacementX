import prisma from '../utils/prisma';
import { PrismaClient, PlacementDrive } from '@prisma/client';
import * as settingsService from './settings.service';


export const filterEligibleStudents = async (drive: PlacementDrive) => {
  const whereClause: any = {
    isProfileComplete: true,
  };

  const minimumCGPA = await settingsService.getSetting('minimumCGPA');
  const maxBacklogsAllowed = await settingsService.getSetting('maxBacklogsAllowed');

  if (drive.minimumCgpa) {
    whereClause.cgpa = { gte: drive.minimumCgpa };
  } else if (minimumCGPA !== null) {
    whereClause.cgpa = { gte: minimumCGPA };
  }

  if (drive.activeBacklogsAllowed !== null && drive.activeBacklogsAllowed !== undefined) {
    whereClause.activeBacklogs = { lte: drive.activeBacklogsAllowed };
  } else if (maxBacklogsAllowed !== null) {
    whereClause.activeBacklogs = { lte: maxBacklogsAllowed };
  }

  if (drive.passingYear) {
    whereClause.passingYear = drive.passingYear;
  }
  
  if (drive.genderRestriction && drive.genderRestriction.toUpperCase() !== 'ANY') {
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

export const checkEligibility = async (student: any, drive: any) => {
  const reasons: string[] = [];
  const minimumCGPA = await settingsService.getSetting('minimumCGPA');
  const maxBacklogsAllowed = await settingsService.getSetting('maxBacklogsAllowed');
  const requireVerification = await settingsService.getSetting('requireProfileVerification');

  if (requireVerification && !student.isProfileComplete) {
    reasons.push("Profile is incomplete");
  }
  
  const requiredCgpa = drive.minimumCgpa !== null ? drive.minimumCgpa : minimumCGPA;
  if (requiredCgpa && (student.cgpa || 0) < requiredCgpa) {
    reasons.push(`CGPA is less than required ${requiredCgpa}`);
  }

  const allowedBacklogs = drive.activeBacklogsAllowed !== null ? drive.activeBacklogsAllowed : maxBacklogsAllowed;
  if (allowedBacklogs !== null && allowedBacklogs !== undefined && (student.activeBacklogs || 0) > allowedBacklogs) {
    reasons.push(`Active backlogs exceed allowed ${allowedBacklogs}`);
  }

  if (drive.passingYear && student.passingYear !== drive.passingYear) {
    reasons.push(`Passing year must be ${drive.passingYear}`);
  }

  if (drive.genderRestriction && drive.genderRestriction.toUpperCase() !== 'ANY' && student.gender !== drive.genderRestriction) {
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
