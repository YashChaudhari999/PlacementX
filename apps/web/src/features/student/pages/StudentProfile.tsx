import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input } from '@/components/ui';
import { User, FileText, GraduationCap } from 'lucide-react';
import { useStudentProfile, useUpdateStudentProfile } from '@/hooks/queries/useStudent';
import { ProfileSkeleton } from '@/components/common/Skeletons';
import { toast } from 'sonner';

export default function StudentProfile() {
  const { user, updateUser } = useAuthStore();
  const { data: serverProfile, isPending } = useStudentProfile(user?.id);
  const updateProfileMutation = useUpdateStudentProfile();
  const [activeTab, setActiveTab] = useState('personal');

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    branch: '',
    cgpa: '',
    passingYear: '',
    activeBacklogs: '0',
    yearGap: '0',
    nationality: 'Indian',
    gender: 'Male',
    resumeUrl: '',
    portfolioUrl: '',
    githubUrl: '',
  });

  useEffect(() => {
    if (serverProfile) {
      setProfile({
        ...serverProfile,
        cgpa: serverProfile.cgpa?.toString() || '',
        passingYear: serverProfile.passingYear?.toString() || '',
        activeBacklogs: serverProfile.activeBacklogs?.toString() || '0',
        yearGap: serverProfile.yearGap?.toString() || '0',
      });
    }
  }, [serverProfile]);

  const handleSave = () => {
    if (!user) return;
    updateProfileMutation.mutate({ userId: user.id, data: profile }, {
      onSuccess: () => {
        updateUser({ 
          firstName: profile.firstName, 
          lastName: profile.lastName,
          isProfileComplete: true 
        });
      }
    });
  };

  if (isPending) return <ProfileSkeleton />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-500">Manage your personal and academic information.</p>
        </div>
        <Button 
          onClick={handleSave} 
          className="shadow-sm" 
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100 px-2 pt-2 bg-slate-50">
          {[
            { id: 'personal', label: 'Personal Info', icon: User },
            { id: 'academic', label: 'Academic Details', icon: GraduationCap },
            { id: 'documents', label: 'Links & Resumes', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-t-xl transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary border-t-2 border-t-primary shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.02)]'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">First Name</label>
                <Input value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Last Name</label>
                <Input value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} placeholder="Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <Input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Gender</label>
                <select 
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={profile.gender}
                  onChange={e => setProfile({...profile, gender: e.target.value})}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Branch / Specialization</label>
                <Input value={profile.branch} onChange={e => setProfile({...profile, branch: e.target.value})} placeholder="Computer Science" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">CGPA</label>
                <Input type="number" step="0.01" value={profile.cgpa} onChange={e => setProfile({...profile, cgpa: e.target.value})} placeholder="8.5" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Passing Year</label>
                <Input type="number" value={profile.passingYear} onChange={e => setProfile({...profile, passingYear: e.target.value})} placeholder="2025" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Active Backlogs</label>
                <Input type="number" value={profile.activeBacklogs} onChange={e => setProfile({...profile, activeBacklogs: e.target.value})} />
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="col-span-full space-y-2">
                <label className="text-sm font-semibold text-slate-700">Resume Link (Google Drive / DropBox)</label>
                <Input value={profile.resumeUrl} onChange={e => setProfile({...profile, resumeUrl: e.target.value})} placeholder="https://drive.google.com/..." />
                <p className="text-xs text-slate-500 mt-1">Make sure the link is set to "Anyone with the link can view".</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">GitHub Profile</label>
                <Input value={profile.githubUrl} onChange={e => setProfile({...profile, githubUrl: e.target.value})} placeholder="https://github.com/username" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Portfolio Website</label>
                <Input value={profile.portfolioUrl} onChange={e => setProfile({...profile, portfolioUrl: e.target.value})} placeholder="https://myportfolio.com" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
