import express from 'express';
import request from 'supertest';
import publicRoutes from '../../routes/public.routes';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    placementDrive: {
      count: jest.fn().mockResolvedValue(100),
      findMany: jest.fn().mockResolvedValue([{ fixedSalary: 1200000 }, { fixedSalary: 1400000 }]),
    },
    company: {
      count: jest.fn().mockResolvedValue(50),
    },
    studentProfile: {
      count: jest.fn().mockResolvedValue(1000),
      aggregate: jest.fn().mockResolvedValue({
        _avg: { cgpa: 8.5 },
      }),
    },
    driveApplication: {
      count: jest.fn().mockResolvedValue(200),
      groupBy: jest.fn().mockResolvedValue([
        { studentId: 'test-student-1', _count: true },
        { studentId: 'test-student-2', _count: true }
      ]),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Public Controller Integration Tests', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/public', publicRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/public/stats should return placement stats', async () => {
    const res = await request(app).get('/api/public/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('companies');
    expect(res.body).toHaveProperty('placementRate');
    expect(res.body).toHaveProperty('avgPackageLPA');
  });
});
