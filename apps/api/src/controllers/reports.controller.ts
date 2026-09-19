import prisma from '../utils/prisma';
import { Request, Response } from 'express';
import { getReportKPIs as fetchReportKPIs, getReportData } from '../services/reports/reports.service';
import { queueReportGeneration } from '../services/reports/report-queue.service';
import { supabaseAdmin } from '../config/supabase';

const REPORTS_BUCKET = process.env.SUPABASE_REPORTS_BUCKET || 'generated-reports';


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
    const user = req.user;
    const history = await prisma.reportExportHistory.findMany({
      where: user?.role === 'SUPER_ADMIN' ? {} : { generatedBy: user?.id },
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
    const user = req.user;
    const history = await prisma.reportExportHistory.findFirst({
      where: {
        id,
        ...(user?.role === 'SUPER_ADMIN' ? {} : { generatedBy: user?.id }),
      },
    });
    
    if (
      !history ||
      history.status !== 'COMPLETED' ||
      !history.fileUrl ||
      (history.expiresAt && history.expiresAt <= new Date())
    ) {
      return res.status(404).json({ success: false, message: 'Report not found or not ready' });
    }

    const { data, error } = await supabaseAdmin.storage
      .from(REPORTS_BUCKET)
      .download(history.fileUrl);
    if (error || !data) {
      return res.status(404).json({ success: false, message: 'File has expired or was removed' });
    }

    const filename = `${history.reportName.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.${history.format.toLowerCase()}`;
    const buffer = Buffer.from(await data.arrayBuffer());
    res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/[^a-zA-Z0-9_.-]/g, '_')}"`);
    res.setHeader('Content-Type', data.type || 'application/octet-stream');
    return res.send(buffer);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to download report' });
  }
};
