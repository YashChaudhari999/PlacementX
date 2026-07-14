// @ts-nocheck


export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

export const checkEligibility = (
  student: StudentProfile,
  drive: PlacementDrive
): EligibilityResult => {
  const reasons: string[] = [];
  let isEligible = true;

  // 1. Branch Check
  if (drive.eligibleBranches && student.branch) {
    try {
      const allowedBranches = JSON.parse(drive.eligibleBranches);
      if (Array.isArray(allowedBranches) && allowedBranches.length > 0) {
        if (!allowedBranches.includes(student.branch)) {
          isEligible = false;
          reasons.push(`Branch not eligible. Allowed: ${allowedBranches.join(', ')}`);
        }
      }
    } catch (e) {
      // Fallback for simple string match if not JSON
      if (drive.eligibleBranches !== 'ALL' && !drive.eligibleBranches.includes(student.branch)) {
        isEligible = false;
        reasons.push(`Branch not eligible.`);
      }
    }
  }

  // 2. CGPA Check
  if (drive.minimumCgpa && student.cgpa !== null) {
    if (student.cgpa < drive.minimumCgpa) {
      isEligible = false;
      reasons.push(`Minimum CGPA required is ${drive.minimumCgpa}. Your CGPA is ${student.cgpa}.`);
    }
  }

  // 3. Passing Year Check
  if (drive.passingYear && student.passingYear) {
    if (student.passingYear !== drive.passingYear) {
      isEligible = false;
      reasons.push(`Required passing year is ${drive.passingYear}. Yours is ${student.passingYear}.`);
    }
  }

  // 4. Backlogs Check
  if (drive.activeBacklogsAllowed !== null && student.activeBacklogs !== null) {
    if (student.activeBacklogs > drive.activeBacklogsAllowed) {
      isEligible = false;
      reasons.push(`Maximum allowed active backlogs is ${drive.activeBacklogsAllowed}. You have ${student.activeBacklogs}.`);
    }
  }

  // 5. Year Gap Check
  if (drive.yearGapAllowed !== null && student.yearGap !== null) {
    if (student.yearGap > drive.yearGapAllowed) {
      isEligible = false;
      reasons.push(`Maximum allowed year gap is ${drive.yearGapAllowed}. You have ${student.yearGap}.`);
    }
  }

  // 6. Gender Restriction
  if (drive.genderRestriction && drive.genderRestriction !== 'ANY' && student.gender) {
    if (student.gender.toUpperCase() !== drive.genderRestriction.toUpperCase()) {
      isEligible = false;
      reasons.push(`Drive is restricted to ${drive.genderRestriction} candidates only.`);
    }
  }

  return { isEligible, reasons };
};

export const checkProfileCompletion = (student: StudentProfile) => {
  const missingFields: string[] = [];
  
  if (!student.resumeUrl) missingFields.push('Resume');
  if (!student.photoUrl) missingFields.push('Profile Photo');
  if (student.cgpa === null) missingFields.push('CGPA');
  if (!student.skills) missingFields.push('Skills');
  if (!student.projects) missingFields.push('Projects');
  if (!student.educationDetails) missingFields.push('Education Details');
  
  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
};
