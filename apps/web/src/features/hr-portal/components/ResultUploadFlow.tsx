import { useState, useRef } from 'react';
import ExcelJS from 'exceljs';
import Papa from 'papaparse';
import { Button, Card, Badge } from '@/components/ui';
import {
 CloudUploadIcon,
 TickDouble02Icon,
 Alert02Icon,
 Loading02Icon,
 Delete01Icon,
} from 'hugeicons-react';
import api from '@/lib/api';

interface ResultUploadFlowProps {
 token: string;
 roundId: string;
 roundName: string;
 onSuccess: () => void;
 onCancel: () => void;
}

export default function ResultUploadFlow({
 token,
 roundId,
 roundName,
 onSuccess,
 onCancel,
}: ResultUploadFlowProps) {
 const [step, setStep] = useState<1 | 2>(1);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [fileName, setFileName] = useState('');

 const [previewData, setPreviewData] = useState<{ matches: any[]; missing: any[] } | null>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setFileName(file.name);
 setLoading(true);
 setError(null);

 const reader = new FileReader();
 reader.onload = async (evt) => {
 try {
 const contents = evt.target?.result;
 if (!(contents instanceof ArrayBuffer)) throw new Error('Could not read the uploaded file.');
 let jsonData: Record<string, unknown>[] = [];
 if (file.name.toLowerCase().endsWith('.csv')) {
 const parsed = Papa.parse<Record<string, unknown>>(new TextDecoder().decode(contents), {
 header: true,
 skipEmptyLines: true,
 });
 if (parsed.errors.length > 0) throw new Error(parsed.errors[0]?.message || 'Invalid CSV file.');
 jsonData = parsed.data;
 } else {
 const workbook = new ExcelJS.Workbook();
 await workbook.xlsx.load(contents);
 const worksheet = workbook.worksheets[0];
 if (!worksheet) {
 setError('No sheets found in the uploaded file.');
 setLoading(false);
 return;
 }
 const headerValues = worksheet.getRow(1).values as unknown[];
 const headers = headerValues.slice(1).map((value) => String(value ?? '').trim());
 worksheet.eachRow((row, rowNumber) => {
 if (rowNumber === 1) return;
 const values = row.values as unknown[];
 const record: Record<string, unknown> = {};
 headers.forEach((header, index) => {
 if (header) record[header] = values[index + 1] ?? '';
 });
 jsonData.push(record);
 });
 }

 // Send to backend for preview
 const response = await api.post(`/hr/workspace/${token}/results/process`, {
 roundId,
 parsedData: jsonData,
 });

 if (response.data.success) {
 setPreviewData(response.data.data);
 setStep(2);
 } else {
 setError(response.data.message);
 }
 } catch (err: any) {
 setError(err.response?.data?.message || 'Failed to parse file or communicate with server.');
 } finally {
 setLoading(false);
 }
 };
 reader.onerror = () => {
 setError('Failed to read file.');
 setLoading(false);
 };

 reader.readAsArrayBuffer(file);
 };

 const handleConfirm = async () => {
 if (!previewData || previewData.matches.length === 0) return;

 setLoading(true);
 try {
 // Optional: Ask HR if they want to update status to next phase automatically based on result
 // Here we just upload results safely
 const updateStatusMap: Record<string, string> = {
 Selected: 'FINAL_SELECTED',
 Pass: 'TEST_COMPLETED',
 Interview: 'SELECTED_FOR_INTERVIEW',
 Reject: 'REJECTED',
 Fail: 'REJECTED',
 };

 await api.post(`/hr/workspace/${token}/results/confirm`, {
 roundId,
 results: previewData.matches,
 updateStatus: updateStatusMap,
 });

 alert('Results uploaded successfully!');
 onSuccess();
 } catch (err: any) {
 setError(err.response?.data?.message || 'Failed to confirm results upload');
 } finally {
 setLoading(false);
 }
 };

 if (step === 1) {
 return (
 <div className="bg-card p-6 rounded-3xl border border-border">
 <div className="flex justify-between items-center mb-6">
 <div>
 <h3 className="text-lg font-bold text-foreground">Upload Results for {roundName}</h3>
 <p className="text-sm text-muted-foreground">Supported formats: .xlsx, .csv</p>
 </div>
 <button onClick={onCancel} className="text-muted-foreground hover:text-muted-foreground">
 <Delete01Icon className="w-5 h-5"/>
 </button>
 </div>

 {error && (
 <div className="mb-4 p-4 bg-destructive-muted text-red-700 rounded-xl flex items-start gap-3">
 <Alert02Icon className="w-5 h-5 shrink-0 mt-0.5"/>
 <p className="text-sm">{error}</p>
 </div>
 )}

 <div
 className="border-2 border-dashed border-border rounded-2xl p-12 text-center bg-muted hover:bg-muted transition-colors cursor-pointer"
 onClick={() => fileInputRef.current?.click()}
 >
 {loading ? (
 <div className="flex flex-col items-center justify-center">
 <Loading02Icon className="w-10 h-10 animate-spin text-indigo-600 mb-4"/>
 <p className="font-medium text-foreground">Processing file...</p>
 </div>
 ) : (
 <>
 <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center shadow-sm border border-border mx-auto mb-4">
 <CloudUploadIcon className="w-8 h-8 text-indigo-500"/>
 </div>
 <p className="font-bold text-foreground mb-1">Click to upload file</p>
 <p className="text-sm text-muted-foreground mb-4">
 File must contain"Email"and"Result"columns.
 </p>
 <Button size="sm"variant="outline">
 Browse Files
 </Button>
 </>
 )}
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileUpload}
 accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
 className="hidden"
 />
 </div>
 </div>
 );
 }

 return (
 <div className="bg-card p-6 rounded-3xl border border-border">
 <div className="flex justify-between items-center mb-6">
 <div>
 <h3 className="text-lg font-bold text-foreground">Preview Results: {fileName}</h3>
 <p className="text-sm text-muted-foreground">Please review before confirming upload.</p>
 </div>
 <button onClick={onCancel} className="text-muted-foreground hover:text-muted-foreground">
 <Delete01Icon className="w-5 h-5"/>
 </button>
 </div>

 {error && (
 <div className="mb-4 p-4 bg-destructive-muted text-red-700 rounded-xl flex items-start gap-3">
 <Alert02Icon className="w-5 h-5 shrink-0 mt-0.5"/>
 <p className="text-sm">{error}</p>
 </div>
 )}

 <div className="grid grid-cols-2 gap-4 mb-6">
 <Card className="p-4 bg-success-muted border-emerald-200 flex items-center gap-3">
 <TickDouble02Icon className="w-6 h-6 text-success"/>
 <div>
 <p className="text-sm text-emerald-700 font-medium">Matched Candidates</p>
 <p className="text-2xl font-bold text-emerald-800">
 {previewData?.matches.length || 0}
 </p>
 </div>
 </Card>
 <Card className="p-4 bg-warning-muted border-amber-200 flex items-center gap-3">
 <Alert02Icon className="w-6 h-6 text-warning"/>
 <div>
 <p className="text-sm text-amber-700 font-medium">Unmatched Rows</p>
 <p className="text-2xl font-bold text-amber-800">{previewData?.missing.length || 0}</p>
 </div>
 </Card>
 </div>

 <div className="max-h-64 overflow-y-auto border border-border rounded-xl mb-6">
 <table className="w-full text-left text-sm text-muted-foreground">
 <thead className="bg-muted sticky top-0">
 <tr>
 <th className="px-4 py-3 font-semibold">Candidate</th>
 <th className="px-4 py-3 font-semibold">Email</th>
 <th className="px-4 py-3 font-semibold">Score</th>
 <th className="px-4 py-3 font-semibold">Result</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {previewData?.matches.slice(0, 100).map((match, idx) => (
 <tr key={idx}>
 <td className="px-4 py-3 font-medium text-foreground">{match.studentName}</td>
 <td className="px-4 py-3 text-muted-foreground">{match.email}</td>
 <td className="px-4 py-3">{match.score || '-'}</td>
 <td className="px-4 py-3">
 <Badge className="bg-muted">{match.result || 'N/A'}</Badge>
 </td>
 </tr>
 ))}
 {previewData?.matches && previewData.matches.length > 100 && (
 <tr>
 <td colSpan={4} className="px-4 py-3 text-center text-muted-foreground italic">
 And {previewData.matches.length - 100} more...
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {previewData?.missing && previewData.missing.length > 0 && (
 <div className="mb-6 p-4 border border-amber-200 bg-warning-muted rounded-xl">
 <p className="text-sm font-bold text-amber-800 mb-2">
 Notice: {previewData.missing.length} rows couldn't be matched.
 </p>
 <p className="text-xs text-amber-700">
 Ensure the email addresses match the students who applied to this drive.
 </p>
 </div>
 )}

 <div className="flex justify-end gap-3 pt-4 border-t border-border">
 <Button variant="outline"onClick={() => setStep(1)} disabled={loading}>
 Back
 </Button>
 <Button
 variant="primary"
 onClick={handleConfirm}
 disabled={loading || previewData?.matches.length === 0}
 >
 {loading ? (
 <Loading02Icon className="w-4 h-4 animate-spin mr-2"/>
 ) : (
 <TickDouble02Icon className="w-4 h-4 mr-2"/>
 )}
 Confirm & Save Results
 </Button>
 </div>
 </div>
 );
}
