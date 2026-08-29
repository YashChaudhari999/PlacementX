import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { Card } from '@/components/ui';
import { toast } from 'sonner';
import { Calendar, Building2, Clock, MapPin, Video, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

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
      const res = await api.get('/student/interviews', {});
      setInterviews(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ListSkeleton />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-5xl mx-auto space-y-8 p-4 md:p-6 pb-20"
    >
      <div className="flex justify-between items-center bg-white/50 p-6 rounded-3xl backdrop-blur-md border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Rounds</h1>
          <p className="text-lg text-slate-500 mt-1">
            Track your upcoming assessments and selection rounds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {interviews.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="p-16 text-center border-dashed border-2 border-slate-300 shadow-md bg-slate-50/50 backdrop-blur-md">
              <div className="text-slate-300 mb-6 flex justify-center">
                <Calendar className="w-20 h-20 opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-slate-700">No upcoming rounds</h3>
              <p className="text-slate-500 mt-2 text-lg">
                You will be notified when a company shortlists you for a round.
              </p>
            </Card>
          </motion.div>
        ) : (
          interviews.map((app, idx) => (
            <motion.div key={app.applicationId} variants={itemVariants} custom={idx}>
              <Card className="overflow-hidden border border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white/90 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-2xl text-slate-900">{app.company}</h3>
                      <p className="text-md font-semibold text-blue-600 mt-1">{app.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    <div className="px-5 py-2 rounded-full text-sm font-bold border bg-blue-50 text-blue-700 border-blue-200 shadow-sm">
                      {app.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Rounds Timeline */}
                <div className="p-8">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
                    Selection Rounds Timeline
                  </h4>

                  {app.rounds && app.rounds.length > 0 ? (
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-blue-100 before:via-blue-200 before:to-transparent before:rounded-full">
                      {app.rounds.map((round: any, idx: number) => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          key={round.id}
                          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                        >
                          {/* Stepper Node */}
                          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-blue-600 text-white font-bold shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110 group-hover:bg-indigo-600">
                            {idx + 1}
                          </div>

                          {/* Round Card */}
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow group-hover:border-blue-200 relative">
                            {/* Connector triangle (desktop) */}
                            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-t border-r border-slate-100 group-odd:-left-2 group-odd:rotate-[-135deg] group-even:-right-2 group-even:rotate-45 group-hover:border-blue-200 transition-colors" />

                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-extrabold text-lg text-slate-800">
                                {round.title}
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                              {round.date && (
                                <div className="flex items-center gap-2 font-medium">
                                  <Calendar className="w-4 h-4 text-blue-500" />
                                  {new Date(round.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </div>
                              )}
                              {round.time && (
                                <div className="flex items-center gap-2 font-medium">
                                  <Clock className="w-4 h-4 text-blue-500" />
                                  {round.time}
                                </div>
                              )}
                              {round.duration && (
                                <div className="flex items-center gap-2 font-medium">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  {round.duration}
                                </div>
                              )}
                              {round.venue && (
                                <div className="flex items-center gap-2 font-medium">
                                  {round.venue.includes('http') ? (
                                    <Video className="w-4 h-4 text-purple-500" />
                                  ) : (
                                    <MapPin className="w-4 h-4 text-red-500" />
                                  )}
                                  {round.venue.includes('http') ? (
                                    <a
                                      href={round.venue}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                    >
                                      Join Meeting <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    <span className="truncate" title={round.venue}>
                                      {round.venue}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-500 italic font-medium">
                        No specific rounds scheduled yet.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
