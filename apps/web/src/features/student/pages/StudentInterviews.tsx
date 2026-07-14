import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import { Card } from '@/components/ui';
import { toast } from 'sonner';
import { Calendar, Building2, Clock, MapPin, Video } from 'lucide-react';

import { ListSkeleton } from '@/components/common/Skeletons';

export default function StudentInterviews() {
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchInterviews();
    }
  }, [user?.id]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/student/interviews', {
        headers: { 'x-user-id': user?.id }
      });
      setInterviews(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ListSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Interviews</h1>
          <p className="text-slate-500">Track your upcoming assessments and interview rounds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {interviews.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="text-slate-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-slate-700">No upcoming interviews</h3>
            <p className="text-slate-500 mt-2">You will be notified when a company shortlists you for a round.</p>
          </Card>
        ) : (
          interviews.map((app) => (
            <Card key={app.applicationId} className="overflow-hidden border border-slate-200">
              <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{app.company}</h3>
                    <p className="text-sm font-medium text-slate-600">{app.role}</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border bg-blue-100 text-blue-700 border-blue-200`}>
                  {app.status.replace('_', ' ')}
                </div>
              </div>
              
              <div className="p-5">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Selection Rounds</h4>
                {app.rounds && app.rounds.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {app.rounds.map((round: any, idx: number) => (
                      <div key={round.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          {idx + 1}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800">{round.title}</h4>
                          </div>
                          <div className="space-y-2 text-sm text-slate-600">
                            {round.date && <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(round.date).toLocaleDateString()}</div>}
                            {round.time && <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {round.time}</div>}
                            {round.duration && <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {round.duration}</div>}
                            {round.venue && (
                              <div className="flex items-center gap-2">
                                {round.venue.includes('http') ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                {round.venue.includes('http') ? <a href={round.venue} target="_blank" rel="noreferrer" className="text-primary hover:underline">Meeting Link</a> : round.venue}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No specific rounds scheduled yet.</p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
