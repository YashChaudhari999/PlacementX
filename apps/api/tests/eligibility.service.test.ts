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
    await expect(checkEligibility(baseStudent, baseDrive)).resolves.toEqual({
      isEligible: true,
      reasons: [],
    });
  });

  it('enforces gap and required profile links', async () => {
    const result = await checkEligibility(
      { ...baseStudent, yearGap: 2, resumeUrl: null, githubUrl: null, totalBacklogs: 2, currentSemester: 7 },
      { ...baseDrive, maximumGapYears: 1, githubRequired: true },
    );

    expect(result.isEligible).toBe(false);
    expect(result.reasons).toEqual(expect.arrayContaining([
      'Education gap exceeds the allowed 1 year(s)',
      'A resume is required',
      'A GitHub profile is required',
      'Backlog history exceeds the allowed 0',
      'Current semester must be 8',
    ]));
  });
});
