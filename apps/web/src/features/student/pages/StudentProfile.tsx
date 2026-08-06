import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input } from '@/components/ui';
import { User, FileText, GraduationCap, CheckCircle, Save, ExternalLink } from 'lucide-react';
import { useStudentProfile, useUpdateStudentProfile } from '@/hooks/queries/useStudent';
import { ProfileSkeleton } from '@/components/common/Skeletons';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function StudentProfile() {
  const { user, updateUser } = useAuthStore();
  const { data: serverProfile, isPending } = useStudentProfile(user?.id);
  const updateProfileMutation = useUpdateStudentProfile();
  const [activeTab, setActiveTab] = useState('personal');
  const [completionPercentage, setCompletionPercentage] = useState(0);

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

  useEffect(() => {
    // Calculate profile completion
    const requiredFields = ['firstName', 'lastName', 'phone', 'branch', 'cgpa', 'passingYear'];
    let filled = 0;
    requiredFields.forEach(field => {
      if (profile[field as keyof typeof profile]) filled++;
    });
    // Add points for optional fields
    if (profile.resumeUrl) filled += 1;
    if (profile.githubUrl) filled += 0.5;
    if (profile.portfolioUrl) filled += 0.5;

    const percentage = Math.min(Math.round((filled / 8) * 100), 100);
    setCompletionPercentage(percentage);
  }, [profile]);

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

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'academic', label: 'Academic Details', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { id: 'documents', label: 'Links & Resumes', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-100' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 p-4 md:p-6 pb-32"
    >
      {/* Header Profile Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        {/* Circular Progress */}
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
            <motion.circle 
              cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
              strokeLinecap="round"
              className={completionPercentage === 100 ? "text-emerald-500" : "text-blue-600"}
              initial={{ strokeDasharray: "0 1000" }}
              animate={{ strokeDasharray: `${(completionPercentage / 100) * 283} 1000` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-slate-800">{completionPercentage}%</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Complete</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}` : 'Complete your profile'}
          </h1>
          <p className="text-lg text-slate-500 mb-4">{user?.email}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {completionPercentage === 100 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-bold border border-emerald-200">
                <CheckCircle className="w-4 h-4" /> Ready for placement drives
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold border border-amber-200">
                Action Required: Complete all fields
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Modern Tab Navigation */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 whitespace-nowrap ${
                  isActive ? 'text-slate-900 bg-white shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? tab.bg : 'bg-transparent'} ${isActive ? tab.color : 'text-slate-400'}`}>
                  <tab.icon className="w-4 h-4" />
                </div>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-8 md:p-10 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">First Name</label>
                    <Input 
                      value={profile.firstName} 
                      onChange={e => setProfile({...profile, firstName: e.target.value})} 
                      placeholder="John" 
                      className="h-12 bg-slate-50/50 focus:bg-white text-lg rounded-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Last Name</label>
                    <Input 
                      value={profile.lastName} 
                      onChange={e => setProfile({...profile, lastName: e.target.value})} 
                      placeholder="Doe" 
                      className="h-12 bg-slate-50/50 focus:bg-white text-lg rounded-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                    <Input 
                      value={profile.phone} 
                      onChange={e => setProfile({...profile, phone: e.target.value})} 
                      placeholder="+91 9876543210" 
                      className="h-12 bg-slate-50/50 focus:bg-white text-lg rounded-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Gender</label>
                    <select 
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all focus:bg-white"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Branch / Specialization</label>
                    <Input 
                      value={profile.branch} 
                      onChange={e => setProfile({...profile, branch: e.target.value})} 
                      placeholder="Computer Science" 
                      className="h-12 bg-slate-50/50 focus:bg-white text-lg rounded-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">CGPA</label>
                    <Input 
                      type="number" step="0.01" 
                      value={profile.cgpa} 
                      onChange={e => setProfile({...profile, cgpa: e.target.value})} 
                      placeholder="8.5" 
                      className="h-12 bg-slate-50/50 focus:bg-white text-lg rounded-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Passing Year</label>
                    <Input 
                      type="number" 
                      value={profile.passingYear} 
                      onChange={e => setProfile({...profile, passingYear: e.target.value})} 
                      placeholder="2025" 
                      className="h-12 bg-slate-50/50 focus:bg-white text-lg rounded-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Active Backlogs</label>
                    <Input 
                      type="number" 
                      value={profile.activeBacklogs} 
                      onChange={e => setProfile({...profile, activeBacklogs: e.target.value})} 
                      className="h-12 bg-slate-50/50 focus:bg-white text-lg rounded-xl"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="col-span-full space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      Resume Link <span className="text-xs font-medium text-slate-400 normal-case">(Google Drive / DropBox)</span>
                    </label>
                    <div className="relative">
                      <Input 
                        value={profile.resumeUrl} 
                        onChange={e => setProfile({...profile, resumeUrl: e.target.value})} 
                        placeholder="https://drive.google.com/..." 
                        className="h-12 bg-slate-50/50 focus:bg-white text-lg rounded-xl pl-4 pr-12"
                      />
                      {profile.resumeUrl && (
                        <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">GitHub Profile</label>
                    <Input 
                      value={profile.githubUrl} 
                      onChange={e => setProfile({...profile, githubUrl: e.target.value})} 
                      placeholder="https://github.com/username" 
                      className="h-12 bg-slate-50/50 focus:bg-white text-lg rounded-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Portfolio Website</label>
                    <Input 
                      value={profile.portfolioUrl} 
                      onChange={e => setProfile({...profile, portfolioUrl: e.target.value})} 
                      placeholder="https://myportfolio.com" 
                      className="h-12 bg-slate-50/50 focus:bg-white text-lg rounded-xl"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Button for Save */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:-translate-x-0 md:right-8 lg:right-12 z-50"
      >
        <Button 
          onClick={handleSave} 
          disabled={updateProfileMutation.isPending}
          className="h-14 px-8 rounded-full shadow-2xl shadow-blue-500/30 bg-slate-900 hover:bg-blue-600 text-white font-bold text-lg flex items-center gap-3 transition-all hover:scale-105"
        >
          {updateProfileMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {updateProfileMutation.isPending ? 'Saving Profile...' : 'Save Changes'}
        </Button>
      </motion.div>
    </motion.div>
  );
}
