import { useState, useEffect, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Card, Button, Modal } from '@/components/ui';
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
 ViewIcon,
} from 'hugeicons-react';

import { DashboardSkeleton } from '@/components/common/Skeletons';

const formatReviewDate = (value?: string | Date | null) => {
 if (!value) return 'Not provided';
 const date = new Date(value);
 return Number.isNaN(date.getTime())
 ? 'Not provided'
 : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatBranches = (value?: string | null) => {
 if (!value) return 'Not provided';
 try {
 const branches = JSON.parse(value);
 return Array.isArray(branches) && branches.length ? branches.join(', ') : 'Not provided';
 } catch {
 return value;
 }
};

function ReviewSection({ title, number, children }: { title: string; number: string; children: ReactNode }) {
 return (
 <section>
 <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
 <span className="text-xs font-bold tracking-widest text-primary">{number}</span>
 <h4 className="text-base font-bold text-foreground">{title}</h4>
 </div>
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
 </section>
 );
}

function ReviewField({ label, value, wide = false }: { label: string; value: ReactNode; wide?: boolean }) {
 const hasValue = value !== null && value !== undefined && value !== '';
 return (
 <div className={`rounded-lg border border-border/70 bg-card p-4 ${wide ? 'md:col-span-2' : ''}`}>
 <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
 <div className="mt-1.5 whitespace-pre-wrap break-words text-sm font-medium text-foreground">
 {hasValue ? value : <span className="font-normal text-muted-foreground">Not provided</span>}
 </div>
 </div>
 );
}

export default function AdminEventDetails() {
 const { id } = useParams();
 const [drive, setDrive] = useState<any>(null);
 const [applications, setApplications] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [isReviewOpen, setIsReviewOpen] = useState(false);
 const [hrLink, setHrLink] = useState('');
 const [generatingHrLink, setGeneratingHrLink] = useState(false);

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
 await fetchData();
 return true;
 } catch (error: any) {
 console.error(error);
 const details = error?.response?.data?.errors;
 const message = Array.isArray(details) && details.length
 ? `${error?.response?.data?.message || 'Drive is incomplete'}: ${details.join(', ')}`
 : error?.response?.data?.message || `Failed to ${action} drive`;
 toast.error(message);
 return false;
 }
 };

 const completeReview = async (action: 'approve' | 'reject' | 'request-changes') => {
 const succeeded = await handleDriveReview(action);
 if (succeeded) setIsReviewOpen(false);
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

 const handleGenerateHrLink = async () => {
 try {
 setGeneratingHrLink(true);
 const response = await api.post(`/admin/drives/${id}/hr-link`);
 const link = `${window.location.origin}/hr-drive/${response.data.data.secureToken}`;
 setHrLink(link);
 await navigator.clipboard.writeText(link);
 toast.success('New secure HR link copied to clipboard');
 } catch (error: any) {
 console.error(error);
 toast.error(error?.response?.data?.message || 'Failed to generate HR link');
 } finally {
 setGeneratingHrLink(false);
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
 <ArrowLeft01Icon className="w-6 h-6"/>
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
 <Note01Icon className="w-4 h-4 mr-2"/> Edit Drive Details
 </Button>
 </Link>
 </div>
 </div>

 {['SUBMITTED', 'ADMIN_REVIEW'].includes(drive.status) && (
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
 onClick={() => setIsReviewOpen(true)}
 variant="outline"
 className="border-info/30 bg-card text-info hover:bg-info/10"
 >
 <ViewIcon className="w-4 h-4 mr-2"/> Review Submission
 </Button>
 <Button
 onClick={() => handleDriveReview('reject')}
 variant="outline"
 className="border-destructive/20 text-destructive hover:bg-destructive/10"
 >
 <CancelCircleIcon className="w-4 h-4 mr-2"/> Reject
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
 <Tick02Icon className="w-4 h-4 mr-2"/> Approve & Publish
 </Button>
 </div>
 </div>
 </Card>
 )}

 <Modal
 isOpen={isReviewOpen}
 onClose={() => setIsReviewOpen(false)}
 title="Review HR Submission"
 description={`Verify every detail submitted by ${drive.company?.hrName || 'HR'} before publishing this drive.`}
 size="xl"
 className="max-w-5xl max-h-[92vh] overflow-hidden"
 footer={
 <div className="flex w-full flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
 <Button variant="ghost" onClick={() => setIsReviewOpen(false)}>Close Review</Button>
 <div className="flex flex-col sm:flex-row gap-3">
 <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => completeReview('reject')}>
 <CancelCircleIcon className="w-4 h-4 mr-2"/> Reject
 </Button>
 <Button variant="outline" className="border-warning/30 text-warning hover:bg-warning/10" onClick={() => completeReview('request-changes')}>
 Request Changes
 </Button>
 <Button className="bg-success text-white hover:bg-success/90" onClick={() => completeReview('approve')}>
 <Tick02Icon className="w-4 h-4 mr-2"/> Approve & Publish
 </Button>
 </div>
 </div>
 }
 >
 <div className="max-h-[calc(92vh-14rem)] overflow-y-auto pr-2 pb-2">
 <div className="mb-6 flex flex-col gap-4 rounded-xl border border-info/20 bg-info/5 p-5 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-widest text-info">Submission ready for review</p>
 <h3 className="mt-1 text-xl font-bold text-foreground">{drive.driveTitle || drive.jobRole}</h3>
 <p className="mt-1 text-sm text-muted-foreground">{drive.company?.name} · {drive.academicYear || 'Academic year not set'}</p>
 </div>
 <span className="w-fit rounded-full border border-info/20 bg-card px-3 py-1 text-xs font-bold text-info">{drive.status.replaceAll('_', ' ')}</span>
 </div>

 <div className="space-y-8">
 <ReviewSection title="Company information" number="01">
 <ReviewField label="Company name" value={drive.company?.name}/>
 <ReviewField label="Industry" value={drive.company?.industry}/>
 <ReviewField label="HR name" value={drive.company?.hrName}/>
 <ReviewField label="HR email" value={drive.company?.hrEmail}/>
 <ReviewField label="Website" value={drive.company?.website}/>
 <ReviewField label="Company location" value={drive.company?.location}/>
 <ReviewField label="Company description" value={drive.company?.description || drive.company?.profile} wide/>
 </ReviewSection>

 <ReviewSection title="Job details" number="02">
 <ReviewField label="Drive title" value={drive.driveTitle}/>
 <ReviewField label="Job role" value={drive.jobRole}/>
 <ReviewField label="Employment type" value={drive.employmentType}/>
 <ReviewField label="Work mode" value={drive.workMode}/>
 <ReviewField label="Location" value={drive.location}/>
 <ReviewField label="Vacancies" value={drive.vacancies}/>
 <ReviewField label="Fixed CTC" value={drive.fixedSalary != null ? `${drive.fixedSalary} LPA` : null}/>
 <ReviewField label="Variable salary" value={drive.variableSalary != null ? `${drive.variableSalary} LPA` : null}/>
 <ReviewField label="Internship stipend" value={drive.internshipStipend}/>
 <ReviewField label="PPO available" value={drive.ppoAvailable ? 'Yes' : 'No'}/>
 <ReviewField label="Job description" value={drive.jobDescription} wide/>
 <ReviewField label="Bond details" value={drive.bondDetails} wide/>
 </ReviewSection>

 <ReviewSection title="Eligibility criteria" number="03">
 <ReviewField label="Eligible branches" value={formatBranches(drive.eligibleBranches)} wide/>
 <ReviewField label="Minimum CGPA" value={drive.minimumCgpa}/>
 <ReviewField label="Passing year" value={drive.passingYear}/>
 <ReviewField label="Active backlogs allowed" value={drive.activeBacklogsAllowed}/>
 <ReviewField label="Education gap allowed" value={drive.yearGapAllowed}/>
 <ReviewField label="Maximum live offers" value={drive.maximumLiveOffers}/>
 <ReviewField label="Gender restriction" value={drive.genderRestriction || 'Any'}/>
 <ReviewField label="Resume mandatory" value={drive.resumeMandatory ? 'Yes' : 'No'}/>
 </ReviewSection>

 <ReviewSection title="Registration timeline" number="04">
 <ReviewField label="Registration starts" value={formatReviewDate(drive.registrationStart)}/>
 <ReviewField label="Registration ends" value={formatReviewDate(drive.registrationEnd)}/>
 <ReviewField label="Application deadline" value={formatReviewDate(drive.applicationDeadline)}/>
 <ReviewField label="Maximum applicants" value={drive.maximumApplicants ?? 'Unlimited'}/>
 <ReviewField label="Expected drive date" value={formatReviewDate(drive.expectedDriveDate)}/>
 <ReviewField label="Nomination link" value={drive.nominationLink}/>
 </ReviewSection>

 <ReviewSection title="Selection process" number="05">
 {drive.selectionRounds?.length ? drive.selectionRounds.map((round: any, index: number) => (
 <div key={round.id || index} className="md:col-span-2 rounded-lg border border-border bg-muted/40 p-4">
 <div className="flex items-start gap-3">
 <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span>
 <div>
 <p className="font-semibold text-foreground">{round.title || `Round ${index + 1}`}</p>
 <p className="mt-1 text-sm text-muted-foreground">{[formatReviewDate(round.date), round.time, round.duration, round.venue].filter((value) => value && value !== 'Not provided').join(' · ') || 'No schedule details provided'}</p>
 {round.instructions && <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{round.instructions}</p>}
 </div>
 </div>
 </div>
 )) : <ReviewField label="Selection rounds" value="No rounds submitted" wide/>}
 </ReviewSection>

 <ReviewSection title="Additional information" number="06">
 <ReviewField label="Required skills" value={drive.requiredSkills} wide/>
 <ReviewField label="Preferred skills" value={drive.preferredSkills} wide/>
 <ReviewField label="Technology stack" value={drive.technologyStack} wide/>
 <ReviewField label="Benefits" value={drive.benefits} wide/>
 <ReviewField label="Special instructions" value={drive.specialInstructions} wide/>
 <ReviewField label="Remarks" value={drive.remarks} wide/>
 <ReviewField label="Attachments" value={drive.attachments} wide/>
 </ReviewSection>
 </div>
 </div>
 </Modal>

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
 <Tick02Icon className="w-4 h-4 mr-2"/> Publish Drive
 </Button>
 </div>
 </div>
 </Card>
 )}

 {drive.hrInvitations && drive.hrInvitations.length > 0 && !['COMPLETED', 'CANCELLED'].includes(drive.status) && (
 <Card className="p-6 bg-primary/5 border-primary/20">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h3 className="text-lg font-bold text-primary">HR Portal Link</h3>
 <p className="text-sm text-primary/80 mt-1">
 Generate a secure link for HR. It remains valid until the drive is completed or cancelled.
 </p>
 {hrLink && <div className="mt-3 bg-card px-4 py-2 rounded-md border border-border flex items-center gap-3">
 <span className="text-sm font-mono text-muted-foreground select-all">
 {hrLink}
 </span>
 <Button
 size="sm"
 variant="ghost"
 className="h-8 hover:bg-muted text-primary"
 onClick={() => {
 navigator.clipboard.writeText(hrLink);
 toast.success('Link copied to clipboard');
 }}
 >
 <Copy01Icon className="w-4 h-4"/>
 </Button>
 </div>}
 </div>
 <Button onClick={handleGenerateHrLink} disabled={generatingHrLink}>
 {generatingHrLink ? 'Generating...' : 'Generate New Link'}
 </Button>
 </div>
 </Card>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Drive Info Sidebar */}
 <div className="lg:col-span-1 space-y-6">
 <Card className="p-6">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground">
 <Building02Icon className="w-6 h-6"/>
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
 <Briefcase01Icon className="w-4 h-4"/> {drive.jobRole}
 </div>
 <div className="flex items-center gap-2">
 <Location01Icon className="w-4 h-4"/> {drive.workMode}
 </div>
 <div className="flex items-center gap-2">
 <Money01Icon className="w-4 h-4"/> {drive.fixedSalary} LPA
 </div>
 <div className="flex items-center gap-2">
 <UserMultipleIcon className="w-4 h-4"/> {drive.vacancies || 'TBD'} Vacancies
 </div>
 <div className="flex items-center gap-2">
 <Calendar01Icon className="w-4 h-4"/> Closes{' '}
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
 <div className="bg-primary/40 h-2 rounded-full"style={{ width: '100%' }}></div>
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
 <Card className="p-6 mb-6">
 <h3 className="font-bold text-foreground mb-4">Submitted Drive Information</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div className="md:col-span-2">
 <p className="text-muted-foreground mb-1">Job Description</p>
 <p className="text-foreground whitespace-pre-wrap">{drive.jobDescription || 'Not provided'}</p>
 </div>
 <div><span className="text-muted-foreground">Minimum CGPA: </span><span>{drive.minimumCgpa ?? 'Not specified'}</span></div>
 <div><span className="text-muted-foreground">Passing Year: </span><span>{drive.passingYear ?? 'Not specified'}</span></div>
 <div><span className="text-muted-foreground">Active Backlogs Allowed: </span><span>{drive.activeBacklogsAllowed ?? 'Not specified'}</span></div>
 <div><span className="text-muted-foreground">Year Gap Allowed: </span><span>{drive.yearGapAllowed ?? 'Not specified'}</span></div>
 <div><span className="text-muted-foreground">Maximum Applicants: </span><span>{drive.maximumApplicants ?? 'Unlimited'}</span></div>
 <div><span className="text-muted-foreground">Employment Type: </span><span>{drive.employmentType || 'Not specified'}</span></div>
 <div className="md:col-span-2"><span className="text-muted-foreground">Eligible Branches: </span><span>{(() => { try { return JSON.parse(drive.eligibleBranches || '[]').join(', ') || 'Not specified'; } catch { return drive.eligibleBranches || 'Not specified'; } })()}</span></div>
 {drive.company?.description && <div className="md:col-span-2"><p className="text-muted-foreground mb-1">Company Description</p><p className="whitespace-pre-wrap">{drive.company.description}</p></div>}
 </div>
 {drive.selectionRounds?.length > 0 && (
 <div className="mt-6 pt-4 border-t border-border">
 <p className="font-semibold mb-3">Selection Rounds</p>
 <div className="space-y-2">{drive.selectionRounds.map((round: any, index: number) => <div key={round.id} className="p-3 rounded-md bg-muted"><span className="font-medium">{index + 1}. {round.title}</span>{round.date && <span className="text-muted-foreground"> · {new Date(round.date).toLocaleDateString('en-GB')}</span>}{round.duration && <span className="text-muted-foreground"> · {round.duration}</span>}</div>)}</div>
 </div>
 )}
 </Card>
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
 <Note01Icon className="w-4 h-4"/> View
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
