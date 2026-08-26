import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient, isRedisConnected } from '../../config/redis';
import { PrismaClient } from '@prisma/client';
import { getReportData } from './reports.service';
import { generateExcel, generateCSV, generatePDF } from './export.service';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const REPORT_QUEUE_NAME = 'report-generation';
let reportQueue: Queue | null = null;

export const initReportQueue = () => {
  const redis = getRedisClient();
  if (!redis) {
    console.warn('⚠️ Redis not available. Report generation will be synchronous.');
    return;
  }

  reportQueue = new Queue(REPORT_QUEUE_NAME, {
    connection: redis,
    defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
  });
  console.log('✅ Report queue initialized.');
};

export const initReportWorker = () => {
  const redis = getRedisClient();
  if (!redis) return;

  new Worker(REPORT_QUEUE_NAME, async (job: Job) => {
    await processReportJob(job.data);
  }, { connection: redis, concurrency: 2 });
  
  console.log('✅ Report worker started.');
};

export const queueReportGeneration = async (historyId: string, payload: any) => {
  if (reportQueue && isRedisConnected()) {
    await reportQueue.add('generate', { historyId, ...payload });
  } else {
    // Process synchronously if no redis
    await processReportJob({ historyId, ...payload });
  }
};

const processReportJob = async (data: { historyId: string, reportType: string, filters: any, format: string }) => {
  const { historyId, reportType, filters, format } = data;
  
  try {
    await prisma.reportExportHistory.update({
      where: { id: historyId },
      data: { status: 'PROCESSING' }
    });

    const reportData = await getReportData(reportType, filters, 1, 100000, false); // Get all
    let buffer: Buffer;

    const reportName = reportType.replace(/_/g, ' ');

    if (format === 'PDF') {
      buffer = await generatePDF(reportData.data, reportName, filters);
    } else if (format === 'CSV') {
      buffer = await generateCSV(reportData.data);
    } else {
      buffer = await generateExcel(reportData.data, reportName);
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `report_${historyId}.${format.toLowerCase()}`;
    const filePath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filePath, buffer);

    await prisma.reportExportHistory.update({
      where: { id: historyId },
      data: {
        status: 'COMPLETED',
        fileUrl: `/api/admin/reports/download/${historyId}`,
        recordCount: reportData.count,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
      }
    });

  } catch (error: any) {
    console.error('Report generation failed:', error);
    await prisma.reportExportHistory.update({
      where: { id: historyId },
      data: { status: 'FAILED', errorDetails: error.message || 'Unknown error' }
    });
  }
};
