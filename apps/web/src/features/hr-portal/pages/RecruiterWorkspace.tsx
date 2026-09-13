import { useState, useEffect } from 'react';
import { Button, Card, Badge } from '@/components/ui';
import {
  UserMultipleIcon,
  TickDouble02Icon,
  Clock01Icon,
  Location01Icon,
  Search01Icon,
  Calendar01Icon,
  Note01Icon,
  CancelCircleIcon,
  CloudUploadIcon,
} from 'hugeicons-react';
import api from '@/lib/api';
import ResultUploadFlow from '../components/ResultUploadFlow';
import { Loading } from '@/components/common/Loading';

interface RecruiterWorkspaceProps {
  token: string;
}

export default function RecruiterWorkspace({ token }: RecruiterWorkspaceProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [eventData, setEventData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeUploadRound, setActiveUploadRound] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        setLoading(true);
        const [detailsRes, candidatesRes] = await Promise.all([
          api.get(`/hr/workspace/${token}/details`),
          api.get(`/hr/workspace/${token}/candidates`),
        ]);

        setEventData(detailsRes.data.drive);
        setStats(detailsRes.data.stats);
        setCandidates(candidatesRes.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Failed to load workspace data. Link might be invalid or expired.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchWorkspaceData();
  }, [token]);

  const handleUpdateStatus = async (applicationIds: string[], newStatus: string) => {
    try {
      await api.post(`/hr/workspace/${token}/status`, {
        applicationIds,
        status: newStatus,
      });

      // Update local state
      setCandidates((prev) =>
        prev.map((c) => (applicationIds.includes(c.id) ? { ...c, status: newStatus } : c))
      );

      alert(`Updated status to ${newStatus}`);
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
      await api.post(`/hr/workspace/${token}/interview`, {
        applicationIds: [applicationId],
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
    return <Loading message="Loading workspace..." />;
  }

  if (error || !eventData) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6 text-center">
        <Card className="max-w-md p-8 border-destructive/20 bg-destructive/5">
          <CancelCircleIcon className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">{error}</p>
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-xl">
              {eventData.company.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {eventData.company.name} Hiring Drive
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Workspace • {eventData.jobRole}
              </p>
            </div>
          </div>
          <Badge className="bg-success/10 text-success border-success/20 py-1">
            {eventData.status}
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-info/10 text-info rounded-xl flex items-center justify-center">
              <UserMultipleIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Applicants</p>
              <h3 className="text-2xl font-bold text-foreground">{stats?.applications || 0}</h3>
            </div>
          </Card>
          <Card className="p-4 border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
              <Note01Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Shortlisted</p>
              <h3 className="text-2xl font-bold text-foreground">{stats?.shortlisted || 0}</h3>
            </div>
          </Card>
          <Card className="p-4 border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Calendar01Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Interviews</p>
              <h3 className="text-2xl font-bold text-foreground">{stats?.interviewed || 0}</h3>
            </div>
          </Card>
          <Card className="p-4 border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center">
              <TickDouble02Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Selected</p>
              <h3 className="text-2xl font-bold text-foreground">{stats?.selected || 0}</h3>
            </div>
          </Card>
        </div>

        {/* Selection Rounds & Result Upload */}
        {eventData.selectionRounds && eventData.selectionRounds.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Selection Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventData.selectionRounds.map((round: any, index: number) => (
                <Card key={round.id} className="p-4 border-border shadow-sm bg-card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Badge className="bg-primary/10 text-primary mb-2 border-primary/20">
                        Round {index + 1}
                      </Badge>
                      <h3 className="font-bold text-foreground">{round.title || round.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(round.roundType || round.type || '').replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  {activeUploadRound === round.id ? (
                    <ResultUploadFlow
                      token={token}
                      roundId={round.id}
                      roundName={round.title || round.name}
                      onSuccess={() => {
                        setActiveUploadRound(null);
                        // Refresh data
                        window.location.reload();
                      }}
                      onCancel={() => setActiveUploadRound(null)}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full text-primary border-primary/20 hover:bg-primary/10 hover:text-primary"
                      onClick={() => setActiveUploadRound(round.id)}
                    >
                      <CloudUploadIcon className="w-4 h-4 mr-2" />
                      Upload Results
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Candidate List */}
        <Card className="border-border shadow-sm overflow-hidden bg-card">
          <div className="p-4 sm:p-6 border-b border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-foreground">Candidate Management</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search01Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-border bg-background rounded-lg text-sm text-foreground focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 border border-border bg-background text-foreground rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="APPLIED">Applied</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW_SCHEDULED">Interviewing</option>
                <option value="FINAL_SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Candidate Name</th>
                  <th className="px-6 py-4">Branch & CGPA</th>
                  <th className="px-6 py-4">Resume</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCandidates.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/50 transition-colors bg-card">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">
                        {app.student.firstName} {app.student.lastName}
                      </div>
                      <div
                        className="text-xs text-muted-foreground truncate max-w-[200px] mt-1"
                        title={app.student.skills?.join(', ')}
                      >
                        {app.student.skills?.slice(0, 3).join(', ')}
                        {app.student.skills?.length > 3 ? '...' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground/80">{app.student.branch}</div>
                      <div className="text-xs text-muted-foreground">
                        CGPA:{' '}
                        <span className="font-semibold text-foreground/80">{app.student.cgpa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {app.student.resumeUrl ? (
                        <a
                          href={app.student.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 transition-colors"
                        >
                          <Note01Icon className="w-4 h-4" /> View Resume
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Not uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          app.status === 'APPLIED'
                            ? 'bg-muted text-foreground'
                            : app.status === 'SHORTLISTED'
                              ? 'bg-warning/10 text-warning'
                              : app.status === 'INTERVIEW_SCHEDULED'
                                ? 'bg-primary/10 text-primary'
                                : app.status === 'FINAL_SELECTED'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-destructive/10 text-destructive'
                        }
                      >
                        {app.status ? app.status.replace(/_/g, ' ') : 'UNKNOWN'}
                      </Badge>
                      {app.interviewSchedule && (
                        <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar01Icon className="w-3 h-3" />{' '}
                            {new Date(app.interviewSchedule.date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock01Icon className="w-3 h-3" /> {app.interviewSchedule.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Location01Icon className="w-3 h-3" />{' '}
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
                          className="text-primary border-primary/20 hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleUpdateStatus([app.id], 'SHORTLISTED')}
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
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleUpdateStatus([app.id], 'REJECTED')}
                        >
                          Reject
                        </Button>
                      )}
                      {app.status === 'SHORTLISTED' && (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => handleScheduleInterview(app.id)}
                        >
                          Schedule Int.
                        </Button>
                      )}
                      {app.status === 'INTERVIEW_SCHEDULED' && (
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-success-foreground"
                          onClick={() => handleUpdateStatus([app.id], 'FINAL_SELECTED')}
                        >
                          Select
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredCandidates.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-muted-foreground bg-card"
                    >
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
