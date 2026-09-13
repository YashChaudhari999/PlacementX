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
  Copy01Icon,
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      fetchData();
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
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft01Icon className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Drive Tracker</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage applications and track selection progress.
            </p>
          </div>
        </div>
        <div>
          <Link to={`/admin/placement-events/edit/${drive.id}`}>
            <Button
              variant="outline"
              className="bg-card border-border hover:bg-muted shadow-sm text-foreground"
            >
              <Note01Icon className="w-4 h-4 mr-2" /> Edit Drive Details
            </Button>
          </Link>
        </div>
      </div>

      {drive.status === 'SUBMITTED' && (
        <Card className="p-6 bg-info/10 border-info/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-info">HR Submission Pending Review</h3>
              <p className="text-sm text-info/80 mt-1">
                Review the details submitted by {drive.company?.hrName || 'HR'} before publishing to
                students.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => handleDriveReview('reject')}
                variant="outline"
                className="border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <CancelCircleIcon className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button
                onClick={() => handleDriveReview('request-changes')}
                variant="outline"
                className="border-warning/20 text-warning hover:bg-warning/10"
              >
                Request Changes
              </Button>
              <Button
                onClick={() => handleDriveReview('approve')}
                className="bg-success hover:bg-success/90 text-white"
              >
                <Tick02Icon className="w-4 h-4 mr-2" /> Approve & Publish
              </Button>
            </div>
          </div>
        </Card>
      )}

      {drive.status === 'DRAFT' && (
        <Card className="p-6 bg-muted border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Draft Drive</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This drive is currently a draft and is not visible to students. Publish it to start
                accepting applications.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => handleDriveReview('approve')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Tick02Icon className="w-4 h-4 mr-2" /> Publish Drive
              </Button>
            </div>
          </div>
        </Card>
      )}

      {drive.hrInvitations && drive.hrInvitations.length > 0 && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-primary">HR Portal Link Active</h3>
              <p className="text-sm text-primary/80 mt-1">
                Share this link with the HR for them to manage the drive details.
              </p>
              <div className="mt-3 bg-card px-4 py-2 rounded-md border border-border flex items-center gap-3">
                <span className="text-sm font-mono text-muted-foreground select-all">
                  {`${window.location.origin}/hr-drive/${drive.hrInvitations[0].token}`}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 hover:bg-muted text-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/hr-drive/${drive.hrInvitations[0].token}`
                    );
                    toast.success('Link copied to clipboard');
                  }}
                >
                  <Copy01Icon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drive Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground">
                <Building02Icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">{drive.company?.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <select
                    className={`text-xs font-bold px-2 py-1 rounded-md outline-none cursor-pointer border border-transparent ${
                      drive.status === 'PUBLISHED'
                        ? 'bg-success/10 text-success border-success/20'
                        : drive.status === 'COMPLETED'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-muted text-muted-foreground border-border'
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

            <div className="space-y-3 pt-4 border-t border-border text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Briefcase01Icon className="w-4 h-4" /> {drive.jobRole}
              </div>
              <div className="flex items-center gap-2">
                <Location01Icon className="w-4 h-4" /> {drive.workMode}
              </div>
              <div className="flex items-center gap-2">
                <Money01Icon className="w-4 h-4" /> {drive.fixedSalary} LPA
              </div>
              <div className="flex items-center gap-2">
                <UserMultipleIcon className="w-4 h-4" /> {drive.vacancies || 'TBD'} Vacancies
              </div>
              <div className="flex items-center gap-2">
                <Calendar01Icon className="w-4 h-4" /> Closes{' '}
                {new Date(drive.registrationEnd).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4">Pipeline Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Eligible Students</span>
                  <span className="font-bold text-foreground">
                    {drive.eligibleStudentsCount || 0}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary/40 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Total Applied</span>
                  <span className="font-bold text-foreground">{applications.length}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-info h-2 rounded-full"
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
                  <span className="text-muted-foreground">Shortlisted</span>
                  <span className="font-bold text-foreground">
                    {
                      applications.filter((a) =>
                        ['ASSESSMENT_SCHEDULED', 'TECHNICAL_INTERVIEW', 'HR_INTERVIEW'].includes(
                          a.status
                        )
                      ).length
                    }
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(applications.filter((a) => ['ASSESSMENT_SCHEDULED', 'TECHNICAL_INTERVIEW', 'HR_INTERVIEW'].includes(a.status)).length / (applications.length || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Selected</span>
                  <span className="font-bold text-foreground">
                    {applications.filter((a) => a.status === 'SELECTED').length}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-success h-2 rounded-full"
                    style={{
                      width: `${(applications.filter((a) => a.status === 'SELECTED').length / (applications.length || 1)) * 100}%`,
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
            <div className="p-4 border-b border-border bg-muted/50 flex justify-between items-center">
              <h3 className="font-bold text-foreground">Applicants ({applications.length})</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="p-4 font-semibold">Student</th>
                    <th className="p-4 font-semibold">Branch</th>
                    <th className="p-4 font-semibold">CGPA</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Resume</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No applications received yet.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-muted/50">
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-medium text-foreground">
                            {app.student.firstName} {app.student.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {app.student.user.email}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                          {app.student.branch}
                        </td>
                        <td className="p-4 text-sm text-foreground font-medium whitespace-nowrap">
                          {app.student.cgpa}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap inline-block border ${
                              app.status === 'SELECTED'
                                ? 'bg-success/10 text-success border-success/20'
                                : app.status === 'REJECTED'
                                  ? 'bg-destructive/10 text-destructive border-destructive/20'
                                  : 'bg-info/10 text-info border-info/20'
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
                              className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
                            >
                              <Note01Icon className="w-4 h-4" /> View
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <select
                            className="text-xs border border-border rounded-md px-3 py-1.5 bg-card text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-w-[140px]"
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
