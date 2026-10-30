import { useEffect, useState, type ReactNode } from 'react';
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
import { formatRegistrationClose } from '@/lib/dateTime';

const displayValue = (value: unknown, fallback = 'Not specified') =>
 value === null || value === undefined || value === '' ? fallback : String(value);

const parseList = (value: unknown): string[] => {
 if (Array.isArray(value)) return value.map(String).filter(Boolean);
 if (typeof value !== 'string' || !value.trim()) return [];
 try {
 const parsed = JSON.parse(value);
 if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
 } catch {
 // Older records store comma-separated values.
 }
 return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const formatDateTime = (value?: string | null) =>
 value
 ? new Date(value).toLocaleString('en-IN', {
 day: '2-digit', month: 'short', year: 'numeric',
 hour: 'numeric', minute: '2-digit', hour12: true,
 })
 : 'Not scheduled';

const safeExternalUrl = (value?: string | null): string | null => {
 if (!value?.trim()) return null;
 const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
 try {
 const url = new URL(candidate);
 return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
 } catch {
 return null;
 }
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
 return (
 <div className="flex items-start justify-between gap-4 py-2 border-b border-border/60 last:border-0">
 <span className="text-muted-foreground">{label}</span>
 <span className="font-medium text-foreground text-right">{value}</span>
 </div>
 );
}

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

 const registrationDeadline = drive.applicationDeadline || drive.registrationEnd;
 const isDeadlinePassed = registrationDeadline
 ? new Date(registrationDeadline) < new Date()
 : false;
 const isRegistrationNotStarted = drive.registrationStart
 ? new Date(drive.registrationStart) > new Date()
 : false;
 const eligibleBranches = parseList(drive.eligibleBranches);
 const attachments = parseList(drive.attachments);
 const companyWebsite = safeExternalUrl(drive.company?.website);
 const nominationUrl = safeExternalUrl(drive.nominationLink);
 const requiredDocuments = [
 drive.resumeMandatory && 'Resume / CV',
 drive.portfolioRequired && 'Portfolio',
 drive.githubRequired && 'GitHub profile',
 drive.linkedinRequired && 'LinkedIn profile',
 ].filter(Boolean) as string[];

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
 <Calendar01Icon className="w-4 h-4 text-muted-foreground"/>
 Registration closes: {formatRegistrationClose(registrationDeadline)}
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
 <Alert02Icon className="w-5 h-5"/> Registration closed
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
 <h2 className="text-xl font-bold text-foreground mb-4">Drive Overview</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 text-sm">
 <DetailRow label="Drive title" value={displayValue(drive.driveTitle || drive.jobRole)} />
 <DetailRow label="Drive type" value={displayValue(drive.driveType)} />
 <DetailRow label="Employment type" value={displayValue(drive.employmentType)} />
 <DetailRow label="Work mode" value={displayValue(drive.workMode)} />
 <DetailRow label="Location" value={displayValue(drive.location || drive.company?.location)} />
 <DetailRow label="Vacancies" value={displayValue(drive.vacancies)} />
 <DetailRow label="Department" value={displayValue(drive.department)} />
 <DetailRow label="Campus" value={displayValue(drive.campus)} />
 <DetailRow label="Academic year" value={displayValue(drive.academicYear)} />
 <DetailRow label="Placement season" value={displayValue(drive.placementSeason)} />
 </div>
 </Card>

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

 {(drive.requiredSkills || drive.preferredSkills || drive.technologyStack || drive.benefits || drive.trainingPeriod) && (
 <Card className="p-6 border-border shadow-sm">
 <h2 className="text-xl font-bold text-foreground mb-4">Skills & Opportunity Details</h2>
 <div className="space-y-4 text-sm">
 {drive.requiredSkills && <div><h3 className="font-semibold mb-1">Required skills</h3><p className="text-muted-foreground whitespace-pre-wrap">{drive.requiredSkills}</p></div>}
 {drive.preferredSkills && <div><h3 className="font-semibold mb-1">Preferred skills</h3><p className="text-muted-foreground whitespace-pre-wrap">{drive.preferredSkills}</p></div>}
 {drive.technologyStack && <div><h3 className="font-semibold mb-1">Technology stack</h3><p className="text-muted-foreground whitespace-pre-wrap">{drive.technologyStack}</p></div>}
 {drive.trainingPeriod && <DetailRow label="Training period" value={drive.trainingPeriod} />}
 {drive.benefits && <div><h3 className="font-semibold mb-1">Benefits</h3><p className="text-muted-foreground whitespace-pre-wrap">{drive.benefits}</p></div>}
 </div>
 </Card>
 )}

 <Card className="p-6 border-border shadow-sm">
 <h2 className="text-xl font-bold text-foreground mb-4">Registration Timeline</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 text-sm">
 <DetailRow label="Registration opens" value={formatDateTime(drive.registrationStart)} />
 <DetailRow label="Registration closes" value={formatRegistrationClose(drive.applicationDeadline || drive.registrationEnd)} />
 <DetailRow label="Expected drive date" value={formatDateTime(drive.expectedDriveDate)} />
 <DetailRow label="Maximum applicants" value={displayValue(drive.maximumApplicants, 'No limit specified')} />
 </div>
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
 {round.time && <span>Time: {round.time}</span>}
 {round.mode && <span>Mode: {round.mode}</span>}
 {round.platform && <span>Platform: {round.platform}</span>}
 </div>
 {round.instructions && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{round.instructions}</p>}
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
 <h3 className="font-bold text-foreground mb-4 border-b border-border pb-2">Eligibility Criteria</h3>
 <div className="text-sm">
 <DetailRow label="Eligible branches" value={eligibleBranches.length ? eligibleBranches.join(', ') : 'All / not specified'} />
 <DetailRow label="Passing year" value={displayValue(drive.passingYear)} />
 <DetailRow label="Minimum CGPA" value={displayValue(drive.minimumCgpa)} />
 <DetailRow label="Minimum attendance" value={drive.minimumAttendance != null ? `${drive.minimumAttendance}%` : 'Not specified'} />
 <DetailRow label="Active backlogs allowed" value={displayValue(drive.activeBacklogsAllowed)} />
 <DetailRow label="History of backlogs allowed" value={displayValue(drive.historyOfBacklogsAllowed)} />
 <DetailRow label="Gap years allowed" value={displayValue(drive.maximumGapYears ?? drive.yearGapAllowed)} />
 <DetailRow label="Maximum live offers" value={displayValue(drive.maximumLiveOffers)} />
 <DetailRow label="Gender restriction" value={displayValue(drive.genderRestriction, 'None')} />
 {drive.semester != null && <DetailRow label="Semester" value={drive.semester} />}
 </div>
 </Card>

 <Card className="p-6 border-border shadow-sm">
 <h3 className="font-bold text-foreground mb-4 border-b border-border pb-2">Required Documents</h3>
 {requiredDocuments.length ? (
 <ul className="list-disc list-inside text-sm text-foreground space-y-1">
 {requiredDocuments.map((document) => <li key={document}>{document}</li>)}
 </ul>
 ) : <p className="text-sm text-muted-foreground">No specific documents listed.</p>}
 </Card>

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
 {drive.variableSalary ? `${drive.variableSalary} LPA` : '-'}
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
 <DetailRow label="Joining bonus" value={drive.joiningBonus ? `₹${drive.joiningBonus}` : 'Not specified'} />
 </div>
 </Card>

 <Card className="p-6 border-border shadow-sm">
 <h3 className="font-bold text-foreground mb-4 border-b border-border pb-2">Company Information</h3>
 <div className="text-sm">
 <DetailRow label="Industry" value={displayValue(drive.company?.industry)} />
 <DetailRow label="Website" value={companyWebsite ? <a className="text-primary hover:underline" href={companyWebsite} target="_blank" rel="noreferrer">Open website</a> : 'Not specified'} />
 <DetailRow label="HR contact" value={displayValue(drive.company?.hrName)} />
 <DetailRow label="HR email" value={drive.company?.hrEmail ? <a className="text-primary hover:underline" href={`mailto:${drive.company.hrEmail}`}>{drive.company.hrEmail}</a> : 'Not specified'} />
 </div>
 </Card>

 {(nominationUrl || attachments.some((attachment) => safeExternalUrl(attachment))) && (
 <Card className="p-6 border-border shadow-sm">
 <h3 className="font-bold text-foreground mb-4 border-b border-border pb-2">Links & Attachments</h3>
 <div className="space-y-2 text-sm">
 {nominationUrl && <a className="block text-primary hover:underline" href={nominationUrl} target="_blank" rel="noreferrer">Open nomination / registration link</a>}
 {attachments.map((attachment, index) => {
 const url = safeExternalUrl(attachment);
 return url ? <a key={`${attachment}-${index}`} className="block text-primary hover:underline" href={url} target="_blank" rel="noreferrer">Attachment {index + 1}</a> : null;
 })}
 </div>
 </Card>
 )}

 {(drive.specialInstructions || drive.remarks) && (
 <Card className="p-6 border-warning/30 bg-warning/5 shadow-sm">
 <h3 className="font-bold text-foreground mb-3">Important Instructions</h3>
 {drive.specialInstructions && <p className="text-sm text-foreground whitespace-pre-wrap">{drive.specialInstructions}</p>}
 {drive.remarks && <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{drive.remarks}</p>}
 </Card>
 )}
 </div>
 </div>
 </div>
 );
}
