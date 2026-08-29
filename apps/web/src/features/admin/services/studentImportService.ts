import * as XLSX from 'xlsx';

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

  static downloadReport(data: any[], filename = 'Import_Report.xlsx') {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, filename);
  }
}
