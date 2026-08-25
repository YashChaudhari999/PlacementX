import React, { useState } from 'react';
import { Drawer, Tabs, Badge, Card, CardContent, Button, Skeleton } from '@/components/ui';
import type { TabItem } from '@/components/ui';
import { useAdminStudentDetails } from '@/hooks/queries/useAdmin';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Building2, ExternalLink, Calendar, GraduationCap, Briefcase, FileText, CheckCircle, XCircle } from 'lucide-react';

interface StudentDetailsDrawerProps {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentDetailsDrawer: React.FC<StudentDetailsDrawerProps> = ({ studentId, isOpen, onClose }) => {
  const { data, isLoading, isError } = useAdminStudentDetails(studentId || '');
  const [activeTab, setActiveTab] = useState('profile');

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    if (isError || !data) {
      return (
        <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
          <XCircle className="mb-4 h-12 w-12 text-destructive" />
          <p>Failed to load student details.</p>
        </div>
      );
    }

    const { importedData, isProvisioned, profile, applications } = data;

    const tabs: TabItem[] = [
      { key: 'profile', label: 'Profile' },
      { key: 'academic', label: 'Academic' },
      { key: 'applications', label: 'Applications' },
    ];

    if (isProvisioned) {
      tabs.push({ key: 'verification', label: 'Verification & Offers' });
    }

    return (
      <div className="flex h-full flex-col">
        {/* Header Section */}
        <div className="flex items-start gap-4 pb-6 border-b">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
            {importedData?.fullName?.charAt(0) || 'S'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{importedData?.fullName}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> {importedData?.studentId}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {importedData?.department}</span>
            </div>
          </div>
          <Badge variant={isProvisioned ? 'success' : 'warning'}>
            {isProvisioned ? 'Provisioned' : 'Imported Only'}
          </Badge>
        </div>

        <div className="mt-4">
          <Tabs items={tabs} activeKey={activeTab} onChange={setActiveTab} />
        </div>

        <div className="mt-4 flex-1 overflow-y-auto pb-8 pr-2">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{importedData?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile?.phone || importedData?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile?.address || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isProvisioned && profile?.skills?.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Briefcase className="h-5 w-5" /> Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {isProvisioned && profile?.resumeUrl && (
                <div className="flex justify-start">
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Resume
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Academic Tab */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{profile?.cgpa || importedData?.cgpa || 'N/A'}</span>
                    <span className="text-sm text-muted-foreground mt-1">CGPA</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-destructive">{profile?.activeBacklogs || importedData?.activeBacklogs || 0}</span>
                    <span className="text-sm text-muted-foreground mt-1">Active Backlogs</span>
                  </CardContent>
                </Card>
              </div>

              {isProvisioned && profile && (
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Past Education</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">10th Percentage</span>
                        <span className="font-medium">{profile.tenthPercentage ? `${profile.tenthPercentage}%` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">12th Percentage</span>
                        <span className="font-medium">{profile.twelfthPercentage ? `${profile.twelfthPercentage}%` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Year Gap</span>
                        <span className="font-medium">{profile.yearGap} Years</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {!isProvisioned ? (
                <div className="text-center py-8 text-muted-foreground">
                  Student needs to be provisioned to track applications.
                </div>
              ) : applications?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No applications found for this student.
                </div>
              ) : (
                applications?.map((app: any) => (
                  <Card key={app.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{app.drive?.company?.name || app.drive?.companyName || 'Company'}</h4>
                          <p className="text-sm text-muted-foreground">{app.drive?.jobRole || 'SDE'}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(app.appliedAt), 'PP')}
                          </div>
                        </div>
                        <Badge variant={
                          app.status === 'OFFERED' ? 'success' :
                          app.status === 'REJECTED' ? 'destructive' : 'default'
                        }>
                          {app.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Verification & Offers Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-4">Profile Verification</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {profile?.profileStatus === 'VERIFIED' ? 'Verified by Placement Cell' : 
                         profile?.profileStatus === 'PENDING' ? 'Pending Review' : 'Not Complete'}
                      </p>
                    </div>
                    {profile?.profileStatus === 'VERIFIED' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Badge variant="warning">{profile?.profileStatus}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-4">Placement Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium mt-1">{importedData?.placementStatus || 'Unplaced'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fixed Salary</p>
                      <p className="font-medium mt-1">{importedData?.fixedSalaryLpa ? `${importedData.fixedSalaryLpa} LPA` : '-'}</p>
                    </div>
                    <div className="col-span-2 border-t pt-2 mt-2">
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="font-medium mt-1">{importedData?.companyName || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title=""
      className="!w-[800px] !max-w-[90vw]"
      side="right"
    >
      {renderContent()}
    </Drawer>
  );
};
