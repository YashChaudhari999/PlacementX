import Papa from 'papaparse';
import { z } from 'zod';
import type { CSVStudentRow } from './firebase/models';

export const csvStudentSchema = z.object({
  'Roll Number': z.string().min(1, 'Roll Number is required'),
  'First Name': z.string().min(1, 'First Name is required'),
  'Last Name': z.string().min(1, 'Last Name is required'),
  Email: z.string().email('Invalid email address'),
  Phone: z.string().min(10, 'Phone number is invalid'),
  Gender: z.string().min(1, 'Gender is required'),
  Branch: z.string().min(1, 'Branch is required'),
  Password: z.string().optional().or(z.literal('')),
});

export type CSVValidationError = {
  row: number;
  errors: Record<string, string>;
};

export class CSVParserService {
  static async parse(file: File): Promise<{
    data: CSVStudentRow[];
    errors: CSVValidationError[];
  }> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const validData: CSVStudentRow[] = [];
          const validationErrors: CSVValidationError[] = [];

          results.data.forEach((row: any, index: number) => {
            const result = csvStudentSchema.safeParse(row);
            if (result.success) {
              validData.push(result.data as unknown as CSVStudentRow);
            } else {
              const fieldErrors: Record<string, string> = {};
              result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                fieldErrors[path] = issue.message;
              });
              validationErrors.push({
                row: index + 2, // +2 because index is 0-based and header is line 1
                errors: fieldErrors,
              });
            }
          });

          resolve({ data: validData, errors: validationErrors });
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }
}
