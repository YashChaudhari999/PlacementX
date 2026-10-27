jest.mock('../src/services/settings.service', () => ({
  getSetting: jest.fn(async (key: string) => {
    const values: Record<string, unknown> = {
      minimumCGPA: 6,
      maxBacklogsAllowed: 0,
      requireProfileVerification: true,
    };
    return values[key];
  }),
}));

import { checkEligibility } from '../src/services/eligibility.service';

const baseStudent = {
  isProfileComplete: true,
  profileStatus: 'VERIFIED',
  enrollmentStatus: 'ACTIVE',
  academicRestriction: false,
  disciplinaryRestriction: false,
  policyAcknowledgedAt: new Date('2026-07-01T00:00:00.000Z'),
  trainingAttendance: 80,
  confirmedOfferCount: 0,
  cgpa: 8,
  activeBacklogs: 0,
  passingYear: 2027,
  yearGap: 0,
  totalBacklogs: 0,
  currentSemester: 8,
  gender: 'Female',
  branch: 'Computer Science',
  resumeUrl: 'private/resume.pdf',
  portfolioUrl: 'https://portfolio.example',
  githubUrl: 'https://github.com/student',
  linkedinUrl: 'https://linkedin.com/in/student',
};

const baseDrive = {
  minimumCgpa: 7,
  activeBacklogsAllowed: 0,
  passingYear: 2027,
  maximumGapYears: 0,
  yearGapAllowed: 0,
  genderRestriction: 'ANY',
  eligibleBranches: JSON.stringify(['Computer Science']),
  resumeMandatory: true,
  portfolioRequired: false,
  githubRequired: false,
  linkedinRequired: false,
  historyOfBacklogsAllowed: 0,
  semester: 8,
};

describe('placement eligibility', () => {
  it('accepts a student who satisfies every configured requirement', async () => {
    await expect(checkEligibility(baseStudent, baseDrive)).resolves.toEqual(
      expect.objectContaining({
        isEligible: true,
        reasons: [],
        reasonCodes: [],
        requiresReview: false,
      })
    );
  });

  it('enforces gap and required profile links', async () => {
    const result = await checkEligibility(
      {
        ...baseStudent,
        yearGap: 2,
        resumeUrl: null,
        githubUrl: null,
        totalBacklogs: 2,
        currentSemester: 7,
      },
      { ...baseDrive, maximumGapYears: 1, githubRequired: true }
    );

    expect(result.isEligible).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        'Education gap exceeds the allowed 1 year(s)',
        'A resume is required',
        'A GitHub profile is required',
        'Backlog history exceeds the allowed 0',
        'Current semester must be 8',
      ])
    );
  });

  it('does not silently penalize missing attendance data', async () => {
    const result = await checkEligibility({ ...baseStudent, trainingAttendance: null }, baseDrive);
    expect(result.isEligible).toBe(false);
    expect(result.requiresReview).toBe(true);
    expect(result.reasonCodes).toContain('TRAINING_ATTENDANCE_MISSING');
  });

  it('requires review when Batch 2027 offer restrictions are ambiguous', async () => {
    const result = await checkEligibility({ ...baseStudent, confirmedOfferCount: 1 }, baseDrive);
    expect(result.requiresReview).toBe(true);
    expect(result.reasonCodes).toContain('OFFER_POLICY_AMBIGUOUS');
  });

  it('treats the ALL branch marker case-insensitively', async () => {
    const result = await checkEligibility(
      { ...baseStudent, branch: 'Mechanical Engineering' },
      { ...baseDrive, eligibleBranches: JSON.stringify(['ALL']) }
    );
    expect(result.isEligible).toBe(true);
  });
});
