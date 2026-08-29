import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, Badge } from '@/components/ui';
import {
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Calendar,
  FileText,
  XCircle,
} from 'lucide-react';
import api from '@/lib/api';

export default function RecruiterEventDashboard() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [eventData, setEventData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const [detailsRes, candidatesRes] = await Promise.all([
          api.get(`/recruiter/event/${token}`),
          api.get(`/recruiter/event/${token}/candidates`),
        ]);

        setEventData(detailsRes.data.drive);
        setStats(detailsRes.data.stats);
        setCandidates(candidatesRes.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Failed to load event data. Link might be invalid or expired.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchEventData();
  }, [token]);

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      await api.post(`/recruiter/event/${token}/shortlist`, {
        applicationId,
        status: newStatus,
      });

      // Update local state
      setCandidates((prev) =>
        prev.map((c) => (c.id === applicationId ? { ...c, status: newStatus } : c))
      );

      // Update stats
      if (stats) {
        setStats({
          ...stats,
          shortlisted: newStatus === 'SHORTLISTED' ? stats.shortlisted + 1 : stats.shortlisted,
          rejected: newStatus === 'REJECTED' ? stats.rejected + 1 : stats.rejected,
          selected: newStatus === 'SELECTED' ? stats.selected + 1 : stats.selected,
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleScheduleInterview = async (applicationId: string) => {
    const date = prompt('Enter Interview Date (YYYY-MM-DD):');
    if (!date) return;
    const time = prompt('Enter Interview Time (HH:MM AM/PM):');
    if (!time) return;
    const venue = prompt('Enter Interview Venue or Link:');
    if (!venue) return;

    try {
      await api.post(`/recruiter/event/${token}/interview`, {
        applicationId,
        date,
        time,
        venue,
      });

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === applicationId
            ? {
                ...c,
                status: 'INTERVIEW_SCHEDULED',
                interviewSchedule: { date, time, venue },
              }
            : c
        )
      );

      alert('Interview scheduled successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <Card className="max-w-md p-8">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-600">{error}</p>
        </Card>
      </div>
    );
  }

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch = `${c.student.firstName} ${c.student.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-bold text-xl">
              {eventData.company.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {eventData.company.name} Hiring Drive
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Recruiter Portal • {eventData.title}
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 py-1">
            Active Event
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Applicants</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats?.applications || 0}</h3>
            </div>
          </Card>
          <Card className="p-4 border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Shortlisted</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats?.shortlisted || 0}</h3>
            </div>
          </Card>
          <Card className="p-4 border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Interviews</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats?.interviewed || 0}</h3>
            </div>
          </Card>
          <Card className="p-4 border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Selected</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats?.selected || 0}</h3>
            </div>
          </Card>
        </div>

        {/* Candidate List */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-800">Candidate Management</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="APPLIED">Applied</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW_SCHEDULED">Interviewing</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Candidate Name</th>
                  <th className="px-6 py-4">Branch & CGPA</th>
                  <th className="px-6 py-4">Resume</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCandidates.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">
                        {app.student.firstName} {app.student.lastName}
                      </div>
                      <div
                        className="text-xs text-slate-500 truncate max-w-[200px] mt-1"
                        title={app.student.skills?.join(', ')}
                      >
                        {app.student.skills?.slice(0, 3).join(', ')}
                        {app.student.skills?.length > 3 ? '...' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{app.student.branch}</div>
                      <div className="text-xs text-slate-500">
                        CGPA:{' '}
                        <span className="font-semibold text-slate-700">{app.student.cgpa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {app.student.resumeUrl ? (
                        <a
                          href={app.student.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" /> View Resume
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Not uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          app.status === 'APPLIED'
                            ? 'bg-slate-100 text-slate-700'
                            : app.status === 'SHORTLISTED'
                              ? 'bg-amber-100 text-amber-700'
                              : app.status === 'INTERVIEW_SCHEDULED'
                                ? 'bg-purple-100 text-purple-700'
                                : app.status === 'SELECTED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                        }
                      >
                        {app.status.replace('_', ' ')}
                      </Badge>
                      {app.interviewSchedule && (
                        <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{' '}
                            {new Date(app.interviewSchedule.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {app.interviewSchedule.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{' '}
                            {app.interviewSchedule.venue.slice(0, 15)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {app.status === 'APPLIED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                        >
                          Shortlist
                        </Button>
                      )}
                      {(app.status === 'APPLIED' ||
                        app.status === 'SHORTLISTED' ||
                        app.status === 'INTERVIEW_SCHEDULED') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      )}
                      {app.status === 'SHORTLISTED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleScheduleInterview(app.id)}
                        >
                          Schedule Int.
                        </Button>
                      )}
                      {app.status === 'INTERVIEW_SCHEDULED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleUpdateStatus(app.id, 'SELECTED')}
                        >
                          Select
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No candidates found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
