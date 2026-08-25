import { useState, useRef } from 'react';
import { Card, Input, Button, Badge } from '@/components/ui';
import { toast } from 'sonner';
import { Search, GraduationCap, CheckCircle, XCircle, Upload, Download, UserPlus, Eye, Mail, Building2, BookOpen } from 'lucide-react';
import Papa from 'papaparse';
import { StudentImportService } from '@/features/admin/services/studentImportService';
import { auth } from '@/lib/firebase/config/firebaseApp';
import { useAdminStudents, useProvisionStudents } from '@/hooks/queries/useAdmin';
import { ListSkeleton } from '@/components/common/Skeletons';
import { StudentDetailsDrawer } from './StudentDetailsDrawer';
import { BulkActionsToolbar } from './BulkActionsToolbar';

export default function AdminStudents() {
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
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

  const uniqueBranches = Array.from(new Set(students.map((s: any) => s.branch).filter(Boolean))) as string[];
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const filteredStudents = students.filter((s: any) => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || 
                          s.email?.toLowerCase().includes(search.toLowerCase()) ||
                          s.studentId?.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || s.branch === selectedBranch;
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;
    
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s: any) => s.id));
    }
  };

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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Students</h1>
          <p className="text-slate-500 text-sm md:text-base font-medium max-w-lg">Manage and review student academic and placement information.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button 
            onClick={handleDownloadTemplate}
            variant="outline"
            className="flex items-center gap-2 hidden lg:flex bg-slate-50 hover:bg-slate-100 border-slate-200"
          >
            <Download className="w-4 h-4" />
            Template
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={importing}
            variant="outline"
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border-slate-200"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import Students'}
          </Button>
          <Button 
            onClick={handleProvisionAccounts}
            disabled={isProvisioning}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {isProvisioning ? 'Provisioning...' : 'Provision Accounts'}
          </Button>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Toolbar / Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Input
            icon={<Search className="w-4 h-4 text-slate-400" />}
            placeholder="Search by student name, ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border-slate-200 shadow-sm rounded-xl pl-10 h-11"
          />
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="w-full md:w-48 relative">
            <select
              className="w-full h-11 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none shadow-sm cursor-pointer"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="All">All Departments</option>
              {uniqueBranches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          
          <div className="w-full md:w-48 relative">
            <select
              className="w-full h-11 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none shadow-sm cursor-pointer"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Unplaced">Unplaced</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
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
          <div className="p-8"><ListSkeleton count={8} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider w-1/4">Student</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider w-1/5">Contact</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider w-1/5">Department</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Academics</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Placement Status</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-slate-500 bg-slate-50/50">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-semibold text-slate-700">No students found</p>
                      <p className="text-sm text-slate-500 mt-1">Try changing your search or filters.</p>
                      {(search || selectedBranch !== 'All' || selectedStatus !== 'All') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => { setSearch(''); setSelectedBranch('All'); setSelectedStatus('All'); }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className={`hover:bg-slate-50 transition-colors group ${selectedStudents.includes(student.id) ? 'bg-indigo-50/50' : ''}`}>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                            {student.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'S'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{student.name}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{student.studentId || student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <a href={`mailto:${student.email}`} className="text-sm font-medium hover:text-indigo-600 truncate" title={student.email}>
                            {student.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-1.5 text-slate-600">
                          <Building2 className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-800 truncate" title={student.branch}>{student.branch}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{student.academicYear || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 shrink-0 text-slate-400" />
                          <div className="text-sm">
                            <span className="text-slate-500 font-medium">CGPA </span>
                            <span className="font-bold text-slate-900">{student.cgpa || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.status === 'Placed' ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm flex items-center gap-1.5 w-max px-2.5 py-1 text-xs">
                            <CheckCircle className="w-3.5 h-3.5" /> Placed
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200 shadow-sm flex items-center gap-1.5 w-max px-2.5 py-1 text-xs font-medium">
                            <XCircle className="w-3.5 h-3.5 text-slate-400" /> Unplaced
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold text-xs px-3 group-hover:opacity-100 md:opacity-0 transition-all focus:opacity-100 inline-flex items-center gap-1.5"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <Eye className="w-4 h-4" />
                          View
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

      <StudentDetailsDrawer 
        studentId={selectedStudent?.id || null} 
        isOpen={!!selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
      />

      <BulkActionsToolbar
        selectedCount={selectedStudents.length}
        onClearSelection={() => setSelectedStudents([])}
        onVerify={() => toast.success(`Verified ${selectedStudents.length} profiles`)}
        onProvision={handleProvisionAccounts}
        onExport={() => toast.success(`Exporting ${selectedStudents.length} students`)}
        onAlert={() => toast.success(`Sending alert to ${selectedStudents.length} students`)}
      />
    </div>
  );
}
