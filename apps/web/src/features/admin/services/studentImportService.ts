import ExcelJS from 'exceljs';

export type ImportResult = {
 success: boolean;
 total: number;
 imported: number;
 skipped: number;
 failed: number;
 errors: string[];
 reportData: any[];
 summary?: any;
};

export class StudentImportService {
 static async importStudents(
 students: any[],
 adminUid: string,
 onProgress: (progress: number, status: string) => void
 ): Promise<ImportResult> {
 const result: ImportResult = {
 success: true,
 total: students.length,
 imported: 0,
 skipped: 0,
 failed: 0,
 errors: [],
 reportData: [],
 };

 try {
 console.log(
 '[StudentImport] Starting import of',
 students.length,
 'students via Backend API'
 );
 onProgress(10, 'Validating and sending to backend...');

 // Send to backend API
 const response = await fetch('http://localhost:5000/api/admin/students/import', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(students),
 });

 onProgress(50, 'Processing students on backend...');

 if (!response.ok) {
 throw new Error(`API error: ${response.statusText}`);
 }

 const data = await response.json();

 onProgress(90, 'Finalizing report...');

 result.reportData = data.results || [];
 result.summary = data.summary || {};

 // Compute counts from API summary
 if (data.summary) {
 result.failed = data.summary.failedRecords;
 result.imported = students.length - result.failed;
 }

 onProgress(100, 'Import completed!');
 return result;
 } catch (error: any) {
 console.error('[StudentImport] Error communicating with backend API:', error);
 result.success = false;
 result.failed = students.length;
 result.errors.push(error.message);
 return result;
 }
 }

 static async downloadReport(data: any[], filename = 'Import_Report.xlsx') {
 const workbook = new ExcelJS.Workbook();
 const worksheet = workbook.addWorksheet('Report');
 const headers = data.length > 0 ? Object.keys(data[0]) : [];
 worksheet.columns = headers.map((header) => ({ header, key: header, width: 20 }));
 worksheet.addRows(data);
 const buffer = await workbook.xlsx.writeBuffer();
 const blob = new Blob([buffer as BlobPart], {
 type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = filename;
 link.click();
 URL.revokeObjectURL(url);
 }
}
