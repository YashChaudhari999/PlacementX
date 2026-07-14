// @ts-nocheck
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Input, Button } from '@/components/ui';
import { toast } from 'sonner';
import { Search, GraduationCap, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/students');
      setStudents(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.branch.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students Directory</h1>
          <p className="text-slate-500">Manage all registered students and their placement status.</p>
        </div>
        <div className="w-72">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Search by name, email, or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Student</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Branch</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">CGPA</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{student.name}</div>
                        <div className="text-sm text-slate-500">{student.email}</div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{student.branch}</td>
                      <td className="p-4 text-slate-600 font-medium">{student.cgpa}</td>
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
