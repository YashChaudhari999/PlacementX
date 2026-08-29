import React, { useState, useRef } from 'react';
import { CloudUploadIcon, Tick02Icon, CancelCircleIcon, Download01Icon, Note01Icon, Alert01Icon, Alert02Icon } from 'hugeicons-react';
import { CSVParserService } from '@/lib/csvParserService';
import type { CSVValidationError } from '@/lib/csvParserService';
import type { CSVStudentRow } from '@/lib/firebase/models';
import { StudentImportService } from '../services/studentImportService';
import type { ImportResult } from '../services/studentImportService';
import { auth } from '@/lib/firebase/config/firebaseApp';
import { toast } from 'react-hot-toast';

export default function AdminStudentImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVStudentRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<CSVValidationError[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0] || null;
      setFile(selectedFile);
      setParsedData([]);
      setValidationErrors([]);
      setImportResult(null);
      if (selectedFile) await parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    setIsParsing(true);
    try {
      const { data, errors } = await CSVParserService.parse(file);
      setParsedData(data);
      setValidationErrors(errors);
    } catch (error: any) {
      toast.error(`Parsing failed: ${error.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error('No valid data to import');
      return;
    }

    if (validationErrors.length > 0) {
      if (
        !confirm(
          `You have ${validationErrors.length} rows with errors. Do you want to proceed importing only the valid rows?`
        )
      ) {
        return;
      }
    }

    const adminUser = auth.currentUser;
    if (!adminUser) {
      toast.error('You must be logged in as Admin to perform this action.');
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setStatusText('Initializing import...');

    try {
      const result = await StudentImportService.importStudents(
        parsedData,
        adminUser.uid,
        (p, status) => {
          setProgress(p);
          setStatusText(status);
        }
      );
      setImportResult(result);
      if (result.failed === 0 && result.skipped === 0) {
        toast.success(`Successfully imported ${result.imported} students!`);
      } else {
        toast.success(
          `Import finished. Success: ${result.imported}, Failed: ${result.failed}, Skipped: ${result.skipped}`
        );
      }
    } catch (error: any) {
      toast.error(`Import error: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadReport = () => {
    if (importResult) {
      StudentImportService.downloadReport(
        importResult.reportData,
        `Student_Import_Report_${new Date().getTime()}.xlsx`
      );
    }
  };

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    const headers = [
      'Roll Number',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Gender',
      'Branch',
      'Password',
    ];
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Student_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Admin Student Import
      </h1>

      {/* Upload Zone */}
      {!file && !importResult && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <CloudUploadIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Upload CSV File
          </h2>
          <p className="text-gray-500 mb-6">
            Drag and drop your student records CSV, or click to browse.
          </p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Select CSV File
          </button>

          <div className="mt-8 text-sm text-gray-500 mb-6">
            Ensure your CSV matches the exact template format.{' '}
            <a href="#" onClick={handleDownloadTemplate} className="text-blue-500 hover:underline">
              Download01Icon Template
            </a>
          </div>

          <div className="mt-4 text-sm text-gray-500 text-left bg-gray-50 dark:bg-gray-900/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700 inline-block w-full max-w-3xl">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Note01Icon className="w-4 h-4" /> Expected CSV Columns (in order):
            </h3>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                Roll Number*
              </span>
              <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                First Name*
              </span>
              <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                Last Name*
              </span>
              <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                Email*
              </span>
              <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                Phone*
              </span>
              <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                Gender*
              </span>
              <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                Branch*
              </span>
              <span
                className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-gray-400 border-dashed"
                title="Default is Phone if empty"
              >
                Password
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              * Required fields. Password will default to Phone if left empty.
            </p>
          </div>
        </div>
      )}

      {/* Parsing & Validation State */}
      {file && !importResult && !isImporting && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Note01Icon className="text-blue-500" />
              {file.name}
            </h2>
            <button onClick={reset} className="text-gray-500 hover:text-gray-700 cursor-pointer">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Valid Records
                </div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {parsedData.length}
                </div>
              </div>
              <Tick02Icon className="h-10 w-10 text-green-500 opacity-50" />
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Validation Errors
                </div>
                <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                  {validationErrors.length}
                </div>
              </div>
              <CancelCircleIcon className="h-10 w-10 text-red-500 opacity-50" />
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-600">
                <Alert02Icon className="h-5 w-5" /> Validation Errors Preview
              </h3>
              <div className="max-h-60 overflow-y-auto bg-red-50/50 dark:bg-red-900/10 border border-red-100 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-red-100 dark:bg-red-900/50">
                    <tr>
                      <th className="py-2 px-4 text-left font-medium text-red-800 dark:text-red-300 w-24">
                        Row
                      </th>
                      <th className="py-2 px-4 text-left font-medium text-red-800 dark:text-red-300">
                        Errors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-200 dark:divide-red-800/30">
                    {validationErrors.slice(0, 50).map((err, i) => (
                      <tr key={i}>
                        <td className="py-2 px-4 font-mono text-gray-600 dark:text-gray-400">
                          {err.row}
                        </td>
                        <td className="py-2 px-4 text-red-600 dark:text-red-400">
                          {Object.entries(err.errors).map(([field, msg]) => (
                            <div key={field}>
                              <span className="font-semibold">{field}:</span> {msg}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validationErrors.length > 50 && (
                  <div className="p-3 text-center text-red-500 text-sm italic border-t border-red-100">
                    Showing first 50 errors...
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={handleImport}
              disabled={parsedData.length === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              Start Import ({parsedData.length} Records)
            </button>
          </div>
        </div>
      )}

      {/* Importing Progress State */}
      {isImporting && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
            Importing Students...
          </h2>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>{progress}%</span>
            <span>{statusText}</span>
          </div>

          <div className="mt-8 flex justify-center text-amber-500 text-sm items-center gap-2">
            <Alert01Icon className="h-4 w-4" /> Please do not close this tab during the import.
          </div>
        </div>
      )}

      {/* Results State */}
      {importResult && !isImporting && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Tick02Icon className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Import Completed
            </h2>
            <p className="text-gray-500 mt-2">The batch import process has finished.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center">
              <div className="text-sm text-gray-500">Total Processed</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {importResult.total}
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <div className="text-sm text-green-600">Successfully Imported</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {importResult.imported}
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
              <div className="text-sm text-red-600">Failed Records</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {importResult.failed}
              </div>
            </div>
          </div>

          {importResult.summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-100">
                <div className="text-xs text-blue-600">Firebase Created</div>
                <div className="text-xl font-bold text-blue-700">
                  {importResult.summary.firebaseAccountsCreated}
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-100">
                <div className="text-xs text-blue-600">Firebase Existing</div>
                <div className="text-xl font-bold text-blue-700">
                  {importResult.summary.firebaseAccountsExisting}
                </div>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center border border-indigo-100">
                <div className="text-xs text-indigo-600">RTDB Processed</div>
                <div className="text-xl font-bold text-indigo-700">
                  {importResult.summary.rtdbRecordsProcessed}
                </div>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center border border-emerald-100">
                <div className="text-xs text-emerald-600">Supabase Created</div>
                <div className="text-xl font-bold text-emerald-700">
                  {importResult.summary.supabaseRecordsCreated}
                </div>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center border border-emerald-100">
                <div className="text-xs text-emerald-600">Supabase Updated</div>
                <div className="text-xl font-bold text-emerald-700">
                  {importResult.summary.supabaseRecordsUpdated}
                </div>
              </div>
            </div>
          )}

          {importResult.errors.length > 0 && (
            <div className="mb-8 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="font-semibold mb-2">Some errors occurred during insertion:</p>
              <ul className="list-disc pl-5 space-y-1">
                {importResult.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
              {importResult.errors.length > 10 && (
                <p className="mt-2 italic">And {importResult.errors.length - 10} more...</p>
              )}
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={reset}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors cursor-pointer"
            >
              Import Another File
            </button>
            <button
              onClick={downloadReport}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download01Icon className="h-4 w-4" />
              Download01Icon Report (Passwords Included)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
