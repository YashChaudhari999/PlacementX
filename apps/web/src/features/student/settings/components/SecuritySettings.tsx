import { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Key01Icon } from 'hugeicons-react';

export default function SecuritySettings() {
 const [passwords, setPasswords] = useState({
 currentPassword: '',
 newPassword: '',
 confirmPassword: '',
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
 await api.put('/auth/password', {
 currentPassword: passwords.currentPassword,
 newPassword: passwords.newPassword,
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
 <div className="space-y-6">
 <Card className="p-6 border border-border/60 shadow-lg shadow-slate-200/40 bg-card/90 backdrop-blur-xl">
 <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
 <Key01Icon className="w-5 h-5 text-muted-foreground"/>
 <h3 className="font-bold text-foreground text-lg">Change Password</h3>
 </div>

 <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Current Password</label>
 <Input
 type="password"
 name="currentPassword"
 value={passwords.currentPassword}
 onChange={handleChange}
 required
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">New Password</label>
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
 <label className="text-sm font-medium text-foreground">Confirm New Password</label>
 <Input
 type="password"
 name="confirmPassword"
 value={passwords.confirmPassword}
 onChange={handleChange}
 required
 minLength={6}
 />
 </div>

 <div className="pt-4">
 <Button type="submit"disabled={loading}>
 {loading ? 'Updating...' : 'Update Password'}
 </Button>
 </div>
 </form>
 </Card>

 <Card className="p-6 border border-border/60 shadow-lg shadow-slate-200/40 bg-card/90 backdrop-blur-xl opacity-70">
 <h3 className="font-bold text-foreground text-lg border-b border-border pb-4 mb-4">
 Two-Factor Authentication (2FA)
 </h3>
 <p className="text-sm text-muted-foreground mb-4">
 Two-factor authentication adds an extra layer of security to your account.
 </p>
 <Button variant="outline"disabled>
 Coming Soon
 </Button>
 </Card>
 </div>
 );
}
