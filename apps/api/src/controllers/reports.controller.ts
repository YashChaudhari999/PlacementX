import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';

const prisma = new PrismaClient();

export const exportReportExcel = async (req: Request, res: Response) => {
  try {
    // Support filters from query params
    const where: Record<string, unknown> = {};
    if (req.query.academicYear && req.query.academicYear !== 'All Years') {
      where.academicYear = req.query.academicYear;
    }
    if (req.query.department && req.query.department !== 'All Departments') {
      where.department = req.query.department;
    }
    if (req.query.placementStatus) {
      where.placementStatus = req.query.placementStatus;
    }

    const students = await prisma.importedStudent.findMany({
      where,
      select: {
        studentId: true,
        fullName: true,
        department: true,
        academicYear: true,
        placementStatus: true,
        companyName: true,
        fixedSalaryLpa: true,
        cgpa: true,
        applicationStatus: true,
      },
      orderBy: { department: 'asc' },
    });

    const worksheet = xlsx.utils.json_to_sheet(students);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Placement Report');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="placement_report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('Error exporting report:', error);
    return res.status(500).json({ success: false, message: 'Failed to export report' });
  }
};
