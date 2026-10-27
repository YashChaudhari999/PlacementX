const prismaMock = {
  placementDrive: {
    findMany: jest.fn(),
  },
  studentProfile: {
    findUnique: jest.fn(),
  },
};

const checkEligibilityMock = jest.fn();

jest.mock('../src/utils/prisma', () => ({ __esModule: true, default: prismaMock }));
jest.mock('../src/services/drive-publication.service', () => ({
  dispatchDrivePublication: jest.fn(),
  recordDrivePublication: jest.fn(),
}));
jest.mock('../src/services/eligibility.service', () => ({
  checkEligibility: checkEligibilityMock,
}));

import { getDrives } from '../src/controllers/drive.controller';

const response = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('getDrives', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not return drives deleted through cancellation', async () => {
    prismaMock.placementDrive.findMany.mockResolvedValue([]);
    const res = response();

    await getDrives({ query: { academic_year: 'All Years' } } as any, res);

    expect(prismaMock.placementDrive.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: { not: 'CANCELLED' } } })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns only published eligible drives to a student', async () => {
    const drives = [{ id: 'eligible' }, { id: 'ineligible' }];
    prismaMock.placementDrive.findMany.mockResolvedValue(drives);
    prismaMock.studentProfile.findUnique.mockResolvedValue({ id: 'student-1' });
    checkEligibilityMock
      .mockResolvedValueOnce({ isEligible: true, requiresReview: false })
      .mockResolvedValueOnce({ isEligible: false, requiresReview: false });
    const res = response();

    await getDrives({
      query: { academic_year: 'All Years' },
      user: { id: 'user-1', role: 'STUDENT' },
    } as any, res);

    expect(prismaMock.placementDrive.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'PUBLISHED' } })
    );
    expect(res.json).toHaveBeenCalledWith([{ id: 'eligible' }]);
  });
});
