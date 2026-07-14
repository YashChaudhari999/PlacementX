import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import { Card, Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { Shield, Key } from 'lucide-react';

export default function StudentSettings() {
  const { user } = useAuthStore();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
          <p className="text-slate-500">Manage your account security and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card className="p-4 bg-slate-50 border-none shadow-none">
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium bg-white text-primary rounded-lg shadow-sm border border-slate-200">
                <Shield className="w-4 h-4" /> Security
              </button>
              {/* Future settings tabs can go here */}
            </nav>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <Key className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-slate-800 text-lg">Change Password</h3>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
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
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
