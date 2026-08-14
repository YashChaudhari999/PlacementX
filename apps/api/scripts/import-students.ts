import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Configuration
const BATCH_SIZE = 200;
const BASE_DATA_DIR = path.join(__dirname, '../../../Student_data');

// Mappings for Excel columns to DB fields
const COLUMN_MAPPINGS: Record<string, string> = {
  'Student ID': 'studentId',
  'PRN': 'studentId',
  'Enrollment Number': 'studentId',
  'Enrollment_No': 'studentId',
  'Roll Number': 'studentId',
  'Student Name': 'fullName',
  'Name': 'fullName',
  'Full Name': 'fullName',
  'Student_Name': 'fullName',
  'Email': 'email',
  'Branch': 'branch', // Not used directly, determined via filename
  'Gender': 'gender',
  'CGPA': 'cgpa',
  'Active Backlogs': 'activeBacklogs',
  'Profile Complete': 'profileComplete',
  'Skills': 'skills',
  'Academic Year': 'academicYearExcel', // Not used directly, determined via folder
  'Drive ID': 'driveId',
  'Placement Season': 'placementSeason',
  'Application Status': 'applicationStatus',
  'Company ID': 'companyId',
  'Company Name': 'companyName',
  'Industry': 'industry',
  'Fixed Salary (LPA)': 'fixedSalaryLpa',
  'Placement Status': 'placementStatus'
};

function normalizeColumnName(col: string): string | null {
  const trimmedCol = col.trim();
  return COLUMN_MAPPINGS[trimmedCol] || null;
}

function normalizeDepartment(filename: string): string {
  const lowerName = filename.toLowerCase();
  if (lowerName.includes('aiml') || lowerName.includes('ai&ml') || lowerName.includes('artificial_intelligence_and_machine_learning') || lowerName.includes('artificial intelligence and machine learning')) {
    return 'Artificial Intelligence and Machine Learning';
  }
  if (lowerName.includes('computer_engineering') || lowerName.includes('computer engineering')) {
    return 'Computer Engineering';
  }
  if (lowerName.includes('computer_science') || lowerName.includes('computer science')) {
    return 'Computer Science';
  }
  if (lowerName.includes('information_technology') || lowerName.includes('information technology')) {
    return 'Information Technology';
  }
  return 'Unknown Department';
}

function normalizeStudentStatus(filename: string): string {
  const lowerName = filename.toLowerCase();
  if (lowerName.includes('alumni')) {
    return 'Alumni';
  }
  return 'Regular';
}

interface ImportReport {
  year: string;
  department: string;
  read: number;
  inserted: number;
  duplicates: number;
  errors: number;
}

const reports: ImportReport[] = [];

