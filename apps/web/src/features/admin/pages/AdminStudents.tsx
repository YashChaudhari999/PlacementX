// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { Card, Input, Button } from '@/components/ui';
import { toast } from 'sonner';
import { Search, GraduationCap, FileText, CheckCircle, XCircle, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';
import { ref, get } from 'firebase/database';
import { database, auth } from '@/lib/firebase/config/firebaseApp';
import { StudentImportService } from '@/features/admin/services/studentImportService';

import { ListSkeleton } from '@/components/common/Skeletons';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const snapshot = await get(ref(database, 'students'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const studentsList = Object.keys(data).map(key => {
          const s = data[key];
          return {
            id: key,
            name: `${s.personalInfo?.firstName || ''} ${s.personalInfo?.lastName || ''}`.trim(),
            firstName: s.personalInfo?.firstName,
            lastName: s.personalInfo?.lastName,
            email: s.contactDetails?.email,
            phone: s.contactDetails?.phone,
            branch: s.academicInfo?.branchId || 'N/A', // In Firebase, branchId is stored
            department: s.academicInfo?.departmentId || 'N/A',
            cgpa: s.academicInfo?.cgpa || 0,
            activeBacklogs: s.eligibility?.activeBacklogs || 0,
            totalBacklogs: s.eligibility?.totalBacklogs || 0,
            rollNumber: s.studentRollNumber || s.personalInfo?.firstName, // Fallback if no roll number
            status: s.eligibility?.isEligible ? 'Unplaced' : 'Placed' // Needs proper mapping, but usually Unplaced initially
          };
        });
        setStudents(studentsList);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[AdminStudents] File selected:', file.name, file.size, 'bytes');
    setImporting(true);
    setImportProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        console.log('[AdminStudents] CSV parsed. Rows:', results.data.length);
        console.log('[AdminStudents] CSV headers:', results.meta.fields);
        console.log('[AdminStudents] First row:', JSON.stringify(results.data[0]));
        
        if (results.data.length === 0) {
          toast.error('CSV file is empty or has no valid rows.');
          setImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        try {
          const adminUid = auth.currentUser?.uid || 'unknown_admin';
          console.log('[AdminStudents] Admin UID:', adminUid);
          
          const importResult = await StudentImportService.importStudents(
            results.data as any,
            adminUid,
            (progress, status) => {
              console.log('[AdminStudents] Progress:', progress, status);
              setImportProgress(Math.round(progress));
            }
          );
          
          console.log('[AdminStudents] Import result:', JSON.stringify(importResult));
          
          if (importResult.imported > 0) {
            toast.success(`Successfully imported ${importResult.imported} students!`);
          }
          if (importResult.failed > 0) {
            toast.error(`Failed to import ${importResult.failed} students. Check console for details.`);
            console.error('[AdminStudents] Import errors:', importResult.errors);
          }
          if (importResult.skipped > 0) {
            toast(`Skipped ${importResult.skipped} empty/duplicate rows.`);
          }
          
          // Refresh the students list
          console.log('[AdminStudents] Refreshing student list...');
          await fetchStudents();
          console.log('[AdminStudents] Student list refreshed. Total:', students.length);
          
          setImporting(false);
          setImportProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
          
        } catch (error: any) {
          console.error('[AdminStudents] Import error:', error);
          setImportProgress(0);
          setImporting(false);
          toast.error(error.message || 'Failed to import students');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        console.error('[AdminStudents] CSV parse error:', error);
        setImportProgress(0);
        toast.error('Error parsing CSV file: ' + error.message);
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.branch.toLowerCase().includes(search.toLowerCase())
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students Directory</h1>
          <p className="text-slate-500">Manage all registered students and their placement status.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-72">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Search by name, email, or branch..."
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
            onClick={handleDownloadTemplate}
            variant="outline"
            className="flex items-center gap-2"
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
            {importing ? 'Importing...' : 'Import CSV'}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
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
          <div className="p-6"><ListSkeleton /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Student & Roll No</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Contact</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Branch/Dept</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Academics (CGPA/Backlogs)</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{student.name || `${student.firstName} ${student.lastName}`}</div>
                        <div className="text-xs text-slate-500 font-mono mt-1">{student.rollNumber || student.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-700">{student.email}</div>
                        <div className="text-xs text-slate-500 mt-1">{student.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-slate-700">{student.branch}</div>
                        <div className="text-xs text-slate-500 mt-1">{student.department || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-slate-700">{student.cgpa || '-'}</div>
                        <div className="text-xs text-slate-500 mt-1">Backlogs: {student.activeBacklogs || 0} / {student.totalBacklogs || 0}</div>
                      </td>
                      <td className="p-4">
                        {student.status === 'Placed' ? (
                          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" /> Placed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                            <XCircle className="w-3.5 h-3.5" /> Unplaced
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {student.resumeUrl ? (
                          <Button variant="outline" size="sm" onClick={() => window.open(student.resumeUrl, '_blank')}>
                            <FileText className="w-4 h-4 mr-2" /> Resume
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Resume</span>
                        )}
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
