import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Card, Button } from '@/components/ui';
import {
  Building2,
  MapPin,
  CalendarDays,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudentDriveDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [drive, setDrive] = useState<any>(null);
  const [eligibility, setEligibility] = useState<{ isEligible: boolean; reasons: string[]; hasApplied?: boolean } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriveDetails();
    checkEligibility();
  }, [id, user]);

  const fetchDriveDetails = async () => {
    try {
      const res = await api.get(`/admin/drives/${id}`);
      setDrive(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load drive details');
      navigate('/student/dashboard');
    }
  };

  const checkEligibility = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/admin/drives/${id}/eligibility`, {});
      setEligibility(res.data);
    } catch (error) {
      console.error('Eligibility check failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setLoading(true);
      await api.post('/student/applications', { driveId: id }, {});
      toast.success('Successfully applied to the drive!');
      navigate('/student/applications');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !drive) return <div className="p-8 text-center">Loading...</div>;

  const isDeadlinePassed = new Date(drive.registrationEnd) < new Date();
  const isRegistrationNotStarted = drive.registrationStart ? new Date(drive.registrationStart) > new Date() : false;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Profile */}
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
              <Building2 className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{drive.company?.name}</h1>
              <p className="text-xl text-indigo-600 mt-1 font-bold">{drive.jobRole}</p>
              
              <div className="flex flex-wrap gap-3 mt-5 text-sm font-medium text-slate-600">
                <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">
                  <MapPin className="w-4 h-4 text-slate-400" /> {drive.workMode}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">
                  <CalendarDays className="w-4 h-4 text-slate-400" /> Deadline:{' '}
                  {new Date(drive.registrationEnd).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
                {drive.fixedSalary && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm font-bold">
                    <IndianRupee className="w-4 h-4" /> {drive.fixedSalary} LPA
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            {eligibility?.hasApplied ? (
              <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-4 py-2 rounded-full font-semibold border border-indigo-200">
                <CheckCircle2 className="w-5 h-5" /> Already Applied
              </div>
            ) : isRegistrationNotStarted ? (
              <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-4 py-2 rounded-full font-semibold border border-blue-200">
                <CalendarDays className="w-5 h-5" /> Starts {new Date(drive.registrationStart).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            ) : isDeadlinePassed ? (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-full font-semibold border border-amber-200">
                <AlertCircle className="w-5 h-5" /> Deadline Passed
              </div>
            ) : eligibility ? (
              eligibility.isEligible ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full font-semibold border border-green-200">
                  <CheckCircle2 className="w-5 h-5" /> Eligible to Apply
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 px-4 py-2 rounded-full font-semibold border border-red-200">
                  <XCircle className="w-5 h-5" /> Not Eligible
                </div>
              )
            ) : null}
            <Button
              onClick={handleApply}
              disabled={!eligibility?.isEligible || isDeadlinePassed || eligibility?.hasApplied || isRegistrationNotStarted}
              className={
                eligibility?.hasApplied
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : isRegistrationNotStarted
                  ? 'bg-blue-100 text-blue-500 cursor-not-allowed'
                  : eligibility?.isEligible && !isDeadlinePassed
                    ? 'bg-primary hover:bg-primary-dark text-white'
                    : ''
              }
            >
              {eligibility?.hasApplied
                ? 'Applied'
                : isRegistrationNotStarted
                ? 'Starts Soon'
                : isDeadlinePassed
                  ? 'Applications Closed'
                  : 'Apply Now'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Job Description</h2>
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-wrap text-slate-600">{drive.jobDescription}</p>
            </div>

            {drive.company?.profile && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-3">
                  About {drive.company.name}
                </h3>
                <p className="whitespace-pre-wrap text-slate-600">{drive.company.profile}</p>
              </div>
            )}
          </Card>

          {drive.selectionRounds && drive.selectionRounds.length > 0 && (
            <Card className="p-6 border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Selection Process</h2>
              <div className="space-y-4">
                {drive.selectionRounds.map((round: any, index: number) => (
                  <div key={round.id} className="flex gap-4 p-4 border border-slate-200 rounded-lg">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{round.title}</h4>
                      <div className="text-sm text-slate-500 mt-1 flex gap-4">
                        {round.date && <span>{new Date(round.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>}
                        {round.duration && <span>Duration: {round.duration}</span>}
                        {round.venue && <span>Venue: {round.venue}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          {eligibility && !eligibility.isEligible && (
            <Card className="p-5 border-red-200 bg-red-50">
              <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5" /> Why am I not eligible?
              </h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {eligibility.reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-6 border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Compensation Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Fixed CTC</span>
                <span className="font-medium text-slate-800">
                  {drive.fixedSalary ? `${drive.fixedSalary} LPA` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Variable Pay</span>
                <span className="font-medium text-slate-800">
                  {drive.variablePay ? `${drive.variablePay} LPA` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stipend (Internship)</span>
                <span className="font-medium text-slate-800">
                  {drive.internshipStipend ? `₹${drive.internshipStipend}/mo` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PPO Available</span>
                <span className="font-medium text-slate-800">
                  {drive.ppoAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              {drive.bondDetails && (
                <div className="pt-3 border-t mt-3">
                  <span className="text-slate-500 block mb-1">Bond Details</span>
                  <span className="font-medium text-slate-800">{drive.bondDetails}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
