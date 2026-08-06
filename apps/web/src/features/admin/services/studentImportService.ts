import { ref, update, push, get } from 'firebase/database';
import { database } from '@/lib/firebase/config/firebaseApp';
import * as XLSX from 'xlsx';

export type ImportResult = {
  success: boolean;
  total: number;
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
  reportData: any[];
};

export class StudentImportService {

  static async importStudents(
    students: any[],
    adminUid: string,
    onProgress: (progress: number, status: string) => void
  ): Promise<ImportResult> {
    const batchId = crypto.randomUUID();
    const result: ImportResult = {
      success: true,
      total: students.length,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [],
      reportData: []
    };

    console.log('[StudentImport] Starting import of', students.length, 'students');
    console.log('[StudentImport] First row sample:', JSON.stringify(students[0]));

    onProgress(5, "Starting import...");

    // Build one big update object for all students at once
    const updates: Record<string, any> = {};
    let processed = 0;

    for (const row of students) {
      try {
        // Validate minimum required fields
        const rollNumber = row["Roll Number"] || '';
        const firstName = row["First Name"] || '';
        const lastName = row["Last Name"] || '';
        const email = row["Email"] || '';
        const phone = row["Phone"] || '';
        const gender = row["Gender"] || '';
        const branch = row["Branch"] || '';
        const password = row["Password"] || phone;

        if (!firstName && !lastName && !email) {
          console.log('[StudentImport] Skipping empty row:', row);
          result.skipped++;
          processed++;
          continue;
        }

        if (!email) {
          result.failed++;
          result.errors.push(`Row ${processed + 1}: Missing email`);
          processed++;
          continue;
        }

        // Generate a unique ID for this student
        const newRef = push(ref(database, 'students'));
        const studentId = newRef.key as string;

        console.log('[StudentImport] Creating student:', studentId, email);

        const studentRecord = {
          id: studentId,
          role: "student",
          accountStatus: "active",
          studentRollNumber: rollNumber,
          emailVerified: false,
          personalInfo: {
            firstName: firstName,
            lastName: lastName,
            gender: gender,
            dob: ""
          },
          academicInfo: {
            departmentId: branch,
            branchId: branch,
            cgpa: 0,
            batch: new Date().getFullYear(),
            semester: 1
          },
          eligibility: {
            isEligible: true,
            activeBacklogs: 0,
            totalBacklogs: 0
          },
          contactDetails: {
            email: email,
            phone: phone,
            linkedin: "",
            github: ""
          },
          profileCompletion: 30,
          resumeVersion: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          importedBy: adminUid,
          importBatchId: batchId,
          lastLogin: null
        };

        updates[`students/${studentId}`] = studentRecord;
        result.imported++;
        result.reportData.push({ ...row, Status: 'Success', Password: password });

      } catch (error: any) {
        console.error('[StudentImport] Error processing row:', error);
        result.failed++;
        result.errors.push(`Row ${processed + 1}: ${error.message}`);
        result.reportData.push({ ...row, Status: `Failed: ${error.message}`, Password: '' });
      }

      processed++;
      onProgress(Math.floor(10 + (processed / students.length) * 80), `Processing: ${processed}/${students.length}`);
    }

    // Write all students to Firebase in one batch
    if (Object.keys(updates).length > 0) {
      onProgress(92, "Writing to database...");
      console.log('[StudentImport] Writing', Object.keys(updates).length, 'records to Firebase...');
      
      try {
        await update(ref(database), updates);
        console.log('[StudentImport] Successfully wrote to Firebase!');
      } catch (writeError: any) {
        console.error('[StudentImport] Firebase write failed:', writeError);
        // If batch write fails, try one by one
        console.log('[StudentImport] Trying individual writes...');
        for (const [path, data] of Object.entries(updates)) {
          try {
            await update(ref(database), { [path]: data });
          } catch (individualError: any) {
            console.error('[StudentImport] Individual write failed for', path, individualError);
            result.failed++;
            result.imported--;
          }
        }
      }
    }

    // Log activity
    try {
      const logRef = push(ref(database, 'activityLogs'));
      const logId = logRef.key as string;
      await update(ref(database), {
        [`activityLogs/${logId}`]: {
          id: logId,
          actorId: adminUid,
          actorType: "admin",
          action: "student_import",
          metadata: {
            batchId,
            imported: result.imported,
            failed: result.failed,
            skipped: result.skipped
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (e) {
      console.error("[StudentImport] Failed to log activity", e);
    }

    onProgress(100, "Import completed!");
    console.log('[StudentImport] Final result:', JSON.stringify(result, null, 2));
    return result;
  }

  static downloadReport(data: any[], filename = "Import_Report.xlsx") {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, filename);
  }
}
