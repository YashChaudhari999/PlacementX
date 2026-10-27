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
        if (response.data.success && response.data.data?.drive) {
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
    return <Loading message="Validating secure link..." />;
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
  // 1. Initial creation / draft / HR input needed
  if (
    [
      'WAITING_FOR_HR',
      'HR_SUBMISSION_PENDING',
      'DRAFT',
      'CHANGES_REQUESTED',
    ].includes(driveStatus || '')
  ) {
    return <HrDriveWizard />;
  }

  // 2. Drive submitted by HR and under admin review
  if (['UNDER_REVIEW', 'SUBMITTED', 'ADMIN_REVIEW'].includes(driveStatus || '')) {
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

  // 3. Approved / active / ongoing recruitment workspace
  if (
    [
      'ACTIVE',
      'CLOSED',
      'COMPLETED',
      'PUBLISHED',
      'APPROVED',
      'IN_PROGRESS',
      'APPLICATIONS_CLOSED',
    ].includes(driveStatus || '')
  ) {
    return <RecruiterWorkspace token={token!} />;
  }

  // 4. Inactive / Cancelled / Rejected
  if (['REJECTED', 'CANCELLED', 'SUSPENDED'].includes(driveStatus || '')) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6 text-center">
        <div className="bg-card p-8 rounded-xl shadow-sm border border-destructive/20 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">Drive Inactive</h1>
          <p className="text-muted-foreground">
            This placement drive is currently{' '}
            {driveStatus?.toLowerCase().replace(/_/g, ' ')}. Please contact the placement cell for
            assistance.
          </p>
        </div>
      </div>
    );
  }

  return <NotFound />;
}
