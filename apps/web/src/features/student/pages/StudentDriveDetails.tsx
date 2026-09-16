import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Card, Button } from '@/components/ui';
import {
 Building02Icon,
 Location01Icon,
 Calendar01Icon,
 Money01Icon,
 Alert02Icon,
 TickDouble02Icon,
 CancelCircleIcon,
} from 'hugeicons-react';
import { toast } from 'sonner';

export default function StudentDriveDetails() {
 const { id } = useParams();
 const navigate = useNavigate();
 const user = useAuthStore((state) => state.user);

 const [drive, setDrive] = useState<any>(null);
 const [eligibility, setEligibility] = useState<{
 isEligible: boolean;
 reasons: string[];
 hasApplied?: boolean;
 } | null>(null);
 const [loading, setLoading] = useState(true);

 async function fetchDriveDetails() {
 try {
 const res = await api.get(`/admin/drives/${id}`);
 setDrive(res.data);
 } catch (error) {
 console.error(error);
 toast.error('Failed to load drive details');
 navigate('/student/dashboard');
 }
 }

 async function checkEligibility() {
 if (!user) return;
 try {
 const res = await api.get(`/admin/drives/${id}/eligibility`, {});
 setEligibility(res.data);
 } catch (error) {
 console.error('Eligibility check failed', error);
 } finally {
 setLoading(false);
 }
 }

 useEffect(() => {
 fetchDriveDetails();
 checkEligibility();
 }, [id, user]);

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

 if (loading || !drive)
 return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

 const isDeadlinePassed = drive.registrationEnd
 ? new Date(drive.registrationEnd) < new Date()
 : false;
 const isRegistrationNotStarted = drive.registrationStart
 ? new Date(drive.registrationStart) > new Date()
 : false;

 return (
 <div className="max-w-5xl mx-auto space-y-6">
 {/* Header Profile */}
 <div className="bg-card p-8 rounded-3xl border border-border shadow-sm relative overflow-hidden">
 <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
 <div className="flex flex-col sm:flex-row gap-6">
 <div className="w-20 h-20 shrink-0 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-sm">
 <Building02Icon className="w-10 h-10 text-primary"/>
 </div>
 <div>
 <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
 {drive.company?.name}
 </h1>
 <p className="text-xl text-primary mt-1 font-bold">{drive.jobRole}</p>

 <div className="flex flex-wrap gap-3 mt-5 text-sm font-medium text-muted-foreground">
 <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg border border-border shadow-sm">
 <Location01Icon className="w-4 h-4 text-muted-foreground"/> {drive.workMode}
 </div>
 <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg border border-border shadow-sm">
 <Calendar01Icon className="w-4 h-4 text-muted-foreground"/> Deadline:{' '}
 {drive.registrationEnd
 ? new Date(drive.registrationEnd).toLocaleDateString('en-GB', {
 day: '2-digit',
 month: '2-digit',
 year: 'numeric',
 })
 : 'TBD'}
 </div>
 {drive.fixedSalary && (
 <div className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded-lg border border-success/20 shadow-sm font-bold">
 <Money01Icon className="w-4 h-4"/> {drive.fixedSalary} LPA
 </div>
 )}
 </div>
 </div>
 </div>

 <div className="flex flex-col items-end gap-3">
 {eligibility?.hasApplied ? (
 <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full font-semibold border border-primary/20">
 <TickDouble02Icon className="w-5 h-5"/> Already Applied
 </div>
 ) : isRegistrationNotStarted ? (
 <div className="flex items-center gap-2 text-info bg-info/10 px-4 py-2 rounded-full font-semibold border border-info/20">
 <Calendar01Icon className="w-5 h-5"/> Starts{' '}
 {new Date(drive.registrationStart).toLocaleDateString('en-GB', {
 day: '2-digit',
 month: '2-digit',
 year: 'numeric',
 })}
 </div>
 ) : isDeadlinePassed ? (
 <div className="flex items-center gap-2 text-warning bg-warning/10 px-4 py-2 rounded-full font-semibold border border-warning/20">
 <Alert02Icon className="w-5 h-5"/> Deadline Passed
 </div>
 ) : eligibility ? (
 eligibility.isEligible ? (
 <div className="flex items-center gap-2 text-success bg-success/10 px-4 py-2 rounded-full font-semibold border border-success/20">
 <TickDouble02Icon className="w-5 h-5"/> Eligible to Apply
 </div>
 ) : (
 <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-full font-semibold border border-destructive/20">
 <CancelCircleIcon className="w-5 h-5"/> Not Eligible
 </div>
 )
 ) : null}
 <Button
 onClick={handleApply}
 disabled={
 !eligibility?.isEligible ||
 isDeadlinePassed ||
 eligibility?.hasApplied ||
 isRegistrationNotStarted
 }
 className={
 eligibility?.hasApplied
 ? 'bg-muted text-muted-foreground cursor-not-allowed border-border'
 : isRegistrationNotStarted
 ? 'bg-info/10 text-info cursor-not-allowed border-info/20'
 : eligibility?.isEligible && !isDeadlinePassed
 ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
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
 <Card className="p-6 border-border shadow-sm">
 <h2 className="text-xl font-bold text-foreground mb-4">Job Description</h2>
 <div className="prose prose-slate max-w-none">
 <p className="whitespace-pre-wrap text-muted-foreground">{drive.jobDescription}</p>
 </div>

 {drive.company?.profile && (
 <div className="mt-8">
 <h3 className="text-lg font-bold text-foreground mb-3">
 About {drive.company.name}
 </h3>
 <p className="whitespace-pre-wrap text-muted-foreground">{drive.company.profile}</p>
 </div>
 )}
 </Card>

 {drive.selectionRounds && drive.selectionRounds.length > 0 && (
 <Card className="p-6 border-border shadow-sm">
 <h2 className="text-xl font-bold text-foreground mb-4">Selection Process</h2>
 <div className="space-y-4">
 {drive.selectionRounds.map((round: any, index: number) => (
 <div
 key={round.id}
 className="flex gap-4 p-4 border border-border rounded-lg bg-card"
 >
 <div className="w-8 h-8 shrink-0 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
 {index + 1}
 </div>
 <div>
 <h4 className="font-semibold text-foreground">{round.title}</h4>
 <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
 {round.date && (
 <span>
 {new Date(round.date).toLocaleDateString('en-GB', {
 day: '2-digit',
 month: '2-digit',
 year: 'numeric',
 })}
 </span>
 )}
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
 <Card className="p-5 border-destructive/20 bg-destructive/10">
 <h3 className="font-bold text-destructive flex items-center gap-2 mb-2">
 <Alert02Icon className="w-5 h-5"/> Why am I not eligible?
 </h3>
 <ul className="list-disc list-inside text-sm text-destructive/80 space-y-1">
 {eligibility.reasons.map((reason, i) => (
 <li key={i}>{reason}</li>
 ))}
 </ul>
 </Card>
 )}

 <Card className="p-6 border-border shadow-sm">
 <h3 className="font-bold text-foreground mb-4 border-b border-border pb-2">
 Compensation Details
 </h3>
 <div className="space-y-3 text-sm">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Fixed CTC</span>
 <span className="font-medium text-foreground">
 {drive.fixedSalary ? `${drive.fixedSalary} LPA` : '-'}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Variable Pay</span>
 <span className="font-medium text-foreground">
 {drive.variablePay ? `${drive.variablePay} LPA` : '-'}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Stipend (Internship)</span>
 <span className="font-medium text-foreground">
 {drive.internshipStipend ? `₹${drive.internshipStipend}/mo` : '-'}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">PPO Available</span>
 <span className="font-medium text-foreground">
 {drive.ppoAvailable ? 'Yes' : 'No'}
 </span>
 </div>
 {drive.bondDetails && (
 <div className="pt-3 border-t border-border mt-3">
 <span className="text-muted-foreground block mb-1">Bond Details</span>
 <span className="font-medium text-foreground">{drive.bondDetails}</span>
 </div>
 )}
 </div>
 </Card>
 </div>
 </div>
 </div>
 );
}
