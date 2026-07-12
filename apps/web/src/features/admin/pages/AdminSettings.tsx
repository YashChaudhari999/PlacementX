import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import { Card, Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { Shield, Key, Save, Server, Globe } from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuthStore();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'security' | 'general'>('general');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await axios.put('http://localhost:5000/api/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { 'x-user-id': user?.id }
      });
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Settings</h1>
          <p className="text-slate-500">Manage institutional preferences and administrator security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              activeTab === 'general' ? 'bg-white text-primary shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Globe className="w-4 h-4" /> General Rules
          </button>
          
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              activeTab === 'security' ? 'bg-white text-primary shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Shield className="w-4 h-4" /> Admin Security
          </button>
        </div>

        <div className="md:col-span-3">
          {activeTab === 'general' && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Server className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-800 text-lg">Platform Configuration</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Institution Name</label>
                  <Input defaultValue="NMIMS Placement Cell" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Support Email (Visible to students)</label>
                  <Input defaultValue="placements@nmims.edu" />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button variant="outline" onClick={() => toast.success('Settings saved!')}>
                    <Save className="w-4 h-4 mr-2" /> Save Configuration
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Key className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-800 text-lg">Change Admin Password</h3>
              </div>
              
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Current Password</label>
                  <Input 
                    type="password" 
                    name="currentPassword" 
                    value={passwords.currentPassword} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">New Password</label>
                  <Input 
                    type="password" 
                    name="newPassword" 
                    value={passwords.newPassword} 
                    onChange={handleChange} 
                    required 
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                  <Input 
                    type="password" 
                    name="confirmPassword" 
                    value={passwords.confirmPassword} 
                    onChange={handleChange} 
                    required 
                    minLength={6}
                  />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={loading} className="px-8">
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