async function processFile(filePath: string, yearFolder: string) {
  const academicYear = yearFolder.toLowerCase() === 'previous' ? '2025/2026' : '2026/2027';
  const filename = path.basename(filePath);
  const department = normalizeDepartment(filename);
  const studentStatus = normalizeStudentStatus(filename);

  console.log(`Processing ${filename}...`);
  let report = reports.find(r => r.year === academicYear && r.department === department);
  if (!report) {
    report = { year: academicYear, department, read: 0, inserted: 0, duplicates: 0, errors: 0 };
    reports.push(report);
  }

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // raw records as json array of objects
  const rawRecords = xlsx.utils.sheet_to_json(worksheet, { defval: null });

  report.read += rawRecords.length;

  const recordsToInsert = [];

  for (const [index, row] of rawRecords.entries()) {
    const record: any = {};
    for (const [key, value] of Object.entries(row as any)) {
      const normalizedKey = normalizeColumnName(key);
      if (normalizedKey) {
        if (typeof value === 'string' && value.trim() === '') {
          record[normalizedKey] = null;
        } else {
          record[normalizedKey] = value;
        }
      }
    }

    // Required fields: email or fullName+department+academicYear
    let studentId = record.studentId ? String(record.studentId).trim() : null;
    let fullName = record.fullName ? String(record.fullName).trim() : null;
    let email = record.email ? String(record.email).trim() : null;

    if (!studentId) {
      if (email) {
        studentId = `FALLBACK_${email}`;
      } else if (fullName) {
        studentId = `FALLBACK_${fullName}_${department}_${academicYear}`.replace(/\s+/g, '_');
      } else {
        console.error(`Row ${index + 2} in ${filename} missing student identifier.`);
        report.errors++;
        continue;
      }
    }

    // Clean numbers
    let cgpa = record.cgpa !== null ? parseFloat(record.cgpa) : null;
    if (isNaN(cgpa!)) cgpa = null;
    
    let activeBacklogs = record.activeBacklogs !== null ? parseInt(record.activeBacklogs) : null;
    if (isNaN(activeBacklogs!)) activeBacklogs = null;

    let fixedSalaryLpa = record.fixedSalaryLpa !== null ? parseFloat(record.fixedSalaryLpa) : null;
    if (isNaN(fixedSalaryLpa!)) fixedSalaryLpa = null;

    recordsToInsert.push({
      studentId,
      fullName,
      email,
      department,
      academicYear,
      studentStatus,
      gender: record.gender ? String(record.gender).trim() : null,
      cgpa,
      activeBacklogs,
      profileComplete: record.profileComplete ? String(record.profileComplete).trim() : null,
      skills: record.skills ? String(record.skills).trim() : null,
      driveId: record.driveId ? String(record.driveId).trim() : null,
      placementSeason: record.placementSeason ? String(record.placementSeason).trim() : null,
      applicationStatus: record.applicationStatus ? String(record.applicationStatus).trim() : null,
      companyId: record.companyId ? String(record.companyId).trim() : null,
      companyName: record.companyName ? String(record.companyName).trim() : null,
      industry: record.industry ? String(record.industry).trim() : null,
      fixedSalaryLpa,
      placementStatus: record.placementStatus ? String(record.placementStatus).trim() : null,
      sourceFile: filename,
      sourceFolder: yearFolder
    });
  }

  // Batch Upsert
  for (let i = 0; i < recordsToInsert.length; i += BATCH_SIZE) {
    const batch = recordsToInsert.slice(i, i + BATCH_SIZE);
    
    const upserts = batch.map(data => {
      return prisma.importedStudent.upsert({
        where: {
          studentId_academicYear: {
            studentId: data.studentId,
            academicYear: data.academicYear
          }
        },
        update: data,
        create: data,
      });
    });

    try {
      await prisma.$transaction(upserts);
      report.inserted += batch.length;
    } catch (err: any) {
      console.error(`Failed to insert batch in ${filename}:`, err.message);
      report.errors += batch.length;
    }
  }
}

async function main() {
  const years = ['Current', 'previous'];
  
  for (const year of years) {
    const folderPath = path.join(BASE_DATA_DIR, year);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        if (file.endsWith('.xlsx') && !file.startsWith('~$')) {
          await processFile(path.join(folderPath, file), year);
        }
      }
    } else {
      console.warn(`Folder not found: ${folderPath}`);
    }
  }

  // Print Summary
  console.log('\n========================================');
  console.log('STUDENT DATA IMPORT SUMMARY');
  console.log('========================================');

  const yearsReported = ['2025/2026', '2026/2027'];
  let totalRead = 0;
  let totalInserted = 0;
  let totalErrors = 0;

  for (const yr of yearsReported) {
    console.log(`\nAcademic Year: ${yr}`);
    const yrReports = reports.filter(r => r.year === yr);
    console.log(`Files Processed: ${yrReports.length}\n`);

    for (const r of yrReports) {
      console.log(`${r.department}`);
      console.log(`Records Read: ${r.read}`);
      console.log(`Inserted/Updated: ${r.inserted}`);
      console.log(`Errors: ${r.errors}\n`);

      totalRead += r.read;
      totalInserted += r.inserted;
      totalErrors += r.errors;
    }
    console.log('----------------------------------------');
  }

  console.log('========================================');
  console.log('TOTAL');
  console.log('========================================');
  console.log(`Rows Read: ${totalRead}`);
  console.log(`Inserted/Updated: ${totalInserted}`);
  console.log(`Errors: ${totalErrors}`);
  console.log('========================================');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
