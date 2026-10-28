const prismaMock = {
  company: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  placementDrive: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  hrInvitationLink: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  driveAuditLog: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

const getSettingMock = jest.fn();

jest.mock('../src/utils/prisma', () => ({ __esModule: true, default: prismaMock }));
jest.mock('../src/services/settings.service', () => ({ getSetting: getSettingMock }));
jest.mock('../src/services/notification.service', () => ({ createNotification: jest.fn() }));

import { generateHrLink, submitHrDrive, validateHrLink } from '../src/controllers/hr.controller';

const response = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('generateHrLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSettingMock.mockResolvedValue('2026/2027');
    prismaMock.company.findFirst.mockResolvedValue({ id: 'company-1' });
    prismaMock.company.update.mockResolvedValue({ id: 'company-1' });
    prismaMock.placementDrive.create.mockResolvedValue({ id: 'drive-1' });
    prismaMock.hrInvitationLink.create.mockResolvedValue({ id: 'invite-1' });
    prismaMock.driveAuditLog.create.mockResolvedValue({ id: 'audit-1' });
  });

  it('assigns the current academic year to an HR-created drive', async () => {
    const req: any = {
      body: {
        companyName: 'Example Company',
        hrEmail: 'hr@example.com',
        hrName: 'HR Manager',
        driveTitle: 'Graduate Hiring',
      },
    };
    const res = response();

    await generateHrLink(req, res);

    expect(prismaMock.placementDrive.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ academicYear: '2026/2027' }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updates invitation details when the company already exists', async () => {
    const res = response();

    await generateHrLink({
      body: {
        companyName: 'Existing Company',
        hrEmail: 'new.hr@example.com',
        hrName: 'New HR Contact',
        driveTitle: 'Campus Hiring 2027',
      },
    } as any, res);

    expect(prismaMock.company.update).toHaveBeenCalledWith({
      where: { id: 'company-1' },
      data: {
        name: 'Existing Company',
        hrEmail: 'new.hr@example.com',
        hrName: 'New HR Contact',
      },
    });
    expect(prismaMock.placementDrive.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: 'company-1',
          driveTitle: 'Campus Hiring 2027',
        }),
      })
    );
  });

  it('atomically persists the final HR form snapshot before review', async () => {
    const tx = {
      placementDrive: {
        update: jest.fn().mockResolvedValue({ id: 'drive-1' }),
        findUnique: jest.fn().mockResolvedValue({ companyId: 'company-1' }),
      },
      company: { update: jest.fn().mockResolvedValue({ id: 'company-1' }) },
      selectionRound: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      hrInvitationLink: { update: jest.fn().mockResolvedValue({ id: 'invite-1' }) },
      driveAuditLog: { create: jest.fn().mockResolvedValue({ id: 'audit-1' }) },
    };
    (prismaMock.hrInvitationLink as any).findUnique = jest.fn().mockResolvedValue({
      driveId: 'drive-1',
      isUsed: false,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(tx));
    const res = response();

    await submitHrDrive({
      body: {
        token: 'a'.repeat(64),
        driveData: {
          jobRole: 'Engineer',
          jobDescription: 'Build reliable products',
          registrationStart: '2026-11-01',
          registrationEnd: '2026-11-15',
          fixedSalary: '12.5',
        },
        companyData: { name: 'Example Company', description: 'Company description' },
        selectionRounds: [{ roundNumber: 1, title: 'Technical interview' }],
      },
    } as any, res);

    expect(tx.placementDrive.update).toHaveBeenCalledWith({
      where: { id: 'drive-1' },
      data: expect.objectContaining({
        jobRole: 'Engineer',
        jobDescription: 'Build reliable products',
        registrationStart: new Date('2026-11-01'),
        registrationEnd: new Date('2026-11-15'),
        fixedSalary: 12.5,
        status: 'ADMIN_REVIEW',
      }),
    });
    expect(tx.company.update).toHaveBeenCalledWith({
      where: { id: 'company-1' },
      data: expect.objectContaining({ description: 'Company description' }),
    });
    expect(tx.selectionRound.createMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns a useful validation error instead of starting a transaction for an invalid date', async () => {
    (prismaMock.hrInvitationLink as any).findUnique = jest.fn().mockResolvedValue({
      driveId: 'drive-1',
      isUsed: false,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    const res = response();

    await submitHrDrive({
      body: {
        token: 'b'.repeat(64),
        driveData: { registrationEnd: 'not-a-date' },
        companyData: null,
        selectionRounds: [],
      },
    } as any, res);

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'registrationEnd must be a valid date',
    });
  });
});

describe('validateHrLink', () => {
  beforeEach(() => jest.clearAllMocks());

  it('keeps an invitation valid past its legacy expiry while the drive remains open', async () => {
    prismaMock.hrInvitationLink.findUnique.mockResolvedValue({
      driveId: 'drive-1',
      hrEmail: 'hr@example.com',
      isUsed: false,
      revokedAt: null,
      expiresAt: new Date('2020-01-01'),
    });
    prismaMock.placementDrive.findUnique.mockResolvedValue({
      id: 'drive-1',
      status: 'PUBLISHED',
      company: {},
      selectionRounds: [],
    });
    const res = response();

    await validateHrLink({ body: { token: 'c'.repeat(64) } } as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects an invitation after the drive is completed', async () => {
    prismaMock.hrInvitationLink.findUnique.mockResolvedValue({
      driveId: 'drive-1',
      hrEmail: 'hr@example.com',
      isUsed: true,
      revokedAt: null,
      expiresAt: new Date('9999-12-31'),
    });
    prismaMock.placementDrive.findUnique.mockResolvedValue({
      id: 'drive-1',
      status: 'COMPLETED',
      company: {},
      selectionRounds: [],
    });
    const res = response();

    await validateHrLink({ body: { token: 'd'.repeat(64) } } as any, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'This placement drive is closed.' });
  });
});
