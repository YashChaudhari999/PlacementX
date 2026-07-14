import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import { Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { User, FileText, GraduationCap } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    firstName: '',
    lastName: '',
    phone: '',
    branch: '',
    cgpa: '',
    passingYear: '',
    activeBacklogs: '0',
    yearGap: '0',
    nationality: 'Indian',
    gender: '',
    resumeUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    skills: '[]',
    projects: '[]',
    educationDetails: '[]'
  });

  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!user) return;
      const res = await axios.get('http://localhost:5000/api/student/profile', {
        headers: { 'x-user-id': user.id }
      });
      if (res.data) {
        setProfile({
          ...res.data,
          cgpa: res.data.cgpa || '',
          passingYear: res.data.passingYear || '',
          activeBacklogs: res.data.activeBacklogs?.toString() || '0',
          yearGap: res.data.yearGap?.toString() || '0',
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...profile,
        cgpa: parseFloat(profile.cgpa),
        passingYear: parseInt(profile.passingYear),
        activeBacklogs: parseInt(profile.activeBacklogs),
        yearGap: parseInt(profile.yearGap)
      };

      await axios.put('http://localhost:5000/api/student/profile', payload, {
        headers: { 'x-user-id': user?.id }
      });
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-500">Manage your personal and academic information.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button 
            className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'personal' ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('personal')}
          >
            <User className="w-4 h-4" /> Personal Details
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'academic' ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('academic')}
          >
            <GraduationCap className="w-4 h-4" /> Academic Info
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'documents' ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText className="w-4 h-4" /> Documents & Links
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">First Name</label>
                <Input name="firstName" value={profile.firstName || ''} onChange={handleChange} placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Last Name</label>
                <Input name="lastName" value={profile.lastName || ''} onChange={handleChange} placeholder="Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <Input name="phone" value={profile.phone || ''} onChange={handleChange} placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Gender</label>
                <select 
                  name="gender" 
                  value={profile.gender || ''} 
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Branch / Major</label>
                <select 
                  name="branch" 
                  value={profile.branch || ''} 
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select Branch</option>
                  <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                  <option value="B.Tech Information Technology">B.Tech Information Technology</option>
                  <option value="MBA Marketing">MBA Marketing</option>
                  <option value="MBA Finance">MBA Finance</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">CGPA</label>
                <Input name="cgpa" type="number" step="0.01" value={profile.cgpa || ''} onChange={handleChange} placeholder="e.g. 8.5" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Passing Year</label>
                <Input name="passingYear" type="number" value={profile.passingYear || ''} onChange={handleChange} placeholder="e.g. 2026" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Active Backlogs</label>
                <Input name="activeBacklogs" type="number" value={profile.activeBacklogs || '0'} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Year Gap (if any)</label>
                <Input name="yearGap" type="number" value={profile.yearGap || '0'} onChange={handleChange} />
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                Provide public URLs for your documents and profiles. Ensure they are accessible by recruiters.
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Resume URL (Google Drive / PDF Link)</label>
                <Input name="resumeUrl" value={profile.resumeUrl || ''} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Portfolio URL (Optional)</label>
                <Input name="portfolioUrl" value={profile.portfolioUrl || ''} onChange={handleChange} placeholder="https://myportfolio.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">GitHub Profile URL (Optional)</label>
                <Input name="githubUrl" value={profile.githubUrl || ''} onChange={handleChange} placeholder="https://github.com/username" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
