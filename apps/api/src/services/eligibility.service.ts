import prisma from '../utils/prisma';
import { PlacementDrive } from '@prisma/client';
import * as settingsService from './settings.service';
import { BATCH_2027_POLICY } from '../domain/batch2027.policy';
import { evaluateOfferEligibility } from './offer-eligibility.service';

export type EligibilityReason = { code: string; explanation: string };

const addReason = (target: EligibilityReason[], code: string, explanation: string) => {
  target.push({ code, explanation });
};


export const filterEligibleStudents = async (drive: PlacementDrive) => {
  const students = await prisma.studentProfile.findMany();
  const results = await Promise.all(students.map(async (student) => ({
    userId: student.userId,
    result: await checkEligibility(student, drive),
  })));
  return results.filter(({ result }) => result.isEligible && !result.requiresReview).map(({ userId }) => userId);
};

export const checkEligibility = async (student: any, drive: any) => {
  const details: EligibilityReason[] = [];
  const minimumCGPA = await settingsService.getSetting('minimumCGPA');
  const maxBacklogsAllowed = await settingsService.getSetting('maxBacklogsAllowed');
  const requireVerification = await settingsService.getSetting('requireProfileVerification');

  if (!student.isProfileComplete) {
    addReason(details, 'PROFILE_INCOMPLETE', 'Profile is incomplete');
  }
  if (requireVerification && student.profileStatus !== 'VERIFIED') {
    addReason(details, 'PROFILE_NOT_VERIFIED', 'Profile must be verified by the Placement Cell');
  }
  if (student.enrollmentStatus && student.enrollmentStatus !== 'ACTIVE') {
    addReason(details, 'ENROLLMENT_INACTIVE', 'Placement portal enrolment is not active');
  }
  if (student.academicRestriction) {
    addReason(details, 'ACADEMIC_RESTRICTION', 'An academic restriction prevents application');
  }
  if (student.disciplinaryRestriction) {
    addReason(details, 'DISCIPLINARY_RESTRICTION', 'A disciplinary restriction prevents application');
  }
  
  const requiredCgpa = drive.minimumCgpa !== null ? drive.minimumCgpa : minimumCGPA;
  if (requiredCgpa && (student.cgpa || 0) < requiredCgpa) {
    addReason(details, 'CGPA_BELOW_MINIMUM', `CGPA is less than required ${requiredCgpa}`);
  }

  const allowedBacklogs = drive.activeBacklogsAllowed !== null ? drive.activeBacklogsAllowed : maxBacklogsAllowed;
  if (allowedBacklogs !== null && allowedBacklogs !== undefined && (student.activeBacklogs || 0) > allowedBacklogs) {
    addReason(details, 'ACTIVE_BACKLOGS_EXCEEDED', `Active backlogs exceed allowed ${allowedBacklogs}`);
  }

  if (drive.passingYear && student.passingYear !== drive.passingYear) {
    addReason(details, 'PASSING_YEAR_MISMATCH', `Passing year must be ${drive.passingYear}`);
  }

  if (
    drive.historyOfBacklogsAllowed !== null &&
    drive.historyOfBacklogsAllowed !== undefined &&
    (student.totalBacklogs || 0) > drive.historyOfBacklogsAllowed
  ) {
    addReason(details, 'BACKLOG_HISTORY_EXCEEDED', `Backlog history exceeds the allowed ${drive.historyOfBacklogsAllowed}`);
  }
  if (drive.semester && student.currentSemester !== drive.semester) {
    addReason(details, 'SEMESTER_MISMATCH', `Current semester must be ${drive.semester}`);
  }

  const allowedGapYears = drive.maximumGapYears ?? drive.yearGapAllowed;
  if (allowedGapYears !== null && allowedGapYears !== undefined && (student.yearGap || 0) > allowedGapYears) {
    addReason(details, 'EDUCATION_GAP_EXCEEDED', `Education gap exceeds the allowed ${allowedGapYears} year(s)`);
  }

  if (drive.resumeMandatory && !student.resumeUrl) {
    addReason(details, 'RESUME_REQUIRED', 'A resume is required');
  }
  if (drive.portfolioRequired && !student.portfolioUrl) {
    addReason(details, 'PORTFOLIO_REQUIRED', 'A portfolio is required');
  }
  if (drive.githubRequired && !student.githubUrl) {
    addReason(details, 'GITHUB_REQUIRED', 'A GitHub profile is required');
  }
  if (drive.linkedinRequired && !student.linkedinUrl) {
    addReason(details, 'LINKEDIN_REQUIRED', 'A LinkedIn profile is required');
  }

  if (drive.genderRestriction && drive.genderRestriction.toUpperCase() !== 'ANY' && student.gender !== drive.genderRestriction) {
    addReason(details, 'GENDER_RESTRICTION', `Gender must be ${drive.genderRestriction}`);
  }

  if (drive.eligibleBranches) {
    try {
      const branches = JSON.parse(drive.eligibleBranches);
      if (Array.isArray(branches) && branches.length > 0 && !branches.includes('All')) {
        if (!branches.includes(student.branch)) {
          addReason(details, 'BRANCH_NOT_ELIGIBLE', `Branch ${student.branch} is not eligible`);
        }
      }
    } catch (e) {
      addReason(details, 'DRIVE_CRITERIA_INVALID', 'Drive branch criteria require administrative review');
    }
  }

  let requiresReview = details.some(({ code }) => code === 'DRIVE_CRITERIA_INVALID');
  if (drive.passingYear === 2027) {
    if (!student.policyAcknowledgedAt) {
      addReason(details, 'POLICY_NOT_ACKNOWLEDGED', 'Batch 2027 placement policy acknowledgement is required');
    }
    if (student.trainingAttendance === null || student.trainingAttendance === undefined) {
      requiresReview = true;
      addReason(details, 'TRAINING_ATTENDANCE_MISSING', 'Training attendance is missing and requires administrative review');
    } else if (student.trainingAttendance < BATCH_2027_POLICY.minimumTrainingAttendance) {
      addReason(details, 'TRAINING_ATTENDANCE_BELOW_MINIMUM', `Training attendance is below ${BATCH_2027_POLICY.minimumTrainingAttendance}%`);
    }
    const offerDecision = evaluateOfferEligibility(
      Number(student.confirmedOfferCount || 0),
      BATCH_2027_POLICY.offerEligibilityDecision,
    );
    if (offerDecision.requiresReview) {
      requiresReview = true;
      addReason(details, 'OFFER_POLICY_AMBIGUOUS', 'Future-drive eligibility after an offer requires an authorized policy decision');
    }
  }

  const blockingDetails = details.filter(({ code }) => !['TRAINING_ATTENDANCE_MISSING', 'OFFER_POLICY_AMBIGUOUS'].includes(code));

  return {
    isEligible: blockingDetails.length === 0 && !requiresReview,
    eligible: blockingDetails.length === 0 && !requiresReview,
    reasons: details.map(({ explanation }) => explanation),
    reasonCodes: details.map(({ code }) => code),
    explanations: details.map(({ explanation }) => explanation),
    policyVersion: drive.passingYear === 2027 ? BATCH_2027_POLICY.version : 'SYSTEM_DEFAULT',
    evaluatedAt: new Date().toISOString(),
    requiresReview,
  };
};

export const evaluateAndRecordEligibility = async (student: any, drive: any) => {
  const result = await checkEligibility(student, drive);
  if (student.id && drive.id) {
    await prisma.eligibilityEvaluation.create({
      data: {
        studentId: student.id,
        driveId: drive.id,
        eligible: result.isEligible,
        reasonCodes: result.reasonCodes,
        explanations: result.explanations,
        requiresReview: result.requiresReview,
        inputSnapshot: {
          profileUpdatedAt: student.updatedAt,
          driveUpdatedAt: drive.updatedAt,
          policyVersion: result.policyVersion,
        },
      },
    });
  }
  return result;
};
