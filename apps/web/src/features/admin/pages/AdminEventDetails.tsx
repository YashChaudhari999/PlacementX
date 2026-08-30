import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Card, Button } from '@/components/ui';
import { toast } from 'sonner';
import {
  UserMultipleIcon,
  ArrowLeft01Icon,
  Building02Icon,
  Calendar01Icon,
  Location01Icon,
  Money01Icon,
  Briefcase01Icon,
  Note01Icon,
  Tick02Icon,
  CancelCircleIcon,
} from 'hugeicons-react';

import { DashboardSkeleton } from '@/components/common/Skeletons';

export default function AdminEventDetails() {
  const { id } = useParams();
  const [drive, setDrive] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [driveRes, appsRes] = await Promise.all([
        api.get(`/admin/drives/${id}`),
        api.get(`/admin/drives/${id}/applications`),
      ]);
      setDrive(driveRes.data);
      setApplications(appsRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load drive details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchApplications = async () => {
    try {
      const res = await api.get(`/admin/drives/${id}/applications`);
      setApplications(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load applications');
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      await api.put(`/admin/drives/applications/${applicationId}/status`, {
        status: newStatus,
      });
      toast.success('Status updated successfully');
      fetchApplications(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const handleDriveReview = async (action: 'approve' | 'reject' | 'request-changes') => {
    try {
      await api.post(
        `/admin/drives/${id}/${action}`,
        action === 'request-changes' ? { comments: 'Please revise criteria.' } : {}
      );
      toast.success(`Drive ${action}d successfully`);
      // fetchDriveDetails();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} drive`);
    }
  };

  const handleUpdateDriveStatus = async (newStatus: string) => {
    try {
      await api.put(`/admin/drives/${id}/status`, { status: newStatus });
      toast.success('Drive status updated');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update drive status');
    }
  };

  if (loading || !drive) return <DashboardSkeleton />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/dashboard"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft01Icon className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Drive Tracker</h1>
            <p className="text-slate-500">Manage applications and track selection progress.</p>
          </div>
        </div>
        <div>
          <Link to={`/admin/placement-events/edit/${drive.id}`}>
            <Button
              variant="outline"
              className="text-slate-700 bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
            >
              <Note01Icon className="w-4 h-4 mr-2" /> Edit Drive Details
            </Button>
          </Link>
        </div>
      </div>

      {drive.status === 'SUBMITTED' && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-blue-900">HR Submission Pending Review</h3>
              <p className="text-sm text-blue-700 mt-1">
                Review the details submitted by {drive.company?.hrName || 'HR'} before publishing to
                students.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => handleDriveReview('reject')}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <CancelCircleIcon className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button
                onClick={() => handleDriveReview('request-changes')}
                variant="outline"
                className="border-amber-200 text-amber-600 hover:bg-amber-50"
              >
                Request Changes
              </Button>
              <Button
                onClick={() => handleDriveReview('approve')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Tick02Icon className="w-4 h-4 mr-2" /> Approve & Publish
              </Button>
            </div>
          </div>
        </Card>
      )}

      {drive.status === 'DRAFT' && (
        <Card className="p-6 bg-slate-50 border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Draft Drive</h3>
              <p className="text-sm text-slate-700 mt-1">
                This drive is currently a draft and is not visible to students. Publish it to start
                accepting applications.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => handleDriveReview('approve')}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Tick02Icon className="w-4 h-4 mr-2" /> Publish Drive
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drive Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <Building02Icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-800">{drive.company?.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <select
                    className={`text-xs font-bold px-2 py-1 rounded-full outline-none cursor-pointer border-r-4 border-transparent ${
                      drive.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : drive.status === 'COMPLETED'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                    value={drive.status}
                    onChange={(e) => handleUpdateDriveStatus(e.target.value)}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Briefcase01Icon className="w-4 h-4 text-slate-400" /> {drive.jobRole}
              </div>
              <div className="flex items-center gap-2">
                <Location01Icon className="w-4 h-4 text-slate-400" /> {drive.workMode}
              </div>
              <div className="flex items-center gap-2">
                <Money01Icon className="w-4 h-4 text-slate-400" /> {drive.fixedSalary} LPA
              </div>
              <div className="flex items-center gap-2">
                <UserMultipleIcon className="w-4 h-4 text-slate-400" /> {drive.vacancies || 'TBD'}{' '}
                Vacancies
              </div>
              <div className="flex items-center gap-2">
                <Calendar01Icon className="w-4 h-4 text-slate-400" /> Closes{' '}
                {new Date(drive.registrationEnd).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4">Pipeline Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Eligible Students</span>
                  <span className="font-bold">{drive.eligibleStudentsCount || 0}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-slate-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Total Applied</span>
                  <span className="font-bold">{applications.length}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: drive.eligibleStudentsCount
                        ? `${(applications.length / drive.eligibleStudentsCount) * 100}%`
                        : '100%',
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Shortlisted</span>
                  <span className="font-bold">
                    {
                      applications.filter((a) =>
                        ['ASSESSMENT_SCHEDULED', 'TECHNICAL_INTERVIEW', 'HR_INTERVIEW'].includes(
                          a.status
                        )
                      ).length
                    }
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${(applications.filter((a) => ['ASSESSMENT_SCHEDULED', 'TECHNICAL_INTERVIEW', 'HR_INTERVIEW'].includes(a.status)).length / applications.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Selected</span>
                  <span className="font-bold">
                    {applications.filter((a) => a.status === 'SELECTED').length}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(applications.filter((a) => a.status === 'SELECTED').length / applications.length) * 100}%`,
                    }}
                  ></div>
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
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-medium text-slate-800">
                            {app.student.firstName} {app.student.lastName}
                          </div>
                          <div className="text-xs text-slate-500">{app.student.user.email}</div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                          {app.student.branch}
                        </td>
                        <td className="p-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                          {app.student.cgpa}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap inline-block ${
                              app.status === 'SELECTED'
                                ? 'bg-green-100 text-green-700'
                                : app.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {app.student.resumeUrl ? (
                            <a
                              href={app.student.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-sm"
                            >
                              <Note01Icon className="w-4 h-4" /> View
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <select
                            className="text-xs border border-slate-200 rounded px-3 py-1.5 bg-white focus:outline-none focus:border-primary min-w-[130px]"
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
