import { useState, useRef } from 'react';
import { Card, Input, Button } from '@/components/ui';
import { toast } from 'sonner';
import { Search, GraduationCap, FileText, CheckCircle, XCircle, Upload, Download, UserPlus } from 'lucide-react';
import Papa from 'papaparse';
import { StudentImportService } from '@/features/admin/services/studentImportService';
import { auth } from '@/lib/firebase/config/firebaseApp';
import { useAdminStudents, useProvisionStudents } from '@/hooks/queries/useAdmin';
import { ListSkeleton } from '@/components/common/Skeletons';

export default function AdminStudents() {
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter params for the query if we wanted backend searching, but doing frontend search for now
  const { data, isLoading: loading, refetch } = useAdminStudents({ academic_year: '2026/2027' });
  const students = data?.data || [];
  
  const { mutate: provisionStudents, isPending: isProvisioning } = useProvisionStudents();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.data.length === 0) {
          toast.error('CSV file is empty or has no valid rows.');
          setImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        try {
          const adminUid = auth.currentUser?.uid || 'unknown_admin';
          
          const importResult = await StudentImportService.importStudents(
            results.data as any,
            adminUid,
            (progress, status) => {
              setImportProgress(Math.round(progress));
            }
          );
          
          if (importResult.imported > 0) {
            toast.success(`Successfully imported ${importResult.imported} students!`);
          }
          if (importResult.failed > 0) {
            toast.error(`Failed to import ${importResult.failed} students.`);
          }
          if (importResult.skipped > 0) {
            toast(`Skipped ${importResult.skipped} empty/duplicate rows.`);
          }
          
          await refetch();
          
          setImporting(false);
          setImportProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
          
        } catch (error: any) {
          setImportProgress(0);
          setImporting(false);
          toast.error(error.message || 'Failed to import students');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        setImportProgress(0);
        toast.error('Error parsing CSV file: ' + error.message);
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const handleProvisionAccounts = () => {
    provisionStudents(undefined, {
      onSuccess: (res: any) => {
        const msg = res.stats 
          ? `Accounts Created: ${res.stats.accountsCreated} | Profiles Created: ${res.stats.profilesCreated} | Existing: ${res.stats.alreadyExisting}` 
          : 'Provisioning completed.';
        toast.success(msg, { duration: 6000 });
      }
    });
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.branch?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadTemplate = () => {
    const headers = ["Roll Number", "First Name", "Last Name", "Email", "Phone", "Gender", "Branch", "Password"];
    const csvContent = headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Student_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students Directory</h1>
          <p className="text-slate-500">Manage all registered students, their placement status, and provision accounts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-64">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button 
            onClick={handleProvisionAccounts}
            disabled={isProvisioning}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {isProvisioning ? 'Provisioning...' : 'Provision Accounts'}
          </Button>
          <Button 
            onClick={handleDownloadTemplate}
            variant="outline"
            className="flex items-center gap-2 hidden lg:flex"
          >
            <Download className="w-4 h-4" />
            Template
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={importing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import'}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200/60 shadow-sm">
        {importing && (
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <div className="flex justify-between text-sm text-slate-600 mb-3">
              <span className="font-medium flex items-center gap-2">
                <Upload className="w-4 h-4 animate-bounce" /> Importing students...
              </span>
              <span className="font-mono">{importProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-6"><ListSkeleton count={8} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Student & ID</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Contact</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Branch/Dept</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Academics</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-slate-500 bg-slate-50/30">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-20 text-slate-400" />
                      <p className="text-lg font-medium text-slate-600">No students found.</p>
                      <p className="text-sm text-slate-400 mt-1">Try importing data or adjusting your search.</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{student.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-1 bg-slate-100 inline-block px-1.5 rounded">{student.studentId || student.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-700 font-medium">{student.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-slate-700">{student.branch}</div>
                        <div className="text-xs text-slate-500 mt-1">{student.academicYear || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-slate-700">CGPA: {student.cgpa || '-'}</div>
                      </td>
                      <td className="p-4">
                        {student.status === 'Placed' ? (
                          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" /> Placed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <XCircle className="w-3.5 h-3.5" /> Unplaced
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
