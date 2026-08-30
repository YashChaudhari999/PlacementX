import { useState } from 'react';
import { useUpdateRequests, useReviewUpdateRequest } from '@/hooks/queries/useAdmin';
import { Button } from '@/components/ui';
import { Tick02Icon, CancelCircleIcon, Search01Icon, ViewIcon } from 'hugeicons-react';
import { motion } from 'framer-motion';

export default function AdminProfileUpdateRequests() {
  const { data: requests = [], isLoading } = useUpdateRequests();
  const reviewMutation = useReviewUpdateRequest();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminComment, setAdminComment] = useState('');

  const filteredRequests = requests.filter(
    (r: any) =>
      r.student?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    reviewMutation.mutate(
      { id, action, reason: action === 'REJECT' ? adminComment : undefined },
      {
        onSuccess: () => {
          setSelectedRequest(null);
          setAdminComment('');
        },
      }
    );
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 font-medium">Loading update requests...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile Update Requests</h1>
          <p className="text-sm text-slate-500">Review changes requested by verified students</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1">
            <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
                <th className="px-6 py-4">Date Requested</th>
                <th className="px-6 py-4">Student Reason</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No pending update requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {req.student?.firstName} {req.student?.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{req.student?.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(req.requestedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td
                      className="px-6 py-4 text-slate-600 max-w-xs truncate"
                      title={req.studentReason}
                    >
                      {req.studentReason}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRequest(req)}
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

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Review Update Request</h2>
              <p className="text-sm text-slate-500">
                {selectedRequest.student?.firstName} {selectedRequest.student?.lastName}
              </p>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">
                  Student's Reason for Update
                </div>
                <div className="text-blue-900">{selectedRequest.studentReason}</div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                  Requested Changes
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-medium text-slate-600 w-1/3">Field</th>
                        <th className="px-4 py-3 font-medium text-slate-600 w-1/3">
                          Current Value
                        </th>
                        <th className="px-4 py-3 font-medium text-blue-600 w-1/3">
                          Requested Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.keys(selectedRequest.requestedChanges).map((key) => {
                        const hiddenFields = [
                          'id',
                          'userId',
                          'createdAt',
                          'updatedAt',
                          'profileStatus',
                          'verifiedAt',
                          'verifiedBy',
                          'reason',
                          'studentReason',
                          'isProfileComplete',
                          'user',
                          'applications',
                          'updateRequests',
                          'auditLogs',
                        ];
                        if (hiddenFields.includes(key)) return null;
                        const currentVal = selectedRequest.student[key];
                        const requestedVal = selectedRequest.requestedChanges[key];

                        const renderValue = (val: any, fieldKey: string) => {
                          if (val === null || val === undefined || val === '') return 'N/A';

                          // Normalize dates so they don't trigger false positives due to timestamps
                          if (
                            fieldKey === 'dateOfBirth' ||
                            fieldKey.toLowerCase().includes('date')
                          ) {
                            try {
                              const d = new Date(val);
                              if (!isNaN(d.getTime())) {
                                return d.toISOString().split('T')[0];
                              }
                            } catch {
                              // ignore invalid dates
                            }
                          }

                          if (typeof val === 'object') return JSON.stringify(val);
                          return String(val);
                        };

                        const currentRendered = renderValue(currentVal, key);
                        const requestedRendered = renderValue(requestedVal, key);

                        // Only show fields that actually changed
                        if (currentRendered !== requestedRendered) {
                          return (
                            <tr key={key}>
                              <td className="px-4 py-3 font-medium text-slate-900">{key}</td>
                              <td className="px-4 py-3 text-slate-500 break-all">
                                {currentRendered}
                              </td>
                              <td className="px-4 py-3 text-blue-600 font-medium break-all">
                                {requestedRendered}
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Admin Comment (Optional / Required if Rejecting)
                </label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Explain your decision..."
                  className="w-full h-24 p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedRequest(null);
                  setAdminComment('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAction(selectedRequest.id, 'REJECT')}
                disabled={reviewMutation.isPending}
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none"
              >
                <CancelCircleIcon className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button
                onClick={() => handleAction(selectedRequest.id, 'APPROVE')}
                disabled={reviewMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Tick02Icon className="w-4 h-4 mr-2" /> Approve Updates
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
