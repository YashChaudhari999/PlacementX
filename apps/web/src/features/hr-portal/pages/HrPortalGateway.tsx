import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { Loading } from '@/components/common/Loading';
import { NotFound } from '@/components/common/NotFound';
import HrDriveWizard from './HrDriveWizard';
import RecruiterWorkspace from './RecruiterWorkspace';

export default function HrPortalGateway() {
 const { token } = useParams<{ token: string }>();
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [driveStatus, setDriveStatus] = useState<string | null>(null);

 useEffect(() => {
 const validateToken = async () => {
 try {
 setLoading(true);
 // validate endpoint returns drive data
 const response = await api.post('/hr/validate', { token });
 if (response.data.success) {
 setDriveStatus(response.data.data.drive.status);
 } else {
 setError(response.data.message || 'Invalid link');
 }
 } catch (err: any) {
 setError(err.response?.data?.message || 'Failed to validate link');
 } finally {
 setLoading(false);
 }
 };

 if (token) validateToken();
 }, [token]);

 if (loading) {
 return <Loading message="Validating secure link..."/>;
 }

 if (error) {
 return (
 <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6 text-center">
 <div className="bg-card p-8 rounded-xl shadow-sm border border-destructive/20 max-w-md">
 <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
 <p className="text-muted-foreground">{error}</p>
 </div>
 </div>
 );
 }

 // Route based on status
 if (['WAITING_FOR_HR', 'DRAFT'].includes(driveStatus || '')) {
 return <HrDriveWizard />;
 }

 if (['UNDER_REVIEW', 'SUBMITTED'].includes(driveStatus || '')) {
 return (
 <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6 text-center">
 <div className="bg-card p-8 rounded-xl shadow-sm border border-border max-w-md">
 <h1 className="text-2xl font-bold text-foreground mb-2">Under Review</h1>
 <p className="text-muted-foreground">
 Your drive details have been submitted and are currently being reviewed by the placement
 cell. Once approved, this link will transform into your recruiter workspace to manage
 candidates.
 </p>
 </div>
 </div>
 );
 }

 if (['ACTIVE', 'CLOSED', 'COMPLETED', 'PUBLISHED'].includes(driveStatus || '')) {
 return <RecruiterWorkspace token={token!} />;
 }

 return <NotFound />;
}
