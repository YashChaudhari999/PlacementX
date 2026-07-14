import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import { Card } from '@/components/ui';
import { toast } from 'sonner';
import { Building2, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ListSkeleton } from '@/components/common/Skeletons';

export default function StudentApplications() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchApplications();
    }
  }, [user?.id]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/student/applications', {
        headers: { 'x-user-id': user?.id }
      });
      setApplications(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ListSkeleton />;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SELECTED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      case 'APPLIED': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Applications</h1>
          <p className="text-slate-500">Track your placement drive applications and current status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {applications.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <div className="text-slate-400 mb-2">
              <Building2 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-700">No applications yet</h3>
            <p className="text-slate-500 mt-1">Visit your dashboard to browse active placement drives.</p>
            <Link to="/student/dashboard" className="text-primary hover:underline mt-4 inline-block font-medium">Browse Drives</Link>
          </Card>
        ) : (
          applications.map((app) => (
            <Card key={app.id} className="p-5 flex items-center justify-between hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{app.drive.company?.name}</h3>
                  <p className="text-sm font-medium text-slate-600">{app.drive.jobRole}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                  {app.status.replace('_', ' ')}
                </div>
                <Link to={`/student/drives/${app.driveId}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-primary">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
