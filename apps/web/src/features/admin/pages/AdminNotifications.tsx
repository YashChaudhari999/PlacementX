// @ts-nocheck
import { useState } from 'react';
import axios from 'axios';
import { Card, Input, Button } from '@/components/ui';
import { toast } from 'sonner';
import { Send, BellRing, Link as LinkIcon, MessageSquare, AlertTriangle, CheckCircle, Info, Users } from 'lucide-react';

export default function AdminNotifications() {
  const [formData, setFormData] = useState({ 
    title: '', 
    message: '', 
    link: '',
    type: 'INFO',
    targetBranch: 'ALL'
  });
  const [loading, setLoading] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/admin/notifications/broadcast', formData);
      toast.success(res.data.message || 'Notification broadcasted successfully');
      setFormData({ title: '', message: '', link: '', type: 'INFO', targetBranch: 'ALL' });
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to broadcast notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Broadcast Announcements</h1>
          <p className="text-slate-500">Push targeted notifications to students based on branch or severity.</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Compose Message</h3>
            <p className="text-sm text-slate-500">Choose the audience and severity of this notification.</p>
          </div>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-slate-400" /> Notification Type
              </label>
              <select 
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="INFO">General Information</option>
                <option value="SUCCESS">Success / Achievement</option>
                <option value="WARNING">Warning / Reminder</option>
                <option value="ALERT">Urgent Alert (Red)</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" /> Target Audience
              </label>
              <select 
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.targetBranch}
                onChange={(e) => setFormData({ ...formData, targetBranch: e.target.value })}
              >
                <option value="ALL">All Registered Students</option>
                <option value="B.Tech CS">B.Tech Computer Science</option>
                <option value="B.Tech IT">B.Tech Information Technology</option>
                <option value="B.Tech EXTC">B.Tech EXTC</option>
                <option value="MBA Tech">MBA Tech</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Announcement Title</label>
            <Input 
              placeholder="e.g., Urgent: Amazon Application Deadline Extended!"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" /> Message Body
            </label>
            <textarea 
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px]"
              placeholder="Enter the full details of the announcement here..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Action Link (Optional)</label>
            <Input 
              icon={<LinkIcon className="w-4 h-4" />}
              placeholder="https://..."
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">If provided, a "View Details" button will appear in the notification.</p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto text-base px-8 py-2 h-auto">
              {loading ? (
                'Broadcasting...'
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Send Notification</>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
