import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, Button } from '@/components/ui';
import { Note01Icon, Download01Icon, Building02Icon, TickDouble02Icon } from 'hugeicons-react';
import { useUploadAcademicDocument } from '@/hooks/useStudentDocuments';

import { ListSkeleton } from '@/components/common/Skeletons';

export default function StudentDocuments() {
  const { user } = useAuthStore();
  const uploadMutation = useUploadAcademicDocument();
  
  const { data = { resumeUrl: '', offers: [], academicDocuments: [] }, isLoading } = useQuery({
    queryKey: ['studentDocuments', user?.id],
    queryFn: async () => {
      const res = await api.get('/student/documents', {});
      return res.data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) return <ListSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white/50 p-6 rounded-3xl backdrop-blur-md border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Documents</h1>
          <p className="text-lg text-slate-500 mt-1">
            Access your uploaded resumes and official offer letters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Documents */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 border border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white/90 backdrop-blur-xl hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Note01Icon className="w-5 h-5 text-primary" /> Core Documents
            </h3>

            <div className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-700">Primary Resume</span>
                  {data.resumeUrl ? <TickDouble02Icon className="w-4 h-4 text-green-500" /> : null}
                </div>
                {data.resumeUrl ? (
                  <Button
                    variant="outline"
                    className="w-full mt-2 bg-white"
                    onClick={() => window.open(data.resumeUrl, '_blank')}
                  >
                    <Note01Icon className="w-4 h-4 mr-2" /> View Resume
                  </Button>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No resume uploaded. Update it in your profile.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Academic Documents */}
          <Card className="p-6 border border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white/90 backdrop-blur-xl hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Note01Icon className="w-5 h-5 text-primary" /> Academic Documents
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload PDF copies of your marksheets. Max size 15MB each.
            </p>

            <div className="space-y-4">
              {[
                { type: '10TH_MARKSHEET', title: '10th Marksheet' },
                { type: '12TH_DIPLOMA_MARKSHEET', title: '12th / Diploma Marksheet' },
                { type: 'DEGREE_MARKSHEETS', title: 'Degree Semester-wise Marksheets (Consolidated)' },
              ].map((docDef) => {
                const uploadedDoc = data.academicDocuments?.find((d: any) => d.documentType === docDef.type);
                
                return (
                  <div key={docDef.type} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">{docDef.title}</span>
                      {uploadedDoc ? <TickDouble02Icon className="w-4 h-4 text-green-500" /> : null}
                    </div>
                    
                    {uploadedDoc ? (
                      <>
                        <p className="text-xs text-slate-500 mb-3 truncate" title={uploadedDoc.fileName}>
                          {uploadedDoc.fileName}
                        </p>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            className="w-full bg-white"
                            onClick={() => window.open(uploadedDoc.signedUrl, '_blank')}
                          >
                            <Note01Icon className="w-4 h-4 mr-2" /> View Document
                          </Button>
                          <div className="relative">
                            <input
                              type="file"
                              accept="application/pdf"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  uploadMutation.mutate({ file: e.target.files[0], documentType: docDef.type });
                                }
                              }}
                              disabled={uploadMutation.isPending}
                            />
                            <Button
                              variant="secondary"
                              className="w-full"
                              disabled={uploadMutation.isPending}
                            >
                              Replace Document
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept="application/pdf"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              uploadMutation.mutate({ file: e.target.files[0], documentType: docDef.type });
                            }
                          }}
                          disabled={uploadMutation.isPending}
                        />
                        <Button
                          className="w-full"
                          disabled={uploadMutation.isPending}
                        >
                          Upload PDF
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Offer Letters */}
        <div className="md:col-span-2">
          <Card className="p-6 h-full border border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white/90 backdrop-blur-xl hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Building02Icon className="w-5 h-5 text-emerald-600" /> Official Offer Letters
            </h3>

            {data.offers.length === 0 ? (
              <div className="text-center py-12">
                <Note01Icon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No offer letters available yet.</p>
                <p className="text-sm text-slate-400 mt-1">
                  They will appear here once a company uploads them.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.offers.map((offer: any) => (
                  <div
                    key={offer.id}
                    className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-200 hover:shadow-sm transition-all bg-white relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-0"></div>
                    <div className="relative z-10 mb-4">
                      <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block mb-2">
                        SELECTED
                      </div>
                      <h4 className="font-bold text-slate-800">{offer.company}</h4>
                      <p className="text-sm text-slate-600">{offer.role}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        Issued:{' '}
                        {new Date(offer.uploadedAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    {offer.offerLetterUrl ? (
                      <Button
                        className="w-full relative z-10"
                        onClick={() => window.open(offer.offerLetterUrl, '_blank')}
                      >
                        <Download01Icon className="w-4 h-4 mr-2" /> Download01Icon Offer
                      </Button>
                    ) : (
                      <Button className="w-full relative z-10" variant="outline" disabled>
                        Processing...
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
