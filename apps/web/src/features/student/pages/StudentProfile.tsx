import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input } from '@/components/ui';
import { UserIcon, Note01Icon, Mortarboard01Icon, Tick02Icon, FloppyDiskIcon, Link02Icon, Alert02Icon, Edit02Icon, CallIcon, Calendar01Icon, Location01Icon, Flag01Icon, Briefcase01Icon, Link01Icon, CodeIcon, Award01Icon, BookOpen01Icon, Clock01Icon, Building01Icon, HashtagIcon, LanguageSkillIcon, FileAddIcon, UserCircleIcon, Cancel01Icon, PlusSignIcon, TickDouble02Icon, Shield01Icon, DatabaseIcon, CloudIcon, Wrench01Icon, ComputerIcon, GlobalIcon, PlayCircleIcon, DashboardSquare01Icon, Globe02Icon, Camera01Icon } from 'hugeicons-react';
import {
  useStudentProfile,
  useUpdateStudentProfile,
  useUpdateStudentPhoto,
  useStudentProfileStatus,
  useRequestProfileUpdate,
} from '@/hooks/queries/useStudent';
import { ProfileSkeleton } from '@/components/common/Skeletons';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase/config/firebaseApp';

const SectionCard = ({ title, icon: Icon, children }: any) => (
  <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-lg shadow-slate-200/40 transition-all duration-300 hover:shadow-xl hover:border-indigo-200 group">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100/50 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, icon: Icon, children, labelEnd }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="flex-1 flex justify-between items-center">
        {label}
        {labelEnd && (
          <span className="text-[10px] normal-case font-medium text-slate-400">{labelEnd}</span>
        )}
      </span>
    </label>
    {children}
  </div>
);

const TagInput = ({ tags, setTags, placeholder, disabled, label }: any) => {
  const [input, setInput] = useState('');
  const addTag = (e: any) => {
    e.preventDefault();
    if (input.trim() && !tags.includes(input.trim())) {
      setTags([...tags, input.trim()]);
      setInput('');
    }
  };
  const removeTag = (tagToRemove: string) => {
    if (disabled) return;
    setTags(tags.filter((t: string) => t !== tagToRemove));
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag: string) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium"
          >
            {tag}
            {!disabled && (
              <button
                onClick={() => removeTag(tag)}
                className="hover:bg-blue-200 p-0.5 rounded-full transition-colors"
              >
                <Cancel01Icon className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <form onSubmit={addTag} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 h-12 bg-white focus:bg-white text-lg rounded-xl border-slate-200"
          />
          <Button type="submit" variant="outline" className="h-12 px-4 rounded-xl shrink-0">
            <PlusSignIcon className="w-4 h-4 mr-2" /> Add
          </Button>
        </form>
      )}
    </div>
  );
};

