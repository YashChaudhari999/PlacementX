import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Button } from '@/components/ui';
import { toast } from 'sonner';
import { Users, ChevronLeft, Building2, Calendar, MapPin, IndianRupee, Briefcase, FileText } from 'lucide-react';

export default function AdminEventDetails() {
  const { id } = useParams();
  const [drive, setDrive] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriveDetails();
    fetchApplications();
  }, [id]);

  const fetchDriveDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/drives/${id}`);
      setDrive(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load drive details');
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/drives/${id}/applications`);
      setApplications(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/drives/applications/${applicationId}/status`, {
        status: newStatus
      });
      toast.success('Status updated successfully');
      fetchApplications(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  if (loading || !drive) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Drive Tracker</h1>
          <p className="text-slate-500">Manage applications and track selection progress.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drive Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-800">{drive.company?.name}</h2>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${drive.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                  {drive.status}
                </span>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-600">
              <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /> {drive.jobRole}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {drive.workMode}</div>
              <div className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-slate-400" /> {drive.fixedSalary} LPA</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /> {drive.vacancies || 'TBD'} Vacancies</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Closes {new Date(drive.registrationEnd).toLocaleDateString()}</div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4">Pipeline Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Total Applied</span>
                  <span className="font-bold">{applications.length}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Shortlisted</span>
                  <span className="font-bold">
                    {applications.filter(a => ['ASSESSMENT_SCHEDULED', 'TECHNICAL_INTERVIEW', 'HR_INTERVIEW'].includes(a.status)).length}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(applications.filter(a => ['ASSESSMENT_SCHEDULED', 'TECHNICAL_INTERVIEW', 'HR_INTERVIEW'].includes(a.status)).length / applications.length) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Selected</span>
                  <span className="font-bold">
                    {applications.filter(a => a.status === 'SELECTED').length}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(applications.filter(a => a.status === 'SELECTED').length / applications.length) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Applicants Table */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Applicants ({applications.length})</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="p-4 font-semibold">Student</th>
                    <th className="p-4 font-semibold">Branch</th>
                    <th className="p-4 font-semibold">CGPA</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Resume</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No applications received yet.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <div className="font-medium text-slate-800">
                            {app.student.firstName} {app.student.lastName}
                          </div>
                          <div className="text-xs text-slate-500">{app.student.user.email}</div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{app.student.branch}</td>
                        <td className="p-4 text-sm text-slate-600 font-medium">{app.student.cgpa}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            app.status === 'SELECTED' ? 'bg-green-100 text-green-700' :
                            app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          {app.student.resumeUrl ? (
                            <a href={app.student.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                              <FileText className="w-4 h-4" /> View
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <select 
                            className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-primary"
                            value={app.status}
                            onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          >
                            <option value="APPLIED">Applied</option>
                            <option value="ASSESSMENT_SCHEDULED">Assessment</option>
                            <option value="TECHNICAL_INTERVIEW">Tech Interview</option>
                            <option value="HR_INTERVIEW">HR Interview</option>
                            <option value="SELECTED">Selected</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
