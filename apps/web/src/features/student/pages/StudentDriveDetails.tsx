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
  const [eligibility, setEligibility] = useState<{ isEligible: boolean; reasons: string[] } | null>(
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Profile */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex gap-6">
            <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <Building2 className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{drive.company?.name}</h1>
              <p className="text-lg text-slate-600 mt-1 font-medium">{drive.jobRole}</p>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {drive.workMode}
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" /> Deadline:{' '}
                  {new Date(drive.registrationEnd).toLocaleDateString()}
                </div>
                {drive.fixedSalary && (
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4" /> {drive.fixedSalary} LPA
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            {eligibility ? (
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
              disabled={!eligibility?.isEligible}
              className={
                eligibility?.isEligible ? 'bg-primary hover:bg-primary-dark text-white' : ''
              }
            >
              Apply Now
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
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
            <Card className="p-6">
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
                        {round.date && <span>{new Date(round.date).toLocaleDateString()}</span>}
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

          <Card className="p-6">
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
