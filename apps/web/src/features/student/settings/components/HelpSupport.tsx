import { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useSubmitSupportRequest } from '../hooks/useSettings';
import { HelpCircleIcon } from 'hugeicons-react';

export default function HelpSupport() {
  const { mutate: submitRequest, isPending } = useSubmitSupportRequest();

  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRequest(formData);
    setFormData({ category: '', subject: '', message: '' });
  };

  return (
    <Card className="p-6 border border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <HelpCircleIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Help & Support</h3>
          <p className="text-sm text-slate-500">Contact the placement cell for assistance.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Category</label>
          <select 
            required
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="" disabled>Select a category...</option>
            <option value="profile">Profile Update Issue</option>
            <option value="drive">Placement Drive Inquiry</option>
            <option value="interview">Interview Scheduling</option>
            <option value="technical">Technical Issue</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Subject</label>
          <Input 
            required
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            placeholder="Brief summary of your issue"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Message</label>
          <textarea 
            required
            minLength={10}
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            placeholder="Describe your issue in detail..."
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