export default function StudentProfile() {
  const { user, updateUser } = useAuthStore();
  const { data: serverProfile, isPending } = useStudentProfile(user?.id);
  const updateProfileMutation = useUpdateStudentProfile();
  const requestUpdateMutation = useRequestProfileUpdate();
  const { data: statusData } = useStudentProfileStatus();
  const updatePhotoMutation = useUpdateStudentPhoto();

  const [activeTab, setActiveTab] = useState('personal');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [updateReason, setUpdateReason] = useState('');
  const [uploadingMarkings, setUploadingMarkings] = useState<Record<number, boolean>>({});

  const profileStatus = statusData?.status || 'NOT_COMPLETED';
  const isReadOnly =
    profileStatus === 'PENDING_VERIFICATION' ||
    profileStatus === 'UPDATE_REQUESTED' ||
    (profileStatus === 'VERIFIED' && !isEditing);

  useEffect(() => {
    if (statusData?.status && user && user.profileStatus !== statusData.status) {
      updateUser({ profileStatus: statusData.status });
    }
  }, [statusData?.status, user, updateUser]);

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
    photoUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    dateOfBirth: '',
    address: '',
    alternatePhone: '',
    category: '',
    tenthBoard: '',
    tenthYear: '',
    tenthPercentage: '',
    twelfthBoard: '',
    twelfthYear: '',
    twelfthPercentage: '',
    diplomaBoard: '',
    diplomaYear: '',
    diplomaPercentage: '',
    currentSemester: '',
    totalBacklogs: '0',
    certifications: [] as any[],
    experience: [] as any[],
    languages: [] as any[],
    skills: [] as string[],
    programmingLanguages: [] as string[],
    codingProfiles: [] as any[],
    projects: [] as any[],
    frameworks: [] as string[],
    databases: [] as string[],
    tools: [] as string[],
    semesterMarks: [] as any[],
  });

  useEffect(() => {
    if (serverProfile) {
      setProfile({
        ...serverProfile,
        photoUrl: serverProfile.photoUrl || '',
        cgpa: serverProfile.cgpa?.toString() || '',
        passingYear: serverProfile.passingYear?.toString() || '',
        activeBacklogs: serverProfile.activeBacklogs?.toString() || '0',
        yearGap: serverProfile.yearGap?.toString() || '0',
        dateOfBirth: serverProfile.dateOfBirth
          ? new Date(serverProfile.dateOfBirth).toISOString().split('T')[0]
          : '',
        tenthYear: serverProfile.tenthYear?.toString() || '',
        tenthPercentage: serverProfile.tenthPercentage?.toString() || '',
        twelfthYear: serverProfile.twelfthYear?.toString() || '',
        twelfthPercentage: serverProfile.twelfthPercentage?.toString() || '',
        diplomaYear: serverProfile.diplomaYear?.toString() || '',
        diplomaPercentage: serverProfile.diplomaPercentage?.toString() || '',
        currentSemester: serverProfile.currentSemester?.toString() || '',
        totalBacklogs: serverProfile.totalBacklogs?.toString() || '0',
        skills: serverProfile.skills || [],
        programmingLanguages: serverProfile.programmingLanguages || [],
        codingProfiles: serverProfile.codingProfiles || [],
        projects: serverProfile.projects || [],
        experience: serverProfile.experience || [],
        certifications: serverProfile.certifications || [],
        languages: serverProfile.languages || [],
        semesterMarks: serverProfile.semesterMarks || [],
      });
    }
  }, [serverProfile]);

  useEffect(() => {
    // Calculate profile completion
    const requiredFields = ['firstName', 'lastName', 'phone', 'branch', 'cgpa', 'passingYear'];
    let filled = 0;
    requiredFields.forEach((field) => {
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
    if (profileStatus === 'VERIFIED' && isEditing) {
      if (!updateReason.trim()) {
        toast.error('Please provide a reason for the update');
        return;
      }
      requestUpdateMutation.mutate(
        { ...profile, reason: updateReason },
        {
          onSuccess: () => {
            setIsEditing(false);
            setUpdateReason('');
          },
        }
      );
    } else {
      updateProfileMutation.mutate(
        { userId: user.id, data: profile },
        {
          onSuccess: () => {
            updateUser({
              firstName: profile.firstName,
              lastName: profile.lastName,
              isProfileComplete: true,
            });
          },
        }
      );
    }
  };

  if (isPending) return <ProfileSkeleton />;

  const tabs = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: UserIcon,
      color: 'text-slate-500',
      bg: 'bg-slate-100',
    },
    {
      id: 'academic',
      label: 'Academics',
      icon: Mortarboard01Icon,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100',
    },
    {
      id: 'links',
      label: 'Links & Profiles',
      icon: Link01Icon,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
    },
    {
      id: 'skills',
      label: 'Technical Skills',
      icon: CodeIcon,
      color: 'text-indigo-500',
      bg: 'bg-indigo-100',
    },
    {
      id: 'languages',
      label: 'Languages',
      icon: LanguageSkillIcon,
      color: 'text-fuchsia-500',
      bg: 'bg-fuchsia-100',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: CodeIcon,
      color: 'text-orange-500',
      bg: 'bg-orange-100',
    },
    {
      id: 'experience',
      label: 'Experience',
      icon: Briefcase01Icon,
      color: 'text-rose-500',
      bg: 'bg-rose-100',
    },
    {
      id: 'certifications',
      label: 'Certifications',
      icon: Award01Icon,
      color: 'text-amber-500',
      bg: 'bg-amber-100',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 p-4 md:p-6 pb-32"
    >
      {/* Header Profile Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-900/5 border border-slate-200/60 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />

        {/* Circular Progress / Avatar Uploader */}
        <div className="relative w-32 h-32 shrink-0 group">
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90 z-0"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-slate-100"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className={completionPercentage === 100 ? 'text-emerald-500' : 'text-blue-600'}
              initial={{ strokeDasharray: '0 1000' }}
              animate={{ strokeDasharray: `${(completionPercentage / 100) * 301} 1000` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>

          <div className="absolute inset-2 rounded-full overflow-hidden bg-white flex items-center justify-center border border-slate-100 shadow-inner z-10">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-slate-800">
                  {completionPercentage}%
                </span>
                <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400">
                  Complete
                </span>
              </div>
            )}

            {!isReadOnly && (
              <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera01Icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && user) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const result = reader.result as string;
                        setProfile({ ...profile, photoUrl: result });
                        updatePhotoMutation.mutate({ userId: user.id, photoUrl: result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            {profile.firstName || profile.lastName
              ? `${profile.firstName} ${profile.lastName}`
              : 'Complete your profile'}
          </h1>
          <p className="text-lg text-slate-500 mb-4">{user?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {profileStatus === 'PENDING_VERIFICATION' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-bold border border-blue-200 shadow-sm">
                <Alert02Icon className="w-4 h-4" /> Pending Verification
              </span>
            )}
            {profileStatus === 'UPDATE_REQUESTED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold border border-amber-200 shadow-sm">
                <Alert02Icon className="w-4 h-4" /> Update Request Pending
              </span>
            )}
            {profileStatus === 'VERIFIED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-bold border border-emerald-200 shadow-sm">
                <Tick02Icon className="w-4 h-4" /> Verified Profile
              </span>
            )}
            {(profileStatus === 'NOT_COMPLETED' || profileStatus === 'UPDATE_REJECTED') && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold border border-amber-200 shadow-sm">
                Action Required: Complete your profile
              </span>
            )}
          </div>
        </div>
      </div>

      {profileStatus === 'VERIFIED' && !isEditing && (
        <div className="flex justify-end">
          <Button
            onClick={() => setIsEditing(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
          >
            <Edit02Icon className="w-4 h-4" /> Update Profile
          </Button>
        </div>
      )}

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6 shadow-inner"
        >
          <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
            <Alert02Icon className="w-4 h-4" /> Reason for Update (Required)
          </label>
          <Input
            value={updateReason}
            onChange={(e) => setUpdateReason(e.target.value)}
            placeholder="e.g. Updated my CGPA after 6th semester results"
            className="bg-white border-blue-200 shadow-sm"
          />
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Modern Tab Navigation */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-100 bg-slate-50/50 p-3 gap-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-6 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'text-slate-900 bg-white shadow-sm ring-1 ring-slate-200/50'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-colors ${isActive ? tab.bg : 'bg-slate-200/50'} ${isActive ? tab.color : 'text-slate-400'}`}
                >
                  <tab.icon className="w-4 h-4" />
                </div>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'personal' && (
                <div className="space-y-8">
                  <SectionCard title="Basic Identity" icon={UserIcon}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field label="First Name" icon={UserIcon}>
                        <Input
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          placeholder="John"
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                      <Field label="Last Name" icon={UserIcon}>
                        <Input
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          placeholder="Doe"
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                      <Field label="Date of Birth" icon={Calendar01Icon}>
                        <Input
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                      <Field label="Gender" icon={UserCircleIcon}>
                        <select
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70"
                          value={profile.gender}
                          onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                          disabled={isReadOnly}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </Field>
                    </div>
                  </SectionCard>

                  <SectionCard title="Contact Information" icon={CallIcon}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field label="CallIcon Number" icon={CallIcon}>
                        <Input
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="+91 9876543210"
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                      <Field label="Alternate CallIcon" icon={CallIcon}>
                        <Input
                          value={profile.alternatePhone}
                          onChange={(e) =>
                            setProfile({ ...profile, alternatePhone: e.target.value })
                          }
                          placeholder="+91 9876543210"
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                      <div className="col-span-full">
                        <Field label="Address" icon={Location01Icon}>
                          <textarea
                            value={profile.address}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            placeholder="Full Address"
                            disabled={isReadOnly}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-70 resize-none"
                          />
                        </Field>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {activeTab === 'academic' && (
                <div className="space-y-8">
                  {/* Current Degree */}
                  <SectionCard title="Current Degree" icon={Mortarboard01Icon}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Field label="Branch / Specialization" icon={BookOpen01Icon}>
                        <select
                          value={profile.branch}
                          onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                          disabled={isReadOnly}
                          className="w-full h-12 bg-white border border-slate-200 text-lg rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-70"
                        >
                          <option value="">Select Branch</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Computer Engineering">Computer Engineering</option>
                          <option value="AI/ML">AI/ML</option>
                        </select>
                      </Field>
                      <Field label="Current Semester" icon={Clock01Icon}>
                        <Input
                          type="number"
                          value={profile.currentSemester}
                          onChange={(e) =>
                            setProfile({ ...profile, currentSemester: e.target.value })
                          }
                          placeholder="e.g. 6"
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                      <Field label="CGPA" icon={Award01Icon}>
                        <Input
                          type="number"
                          step="0.01"
                          value={profile.cgpa}
                          onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                          placeholder="8.5"
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                      <Field label="Passing Year" icon={Calendar01Icon}>
                        <Input
                          type="number"
                          value={profile.passingYear}
                          onChange={(e) => setProfile({ ...profile, passingYear: e.target.value })}
                          placeholder="2025"
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                      <Field label="Active Backlogs" icon={Alert02Icon}>
                        <Input
                          type="number"
                          value={profile.activeBacklogs}
                          onChange={(e) =>
                            setProfile({ ...profile, activeBacklogs: e.target.value })
                          }
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                      <Field label="Total Backlogs" icon={Alert02Icon}>
                        <Input
                          type="number"
                          value={profile.totalBacklogs}
                          onChange={(e) =>
                            setProfile({ ...profile, totalBacklogs: e.target.value })
                          }
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                      <Field label="Year Gap" icon={Clock01Icon}>
                        <Input
                          type="number"
                          value={profile.yearGap}
                          onChange={(e) => setProfile({ ...profile, yearGap: e.target.value })}
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                    </div>
                  </SectionCard>

                  {/* Past Academics */}
                  <SectionCard title="Past Academics" icon={Building01Icon}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-8">
                      {/* 10th */}
                      <div className="space-y-5">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                          <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            10
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            10th Standard
                          </h4>
                        </div>
                        <Field label="Board" icon={Building01Icon}>
                          <Input
                            value={profile.tenthBoard}
                            onChange={(e) => setProfile({ ...profile, tenthBoard: e.target.value })}
                            placeholder="CBSE"
                            disabled={isReadOnly}
                            className="h-12 bg-white focus:bg-white rounded-xl disabled:opacity-70 border-slate-200"
                          />
                        </Field>
                        <Field label="Year" icon={Calendar01Icon}>
                          <Input
                            type="number"
                            value={profile.tenthYear}
                            onChange={(e) => setProfile({ ...profile, tenthYear: e.target.value })}
                            placeholder="2019"
                            disabled={isReadOnly}
                            className="h-12 bg-white focus:bg-white rounded-xl disabled:opacity-70 border-slate-200"
                          />
                        </Field>
                        <Field label="Percentage" icon={Award01Icon}>
                          <Input
                            type="number"
                            step="0.01"
                            value={profile.tenthPercentage}
                            onChange={(e) =>
                              setProfile({ ...profile, tenthPercentage: e.target.value })
                            }
                            placeholder="92.5"
                            disabled={isReadOnly}
                            className="h-12 bg-white focus:bg-white rounded-xl disabled:opacity-70 border-slate-200"
                          />
                        </Field>
                      </div>

                      {/* 12th */}
                      <div className="space-y-5">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                          <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                            12
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            12th Standard
                          </h4>
                        </div>
                        <Field label="Board" icon={Building01Icon}>
                          <Input
                            value={profile.twelfthBoard}
                            onChange={(e) =>
                              setProfile({ ...profile, twelfthBoard: e.target.value })
                            }
                            placeholder="CBSE"
                            disabled={isReadOnly}
                            className="h-12 bg-white focus:bg-white rounded-xl disabled:opacity-70 border-slate-200"
                          />
                        </Field>
                        <Field label="Year" icon={Calendar01Icon}>
                          <Input
                            type="number"
                            value={profile.twelfthYear}
                            onChange={(e) =>
                              setProfile({ ...profile, twelfthYear: e.target.value })
                            }
                            placeholder="2021"
                            disabled={isReadOnly}
                            className="h-12 bg-white focus:bg-white rounded-xl disabled:opacity-70 border-slate-200"
                          />
                        </Field>
                        <Field label="Percentage" icon={Award01Icon}>
                          <Input
                            type="number"
                            step="0.01"
                            value={profile.twelfthPercentage}
                            onChange={(e) =>
                              setProfile({ ...profile, twelfthPercentage: e.target.value })
                            }
                            placeholder="88.4"
                            disabled={isReadOnly}
                            className="h-12 bg-white focus:bg-white rounded-xl disabled:opacity-70 border-slate-200"
                          />
                        </Field>
                      </div>

                      {/* Diploma */}
                      <div className="space-y-5">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                          <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                            DP
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Diploma
                          </h4>
                        </div>
                        <Field label="Board (if any)" icon={Building01Icon}>
                          <Input
                            value={profile.diplomaBoard}
                            onChange={(e) =>
                              setProfile({ ...profile, diplomaBoard: e.target.value })
                            }
                            placeholder="MSBTE"
                            disabled={isReadOnly}
                            className="h-12 bg-white focus:bg-white rounded-xl disabled:opacity-70 border-slate-200"
                          />
                        </Field>
                        <Field label="Year" icon={Calendar01Icon}>
                          <Input
                            type="number"
                            value={profile.diplomaYear}
                            onChange={(e) =>
                              setProfile({ ...profile, diplomaYear: e.target.value })
                            }
                            placeholder="2022"
                            disabled={isReadOnly}
                            className="h-12 bg-white focus:bg-white rounded-xl disabled:opacity-70 border-slate-200"
                          />
                        </Field>
                        <Field label="Percentage" icon={Award01Icon}>
                          <Input
                            type="number"
                            step="0.01"
                            value={profile.diplomaPercentage}
                            onChange={(e) =>
                              setProfile({ ...profile, diplomaPercentage: e.target.value })
                            }
                            placeholder="85.0"
                            disabled={isReadOnly}
                            className="h-12 bg-white focus:bg-white rounded-xl disabled:opacity-70 border-slate-200"
                          />
                        </Field>
                      </div>
                    </div>
                  </SectionCard>

                  {/* Semester wise Performance */}
                  <SectionCard title="Semester wise Performance" icon={BookOpen01Icon}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Semester</th>
                            <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">CGPA</th>
                            <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Ongoing Backlogs</th>
                            <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Total Backlogs</th>
                            <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Marksheet</th>
                            {!isReadOnly && <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {profile.semesterMarks?.map((mark: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4">
                                <Input
                                  type="number"
                                  value={mark.semester}
                                  onChange={(e) => {
                                    const n = [...profile.semesterMarks];
                                    n[idx].semester = e.target.value ? parseInt(e.target.value) : '';
                                    setProfile({ ...profile, semesterMarks: n });
                                  }}
                                  disabled={isReadOnly}
                                  placeholder="e.g. 1"
                                  className="w-20 h-10 bg-white"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={mark.cgpa}
                                  onChange={(e) => {
                                    const n = [...profile.semesterMarks];
                                    n[idx].cgpa = e.target.value ? parseFloat(e.target.value) : '';
                                    setProfile({ ...profile, semesterMarks: n });
                                  }}
                                  disabled={isReadOnly}
                                  placeholder="e.g. 8.5"
                                  className="w-24 h-10 bg-white"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <Input
                                  type="number"
                                  value={mark.ongoingBacklogs}
                                  onChange={(e) => {
                                    const n = [...profile.semesterMarks];
                                    n[idx].ongoingBacklogs = e.target.value ? parseInt(e.target.value) : 0;
                                    setProfile({ ...profile, semesterMarks: n });
                                  }}
                                  disabled={isReadOnly}
                                  className="w-20 h-10 bg-white"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <Input
                                  type="number"
                                  value={mark.totalBacklogs}
                                  onChange={(e) => {
                                    const n = [...profile.semesterMarks];
                                    n[idx].totalBacklogs = e.target.value ? parseInt(e.target.value) : 0;
                                    setProfile({ ...profile, semesterMarks: n });
                                  }}
                                  disabled={isReadOnly}
                                  className="w-20 h-10 bg-white"
                                />
                              </td>
                              <td className="py-3 px-4 text-center">
                                {mark.marksheetUrl ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(mark.marksheetUrl, '_blank')}
                                    >
                                      View
                                    </Button>
                                    {!isReadOnly && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-500 border-red-200 hover:bg-red-50"
                                        onClick={async () => {
                                          try {
                                            const fileRef = ref(storage, mark.marksheetUrl);
                                            await deleteObject(fileRef);
                                          } catch (e) {
                                            console.error("Error deleting old marksheet", e);
                                          }
                                          const n = [...profile.semesterMarks];
                                          n[idx].marksheetUrl = null;
                                          setProfile({ ...profile, semesterMarks: n });
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  !isReadOnly && (
                                    <div className="relative inline-block">
                                      <Button variant="outline" size="sm" className="relative z-0">
                                        {uploadingMarkings[idx] ? 'Uploading...' : 'Upload'}
                                      </Button>
                                      <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={uploadingMarkings[idx]}
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          setUploadingMarkings({ ...uploadingMarkings, [idx]: true });
                                          const storageRef = ref(storage, `marksheets/${user?.id}/sem_${mark.semester}_${Date.now()}`);
                                          const uploadTask = uploadBytesResumable(storageRef, file);
                                          uploadTask.on(
                                            'state_changed',
                                            null,
                                            (error) => {
                                              console.error(error);
                                              toast.error('Failed to upload marksheet');
                                              setUploadingMarkings({ ...uploadingMarkings, [idx]: false });
                                            },
                                            async () => {
                                              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                              const n = [...profile.semesterMarks];
                                              n[idx].marksheetUrl = downloadURL;
                                              setProfile({ ...profile, semesterMarks: n });
                                              setUploadingMarkings({ ...uploadingMarkings, [idx]: false });
                                              toast.success('Marksheet uploaded successfully');
                                            }
                                          );
                                        }}
                                      />
                                    </div>
                                  )
                                )}
                              </td>
                              {!isReadOnly && (
                                <td className="py-3 px-4 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const n = profile.semesterMarks.filter((_, i) => i !== idx);
                                      setProfile({ ...profile, semesterMarks: n });
                                    }}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Cancel01Icon className="w-4 h-4" />
                                  </Button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setProfile({
                              ...profile,
                              semesterMarks: [
                                ...(profile.semesterMarks || []),
                                {
                                  semester: (profile.semesterMarks?.length || 0) + 1,
                                  cgpa: '',
                                  ongoingBacklogs: 0,
                                  totalBacklogs: 0,
                                  marksheetUrl: null,
                                },
                              ],
                            });
                          }}
                          className="mt-4"
                        >
                          <PlusSignIcon className="w-4 h-4 mr-2" /> Add Semester
                        </Button>
                      )}
                    </div>
                  </SectionCard>
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-8">
                  <SectionCard title="Links & Profiles" icon={Link01Icon}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-full">
                        <Field label="Resume Link" labelEnd="(Required)" icon={Note01Icon}>
                          <div className="relative">
                            <Input
                              value={profile.resumeUrl}
                              onChange={(e) =>
                                setProfile({ ...profile, resumeUrl: e.target.value })
                              }
                              placeholder="https://drive.google.com/..."
                              disabled={isReadOnly}
                              className="h-12 bg-white focus:bg-white text-lg rounded-xl pl-4 pr-12 disabled:opacity-70 border-slate-200"
                            />
                            {profile.resumeUrl && (
                              <a
                                href={profile.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 bg-blue-50 p-1 rounded-md"
                              >
                                <Link02Icon className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        </Field>
                      </div>
                      <Field label="GitHub Profile" labelEnd="(Required)" icon={CodeIcon}>
                        <div className="relative">
                          <Input
                            value={profile.githubUrl}
                            onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                            placeholder="https://github.com/username"
                            disabled={isReadOnly}
                            className={`h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200 ${profile.githubUrl?.includes('github.com') ? 'border-emerald-300 ring-1 ring-emerald-200' : ''}`}
                          />
                          {profile.githubUrl?.includes('github.com') && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">
                              <Shield01Icon className="w-3 h-3" /> Verified
                            </div>
                          )}
                        </div>
                      </Field>
                      <Field label="LinkedIn Profile" labelEnd="(Required)" icon={Link01Icon}>
                        <Input
                          value={profile.linkedinUrl}
                          onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                      <Field label="Portfolio Website" labelEnd="(Optional)" icon={GlobalIcon}>
                        <Input
                          value={profile.portfolioUrl}
                          onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                          placeholder="https://myportfolio.com"
                          disabled={isReadOnly}
                          className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                        />
                      </Field>
                    </div>
                  </SectionCard>

                  <SectionCard title="Coding Profiles" icon={CodeIcon}>
                    <div className="space-y-4">
                      {profile.codingProfiles.map((cp: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100"
                        >
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <Field label="Platform" icon={DashboardSquare01Icon}>
                              <select
                                value={cp.platform}
                                onChange={(e) => {
                                  const newCp = [...profile.codingProfiles];
                                  newCp[idx].platform = e.target.value;
                                  setProfile({ ...profile, codingProfiles: newCp });
                                }}
                                disabled={isReadOnly}
                                className="w-full h-12 bg-white border border-slate-200 text-lg rounded-xl px-4 outline-none disabled:opacity-70"
                              >
                                <option value="">Select Platform</option>
                                <option value="LeetCode">LeetCode</option>
                                <option value="HackerRank">HackerRank</option>
                                <option value="CodeChef">CodeChef</option>
                                <option value="Codeforces">Codeforces</option>
                                <option value="GeeksForGeeks">GeeksForGeeks</option>
                              </select>
                            </Field>
                            <Field label="Profile URL" icon={Link01Icon}>
                              <Input
                                value={cp.url}
                                onChange={(e) => {
                                  const newCp = [...profile.codingProfiles];
                                  newCp[idx].url = e.target.value;
                                  setProfile({ ...profile, codingProfiles: newCp });
                                }}
                                placeholder="Profile URL"
                                disabled={isReadOnly}
                                className="h-12 bg-white focus:bg-white text-lg rounded-xl disabled:opacity-70 border-slate-200"
                              />
                            </Field>
                          </div>
                          {!isReadOnly && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setProfile({
                                  ...profile,
                                  codingProfiles: profile.codingProfiles.filter(
                                    (_, i) => i !== idx
                                  ),
                                });
                              }}
                              className="h-12 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                            >
                              <Cancel01Icon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setProfile({
                              ...profile,
                              codingProfiles: [
                                ...profile.codingProfiles,
                                { platform: '', url: '' },
                              ],
                            });
                          }}
                          className="w-full border-dashed border-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-6"
                        >
                          <PlusSignIcon className="w-4 h-4 mr-2" /> Add Coding Profile
                        </Button>
                      )}
                    </div>
                  </SectionCard>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-8">
                  <SectionCard title="Technical Skills" icon={ComputerIcon}>
                    <div className="space-y-8">
                      <Field label="Programming Languages" icon={CodeIcon}>
                        <TagInput
                          tags={profile.programmingLanguages || []}
                          setTags={(tags: string[]) =>
                            setProfile({ ...profile, programmingLanguages: tags })
                          }
                          placeholder="e.g. Java, Python, C++"
                          disabled={isReadOnly}
                        />
                      </Field>
                      <Field label="Frameworks & Libraries" icon={DashboardSquare01Icon}>
                        <TagInput
                          tags={profile.skills || []}
                          setTags={(tags: string[]) => setProfile({ ...profile, skills: tags })}
                          placeholder="e.g. React, Node.js, Spring Boot"
                          disabled={isReadOnly}
                        />
                      </Field>
                    </div>
                  </SectionCard>
                </div>
              )}

              {activeTab === 'languages' && (
                <div className="space-y-8">
                  <SectionCard title="Spoken Languages" icon={LanguageSkillIcon}>
                    <div className="space-y-4">
                      {profile.languages.map((lang: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4"
                        >
                          <div className="flex gap-4 items-end">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Field label="Language" icon={LanguageSkillIcon}>
                                <Input
                                  value={lang.language}
                                  onChange={(e) => {
                                    const newL = [...profile.languages];
                                    newL[idx].language = e.target.value;
                                    setProfile({ ...profile, languages: newL });
                                  }}
                                  placeholder="e.g. English"
                                  disabled={isReadOnly}
                                  className="h-12 bg-white"
                                />
                              </Field>
                              <Field label="Proficiency" icon={Award01Icon}>
                                <select
                                  value={lang.proficiency}
                                  onChange={(e) => {
                                    const newL = [...profile.languages];
                                    newL[idx].proficiency = e.target.value;
                                    setProfile({ ...profile, languages: newL });
                                  }}
                                  disabled={isReadOnly}
                                  className="w-full h-12 bg-white border border-slate-200 text-lg rounded-xl px-4 outline-none disabled:opacity-70"
                                >
                                  <option value="">Select Proficiency</option>
                                  <option value="Native">Native</option>
                                  <option value="Professional">Professional</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Beginner">Beginner</option>
                                </select>
                              </Field>
                            </div>
                            {!isReadOnly && (
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setProfile({
                                    ...profile,
                                    languages: profile.languages.filter((_, i) => i !== idx),
                                  });
                                }}
                                className="h-12 px-4 text-red-500 hover:bg-red-50 border-red-200 shrink-0"
                              >
                                <Cancel01Icon className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <input
                                type="checkbox"
                                checked={lang.reading}
                                disabled={isReadOnly}
                                onChange={(e) => {
                                  const newL = [...profile.languages];
                                  newL[idx].reading = e.target.checked;
                                  setProfile({ ...profile, languages: newL });
                                }}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                              />{' '}
                              Reading
                            </label>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <input
                                type="checkbox"
                                checked={lang.writing}
                                disabled={isReadOnly}
                                onChange={(e) => {
                                  const newL = [...profile.languages];
                                  newL[idx].writing = e.target.checked;
                                  setProfile({ ...profile, languages: newL });
                                }}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                              />{' '}
                              Writing
                            </label>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <input
                                type="checkbox"
                                checked={lang.speaking}
                                disabled={isReadOnly}
                                onChange={(e) => {
                                  const newL = [...profile.languages];
                                  newL[idx].speaking = e.target.checked;
                                  setProfile({ ...profile, languages: newL });
                                }}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                              />{' '}
                              Speaking
                            </label>
                          </div>
                        </div>
                      ))}
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setProfile({
                              ...profile,
                              languages: [
                                ...profile.languages,
                                {
                                  language: '',
                                  proficiency: '',
                                  reading: false,
                                  writing: false,
                                  speaking: false,
                                },
                              ],
                            });
                          }}
                          className="w-full border-dashed border-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-6"
                        >
                          <PlusSignIcon className="w-4 h-4 mr-2" /> Add Language
                        </Button>
                      )}
                    </div>
                  </SectionCard>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-8">
                  <SectionCard title="Projects" icon={CodeIcon}>
                    <div className="space-y-6">
                      {profile.projects.map((proj: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 relative group"
                        >
                          {!isReadOnly && (
                            <button
                              onClick={() =>
                                setProfile({
                                  ...profile,
                                  projects: profile.projects.filter((_, i) => i !== idx),
                                })
                              }
                              className="absolute top-4 right-4 p-2 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Cancel01Icon className="w-4 h-4" />
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Field label="Project Name" icon={Note01Icon}>
                              <Input
                                value={proj.name}
                                onChange={(e) => {
                                  const n = [...profile.projects];
                                  n[idx].name = e.target.value;
                                  setProfile({ ...profile, projects: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                            <Field label="Project Type" icon={HashtagIcon}>
                              <select
                                value={proj.projectType}
                                onChange={(e) => {
                                  const n = [...profile.projects];
                                  n[idx].projectType = e.target.value;
                                  setProfile({ ...profile, projects: n });
                                }}
                                disabled={isReadOnly}
                                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 disabled:opacity-70"
                              >
                                <option value="">Select Type</option>
                                <option value="Academic">Academic</option>
                                <option value="Personal">Personal</option>
                                <option value="Hackathon">Hackathon</option>
                                <option value="Open Source">Open Source</option>
                              </select>
                            </Field>
                            <Field label="Role" icon={UserIcon}>
                              <Input
                                value={proj.role}
                                onChange={(e) => {
                                  const n = [...profile.projects];
                                  n[idx].role = e.target.value;
                                  setProfile({ ...profile, projects: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                                placeholder="e.g. Full Stack Developer"
                              />
                            </Field>
                            <Field label="Team Size" icon={UserCircleIcon}>
                              <Input
                                type="number"
                                value={proj.teamSize}
                                onChange={(e) => {
                                  const n = [...profile.projects];
                                  n[idx].teamSize = e.target.value;
                                  setProfile({ ...profile, projects: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                                placeholder="1"
                              />
                            </Field>
                            <Field label="Start Date" icon={Calendar01Icon}>
                              <Input
                                type="month"
                                value={proj.startDate}
                                onChange={(e) => {
                                  const n = [...profile.projects];
                                  n[idx].startDate = e.target.value;
                                  setProfile({ ...profile, projects: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                            <Field label="End Date" icon={Calendar01Icon}>
                              <Input
                                type="month"
                                value={proj.endDate}
                                onChange={(e) => {
                                  const n = [...profile.projects];
                                  n[idx].endDate = e.target.value;
                                  setProfile({ ...profile, projects: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                            <Field label="GitHub Repository" icon={CodeIcon}>
                              <Input
                                value={proj.githubUrl}
                                onChange={(e) => {
                                  const n = [...profile.projects];
                                  n[idx].githubUrl = e.target.value;
                                  setProfile({ ...profile, projects: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                            <Field label="Live Demo" icon={Globe02Icon}>
                              <Input
                                value={proj.liveUrl}
                                onChange={(e) => {
                                  const n = [...profile.projects];
                                  n[idx].liveUrl = e.target.value;
                                  setProfile({ ...profile, projects: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                          </div>
                          <div className="space-y-4">
                            <Field label="Tech Stack" icon={Wrench01Icon}>
                              <Input
                                value={proj.techStack}
                                onChange={(e) => {
                                  const n = [...profile.projects];
                                  n[idx].techStack = e.target.value;
                                  setProfile({ ...profile, projects: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                                placeholder="React, Node.js, MongoDB"
                              />
                            </Field>
                            <Field label="Short Description" icon={Note01Icon}>
                              <textarea
                                value={proj.description}
                                onChange={(e) => {
                                  const n = [...profile.projects];
                                  n[idx].description = e.target.value;
                                  setProfile({ ...profile, projects: n });
                                }}
                                disabled={isReadOnly}
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-70 resize-none"
                              />
                            </Field>
                            <Field label="Achievements & Impact" icon={Award01Icon}>
                              <textarea
                                value={proj.achievements}
                                onChange={(e) => {
                                  const n = [...profile.projects];
                                  n[idx].achievements = e.target.value;
                                  setProfile({ ...profile, projects: n });
                                }}
                                disabled={isReadOnly}
                                rows={3}
                                placeholder="Developed 5 responsive modules and reduced load time by 25%..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-70 resize-none"
                              />
                            </Field>
                          </div>
                        </div>
                      ))}
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setProfile({
                              ...profile,
                              projects: [
                                ...profile.projects,
                                {
                                  name: '',
                                  description: '',
                                  role: '',
                                  techStack: '',
                                  githubUrl: '',
                                  liveUrl: '',
                                  startDate: '',
                                  endDate: '',
                                  projectType: '',
                                  teamSize: '1',
                                  achievements: '',
                                },
                              ],
                            });
                          }}
                          className="w-full border-dashed border-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-6"
                        >
                          <PlusSignIcon className="w-4 h-4 mr-2" /> Add Project
                        </Button>
                      )}
                    </div>
                  </SectionCard>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-8">
                  <SectionCard title="Internships & Work Experience" icon={Briefcase01Icon}>
                    <div className="space-y-6">
                      {profile.experience.map((exp: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 relative group"
                        >
                          {!isReadOnly && (
                            <button
                              onClick={() =>
                                setProfile({
                                  ...profile,
                                  experience: profile.experience.filter((_, i) => i !== idx),
                                })
                              }
                              className="absolute top-4 right-4 p-2 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Cancel01Icon className="w-4 h-4" />
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Field label="Company Name" icon={Building01Icon}>
                              <Input
                                value={exp.company}
                                onChange={(e) => {
                                  const n = [...profile.experience];
                                  n[idx].company = e.target.value;
                                  setProfile({ ...profile, experience: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                            <Field label="Role / Position" icon={Briefcase01Icon}>
                              <Input
                                value={exp.role}
                                onChange={(e) => {
                                  const n = [...profile.experience];
                                  n[idx].role = e.target.value;
                                  setProfile({ ...profile, experience: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                            <Field label="Employment Type" icon={HashtagIcon}>
                              <select
                                value={exp.employmentType}
                                onChange={(e) => {
                                  const n = [...profile.experience];
                                  n[idx].employmentType = e.target.value;
                                  setProfile({ ...profile, experience: n });
                                }}
                                disabled={isReadOnly}
                                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 disabled:opacity-70"
                              >
                                <option value="">Select Type</option>
                                <option value="Internship">Internship</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Freelance">Freelance</option>
                              </select>
                            </Field>
                            <Field label="Location" icon={Location01Icon}>
                              <Input
                                value={exp.location}
                                onChange={(e) => {
                                  const n = [...profile.experience];
                                  n[idx].location = e.target.value;
                                  setProfile({ ...profile, experience: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                                placeholder="Remote / On-site / City"
                              />
                            </Field>
                            <Field label="Start Date" icon={Calendar01Icon}>
                              <Input
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => {
                                  const n = [...profile.experience];
                                  n[idx].startDate = e.target.value;
                                  setProfile({ ...profile, experience: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                            <div className="space-y-2">
                              <Field label="End Date" icon={Calendar01Icon}>
                                <Input
                                  type="month"
                                  value={exp.endDate}
                                  onChange={(e) => {
                                    const n = [...profile.experience];
                                    n[idx].endDate = e.target.value;
                                    setProfile({ ...profile, experience: n });
                                  }}
                                  disabled={isReadOnly || exp.isCurrent}
                                  className="bg-white h-11"
                                />
                              </Field>
                              <label className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                                <input
                                  type="checkbox"
                                  checked={exp.isCurrent}
                                  disabled={isReadOnly}
                                  onChange={(e) => {
                                    const n = [...profile.experience];
                                    n[idx].isCurrent = e.target.checked;
                                    if (e.target.checked) n[idx].endDate = '';
                                    setProfile({ ...profile, experience: n });
                                  }}
                                  className="w-4 h-4 rounded text-blue-600"
                                />
                                Currently Working Here
                              </label>
                            </div>
                            <Field label="Company Website" icon={GlobalIcon}>
                              <Input
                                value={exp.website}
                                onChange={(e) => {
                                  const n = [...profile.experience];
                                  n[idx].website = e.target.value;
                                  setProfile({ ...profile, experience: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                            <Field label="Technologies Used" icon={Wrench01Icon}>
                              <Input
                                value={exp.techStack}
                                onChange={(e) => {
                                  const n = [...profile.experience];
                                  n[idx].techStack = e.target.value;
                                  setProfile({ ...profile, experience: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                                placeholder="e.g. AWS, React"
                              />
                            </Field>
                          </div>
                          <div className="space-y-4">
                            <Field label="Responsibilities" icon={Note01Icon}>
                              <textarea
                                value={exp.responsibilities}
                                onChange={(e) => {
                                  const n = [...profile.experience];
                                  n[idx].responsibilities = e.target.value;
                                  setProfile({ ...profile, experience: n });
                                }}
                                disabled={isReadOnly}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 resize-none"
                              />
                            </Field>
                            <Field label="Achievements & Impact" icon={Award01Icon}>
                              <textarea
                                value={exp.achievements}
                                onChange={(e) => {
                                  const n = [...profile.experience];
                                  n[idx].achievements = e.target.value;
                                  setProfile({ ...profile, experience: n });
                                }}
                                disabled={isReadOnly}
                                rows={3}
                                placeholder="Increased efficiency by 15%..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 resize-none"
                              />
                            </Field>
                          </div>
                        </div>
                      ))}
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setProfile({
                              ...profile,
                              experience: [
                                ...profile.experience,
                                {
                                  company: '',
                                  role: '',
                                  employmentType: '',
                                  location: '',
                                  startDate: '',
                                  endDate: '',
                                  isCurrent: false,
                                  responsibilities: '',
                                  achievements: '',
                                  techStack: '',
                                  website: '',
                                },
                              ],
                            });
                          }}
                          className="w-full border-dashed border-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-6"
                        >
                          <PlusSignIcon className="w-4 h-4 mr-2" /> Add Experience
                        </Button>
                      )}
                    </div>
                  </SectionCard>
                </div>
              )}

              {activeTab === 'certifications' && (
                <div className="space-y-8">
                  <SectionCard title="Certifications & Awards" icon={Award01Icon}>
                    <div className="space-y-6">
                      {profile.certifications.map((cert: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 relative group"
                        >
                          {!isReadOnly && (
                            <button
                              onClick={() =>
                                setProfile({
                                  ...profile,
                                  certifications: profile.certifications.filter(
                                    (_, i) => i !== idx
                                  ),
                                })
                              }
                              className="absolute top-4 right-4 p-2 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Cancel01Icon className="w-4 h-4" />
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Name" icon={Award01Icon}>
                              <Input
                                value={cert.name}
                                onChange={(e) => {
                                  const n = [...profile.certifications];
                                  n[idx].name = e.target.value;
                                  setProfile({ ...profile, certifications: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                            <Field label="Issuing Organization" icon={Building01Icon}>
                              <Input
                                value={cert.organization}
                                onChange={(e) => {
                                  const n = [...profile.certifications];
                                  n[idx].organization = e.target.value;
                                  setProfile({ ...profile, certifications: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                            <Field label="Type" icon={HashtagIcon}>
                              <select
                                value={cert.type}
                                onChange={(e) => {
                                  const n = [...profile.certifications];
                                  n[idx].type = e.target.value;
                                  setProfile({ ...profile, certifications: n });
                                }}
                                disabled={isReadOnly}
                                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 disabled:opacity-70"
                              >
                                <option value="">Select Type</option>
                                <option value="Certification">Certification</option>
                                <option value="Award">Award</option>
                                <option value="Hackathon">Hackathon</option>
                                <option value="Competition">Competition</option>
                              </select>
                            </Field>
                            <Field label="Issue Date" icon={Calendar01Icon}>
                              <Input
                                type="month"
                                value={cert.issueDate}
                                onChange={(e) => {
                                  const n = [...profile.certifications];
                                  n[idx].issueDate = e.target.value;
                                  setProfile({ ...profile, certifications: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                            <Field label="Credential ID" icon={HashtagIcon}>
                              <Input
                                value={cert.credentialId}
                                onChange={(e) => {
                                  const n = [...profile.certifications];
                                  n[idx].credentialId = e.target.value;
                                  setProfile({ ...profile, certifications: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                            <Field label="Credential URL" icon={Link01Icon}>
                              <Input
                                value={cert.url}
                                onChange={(e) => {
                                  const n = [...profile.certifications];
                                  n[idx].url = e.target.value;
                                  setProfile({ ...profile, certifications: n });
                                }}
                                disabled={isReadOnly}
                                className="bg-white h-11"
                              />
                            </Field>
                          </div>
                        </div>
                      ))}
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setProfile({
                              ...profile,
                              certifications: [
                                ...profile.certifications,
                                {
                                  name: '',
                                  organization: '',
                                  issueDate: '',
                                  expiryDate: '',
                                  credentialId: '',
                                  url: '',
                                  type: '',
                                },
                              ],
                            });
                          }}
                          className="w-full border-dashed border-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-6"
                        >
                          <PlusSignIcon className="w-4 h-4 mr-2" /> Add Certification
                        </Button>
                      )}
                    </div>
                  </SectionCard>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {!isReadOnly && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:-translate-x-0 md:right-8 lg:right-12 z-50"
        >
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending || requestUpdateMutation.isPending}
            className="h-14 px-8 rounded-full shadow-2xl shadow-blue-500/30 bg-slate-900 hover:bg-blue-600 text-white font-bold text-lg flex items-center gap-3 transition-all hover:scale-105 border border-slate-800"
          >
            {updateProfileMutation.isPending || requestUpdateMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FloppyDiskIcon className="w-5 h-5" />
            )}
            {updateProfileMutation.isPending || requestUpdateMutation.isPending
              ? 'Saving...'
              : isEditing
                ? 'Submit Update Request'
                : 'Save Profile'}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
