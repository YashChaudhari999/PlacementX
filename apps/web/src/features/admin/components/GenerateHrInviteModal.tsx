import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Check, Copy } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import api from '@/lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function GenerateHrInviteModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    hrName: '',
    hrEmail: '',
    companyEmail: '',
    driveTitle: '',
  });
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/hr/generate', formData);
      // The API returns a signed JWT or token, let's assume it returns a secureToken
      const link = `${window.location.origin}/hr-drive/${res.data.data.secureToken}`;
      setGeneratedLink(link);
    } catch (error) {
      alert('Failed to generate HR link.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800">Generate HR Invitation</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {!generatedLink ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-slate-500 mb-4">
                  Send a secure link to the Company HR to fill out the placement drive details
                  themselves.
                </p>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Drive Title / Role
                  </label>
                  <Input
                    required
                    value={formData.driveTitle}
                    onChange={(e) => setFormData({ ...formData, driveTitle: e.target.value })}
                    placeholder="e.g. Software Engineer 2026 Hiring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Company Name
                  </label>
                  <Input
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Google"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">HR Name</label>
                    <Input
                      required
                      value={formData.hrName}
                      onChange={(e) => setFormData({ ...formData, hrName: e.target.value })}
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      HR Email
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.hrEmail}
                      onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Secure Link'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">
                    Link Generated Successfully!
                  </h3>
                  <p className="text-sm text-slate-500">
                    Copy this link and send it to the HR representative.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <LinkIcon className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    readOnly
                    value={generatedLink}
                    className="bg-transparent text-sm w-full outline-none text-slate-600"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-slate-200 rounded-md transition-colors text-slate-500 hover:text-slate-700 shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <Button onClick={onClose} className="w-full">
                  Done
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
