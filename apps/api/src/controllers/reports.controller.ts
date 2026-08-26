import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getReportKPIs as fetchReportKPIs, getReportData } from '../services/reports/reports.service';
import { queueReportGeneration } from '../services/reports/report-queue.service';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

export const getReportsKPIs = async (req: Request, res: Response) => {
  try {
    const kpis = await fetchReportKPIs();
    return res.status(200).json({ success: true, data: kpis });
  } catch (error: any) {
    console.error('Error fetching report KPIs:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch KPIs' });
  }
};

export const getReportTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await prisma.reportTemplate.findMany({
      orderBy: { isFavorite: 'desc' },
    });
    return res.status(200).json({ success: true, data: templates });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
};

export const previewReport = async (req: Request, res: Response) => {
  try {
    const { reportType, filters, page = 1, pageSize = 50 } = req.body;
    const previewData = await getReportData(reportType, filters, page, pageSize, true);
    return res.status(200).json({ success: true, data: previewData });
  } catch (error: any) {
    console.error('Error generating preview:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate preview' });
  }
};

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { reportType, filters, format } = req.body;
    const userId = (req as any).user?.id || 'System';
    
    // Create history record
    const history = await prisma.reportExportHistory.create({
      data: {
        reportName: reportType.replace(/_/g, ' '),
        category: 'GENERATED',
        format,
        filters,
        generatedBy: userId,
        status: 'PENDING'
      }
    });

    // Queue for background generation
    await queueReportGeneration(history.id, { reportType, filters, format });

    return res.status(200).json({ 
      success: true, 
      message: 'Report generation started',
      data: { historyId: history.id }
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return res.status(500).json({ success: false, message: 'Failed to queue report' });
  }
};

export const getExportHistory = async (req: Request, res: Response) => {
  try {
    const history = await prisma.reportExportHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return res.status(200).json({ success: true, data: history });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
};

export const downloadReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = await prisma.reportExportHistory.findUnique({ where: { id } });
    
    if (!history || history.status !== 'COMPLETED' || !history.fileUrl) {
      return res.status(404).json({ success: false, message: 'Report not found or not ready' });
    }

    const filename = `report_${id}.${history.format.toLowerCase()}`;
    const filePath = path.join(process.cwd(), 'uploads', 'reports', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File has expired or was removed' });
    }

    res.download(filePath, `${history.reportName.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.${history.format.toLowerCase()}`);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to download report' });
  }
};
