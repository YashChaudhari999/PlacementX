import prisma from '../../utils/prisma';
import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient, isRedisConnected } from '../../config/redis';
import { getReportData } from './reports.service';
import { generateExcel, generateCSV, generatePDF } from './export.service';
import { supabaseAdmin } from '../../config/supabase';


const REPORT_QUEUE_NAME = 'report-generation';
let reportQueue: Queue | null = null;
let reportWorker: Worker | null = null;
const REPORTS_BUCKET = process.env.SUPABASE_REPORTS_BUCKET || 'generated-reports';

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

  reportWorker = new Worker(REPORT_QUEUE_NAME, async (job: Job) => {
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

    const filename = `report_${historyId}.${format.toLowerCase()}`;
    const objectPath = `reports/${historyId}/${filename}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(REPORTS_BUCKET)
      .upload(objectPath, buffer, {
        contentType: format === 'PDF'
          ? 'application/pdf'
          : format === 'CSV'
            ? 'text/csv'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true,
      });
    if (uploadError) throw new Error(`Report storage upload failed: ${uploadError.message}`);

    await prisma.reportExportHistory.update({
      where: { id: historyId },
      data: {
        status: 'COMPLETED',
        fileUrl: objectPath,
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
    throw error;
  }
};

export const closeReportQueue = async () => {
  await Promise.all([reportWorker?.close(), reportQueue?.close()]);
  reportWorker = null;
  reportQueue = null;
};
