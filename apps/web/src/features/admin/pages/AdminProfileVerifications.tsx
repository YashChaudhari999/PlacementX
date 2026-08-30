import { useState } from 'react';
import { usePendingProfiles, useVerifyProfile } from '@/hooks/queries/useAdmin';
import { Button } from '@/components/ui';
import { Tick02Icon, CancelCircleIcon, Search01Icon, ViewIcon } from 'hugeicons-react';
import { motion } from 'framer-motion';

export default function AdminProfileVerifications() {
  const { data: profiles = [], isLoading } = usePendingProfiles();
  const verifyMutation = useVerifyProfile();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [reason, setReason] = useState('');

  const filteredProfiles = profiles.filter(
    (p: any) =>
      p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    verifyMutation.mutate(
      { id, action, reason: action === 'REJECT' ? reason : undefined },
      {
        onSuccess: () => {
          setSelectedProfile(null);
          setReason('');
        },
      }
    );
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading pending verifications...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile Verifications</h1>
          <p className="text-sm text-slate-500">Review and verify new student profiles</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1">
            <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">CGPA</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No pending verifications found
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((profile: any) => (
                  <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {profile.firstName} {profile.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{profile.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{profile.branch}</td>
                    <td className="px-6 py-4 text-slate-600">{profile.cgpa}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProfile(profile)}
                        className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <ViewIcon className="w-4 h-4" /> Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Review Profile</h2>
              <p className="text-sm text-slate-500">
                {selectedProfile.firstName} {selectedProfile.lastName}
              </p>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email
                  </div>
                  <div className="text-slate-900">{selectedProfile.user?.email}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Phone
                  </div>
                  <div className="text-slate-900">{selectedProfile.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Branch
                  </div>
                  <div className="text-slate-900">{selectedProfile.branch || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Current Semester
                  </div>
                  <div className="text-slate-900">{selectedProfile.currentSemester || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    CGPA
                  </div>
                  <div className="text-slate-900">{selectedProfile.cgpa || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Passing Year
                  </div>
                  <div className="text-slate-900">{selectedProfile.passingYear || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Active Backlogs
                  </div>
                  <div className="text-slate-900">{selectedProfile.activeBacklogs || '0'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Total Backlogs
                  </div>
                  <div className="text-slate-900">{selectedProfile.totalBacklogs || '0'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    10th %
                  </div>
                  <div className="text-slate-900">
                    {selectedProfile.tenthPercentage
                      ? `${selectedProfile.tenthPercentage}%`
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    12th %
                  </div>
                  <div className="text-slate-900">
                    {selectedProfile.twelfthPercentage
                      ? `${selectedProfile.twelfthPercentage}%`
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Diploma %
                  </div>
                  <div className="text-slate-900">
                    {selectedProfile.diplomaPercentage
                      ? `${selectedProfile.diplomaPercentage}%`
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Year Gap
                  </div>
                  <div className="text-slate-900">{selectedProfile.yearGap || '0'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Resume Link
                  </div>
                  <div className="text-slate-900 break-all">
                    {selectedProfile.resumeUrl ? (
                      <a
                        href={selectedProfile.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedProfile.resumeUrl}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Skills
                  </div>
                  <div className="text-slate-900">
                    {Array.isArray(selectedProfile.skills)
                      ? selectedProfile.skills.join(', ')
                      : selectedProfile.skills || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="If rejecting, provide a reason..."
                  className="w-full h-24 p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedProfile(null);
                  setReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAction(selectedProfile.id, 'REJECT')}
                disabled={verifyMutation.isPending}
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none"
              >
                <CancelCircleIcon className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button
                onClick={() => handleAction(selectedProfile.id, 'APPROVE')}
                disabled={verifyMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Tick02Icon className="w-4 h-4 mr-2" /> Approve
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
