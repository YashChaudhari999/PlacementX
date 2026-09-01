import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, Button } from '@/components/ui';
import { Note01Icon, Download01Icon, Building02Icon, TickDouble02Icon, UserEdit01Icon, CloudUploadIcon, File01Icon } from 'hugeicons-react';
import { useUploadAcademicDocument } from '@/hooks/useStudentDocuments';
import { Link } from 'react-router-dom';
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

  // Helper to check if a specific document is currently uploading
  const isUploading = (type: string) => 
    uploadMutation.isPending && uploadMutation.variables?.documentType === type;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white/70 p-8 rounded-3xl backdrop-blur-xl border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Note01Icon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Document Vault</h1>
            <p className="text-base text-slate-500 mt-1 max-w-lg">
              Manage your academic records, primary resume, and official placement offer letters in one secure place.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Documents */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Primary Resume */}
          <Card className="p-6 border-slate-200/60 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur-xl hover:border-indigo-200 transition-all duration-300">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <File01Icon className="w-5 h-5 text-indigo-600" /> Primary Resume
            </h3>

            <div className={`p-5 border rounded-xl flex flex-col items-center justify-center text-center transition-all ${data.resumeUrl ? 'border-emerald-100 bg-emerald-50/50' : 'border-dashed border-slate-200 bg-slate-50/50'}`}>
              {data.resumeUrl ? (
                <>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                    <TickDouble02Icon className="w-6 h-6" />
                  </div>
                  <p className="font-medium text-emerald-800 mb-4">Resume Uploaded & Active</p>
                  <Button
                    variant="outline"
                    className="w-full bg-white border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={() => window.open(data.resumeUrl, '_blank')}
                  >
                    <Note01Icon className="w-4 h-4 mr-2" /> View Resume
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                    <Note01Icon className="w-6 h-6" />
                  </div>
                  <p className="font-medium text-slate-700 mb-1">No Resume Found</p>
                  <p className="text-xs text-slate-500 mb-4">You must upload your resume in your profile before applying to drives.</p>
                  <Link to="/student/profile" className="w-full">
                    <Button variant="primary" className="w-full">
                      <UserEdit01Icon className="w-4 h-4 mr-2" /> Update Profile
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </Card>

          {/* Academic Documents */}
          <Card className="p-6 border-slate-200/60 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur-xl hover:border-indigo-200 transition-all duration-300">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Note01Icon className="w-5 h-5 text-indigo-600" /> Academic Records
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Upload clear PDF scans of your marksheets. These are required for your profile completion and are verified by the placement cell. Max 15MB each.
            </p>

            <div className="space-y-4">
              {[
                { type: '10TH_MARKSHEET', title: '10th Marksheet' },
                { type: '12TH_DIPLOMA_MARKSHEET', title: '12th / Diploma Marksheet' },
                { type: 'DEGREE_MARKSHEETS', title: 'Degree Marksheets (Consolidated)' },
              ].map((docDef) => {
                const uploadedDoc = data.academicDocuments?.find((d: any) => d.documentType === docDef.type);
                const uploading = isUploading(docDef.type);
                const anyUploading = uploadMutation.isPending;
                
                return (
                  <div key={docDef.type} className={`p-4 border rounded-xl transition-all ${uploadedDoc ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-2">
                        <span className="font-semibold text-sm text-slate-800 block">{docDef.title}</span>
                        {uploadedDoc && (
                          <span className="text-[10px] text-slate-500 truncate block mt-1" title={uploadedDoc.fileName}>
                            {uploadedDoc.fileName}
                          </span>
                        )}
                      </div>
                      {uploadedDoc && !uploading && (
                        <TickDouble02Icon className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    
                    {uploadedDoc ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-white hover:bg-slate-50 text-xs h-8"
                          onClick={() => window.open(uploadedDoc.signedUrl, '_blank')}
                        >
                          View
                        </Button>
                        <div className="relative flex-1">
                          <input
                            type="file"
                            accept="application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                uploadMutation.mutate({ file: e.target.files[0], documentType: docDef.type });
                              }
                            }}
                            disabled={anyUploading}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full text-xs h-8"
                            disabled={anyUploading}
                          >
                            {uploading ? 'Uploading...' : 'Replace'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group">
                        <input
                          type="file"
                          accept="application/pdf"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              uploadMutation.mutate({ file: e.target.files[0], documentType: docDef.type });
                            }
                          }}
                          disabled={anyUploading}
                        />
                        <div className={`w-full py-2.5 px-3 border border-dashed rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${uploading ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-300 text-slate-600 group-hover:border-indigo-400 group-hover:bg-indigo-50/50 group-hover:text-indigo-600'}`}>
                          {uploading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <CloudUploadIcon className="w-4 h-4" />
                              Upload PDF
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Offer Letters */}
        <div className="lg:col-span-2">
          <Card className="p-8 h-full border-slate-200/60 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                  <Building02Icon className="w-6 h-6 text-emerald-600" /> Official Offer Letters
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Download and review your placement offers.
                </p>
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                {data.offers.length} {data.offers.length === 1 ? 'Offer' : 'Offers'}
              </div>
            </div>

            {data.offers.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                  <Building02Icon className="w-10 h-10 text-slate-300" />
                </div>
                <h4 className="text-lg font-semibold text-slate-700 mb-1">No Offers Yet</h4>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  When you are selected in a placement drive and the company issues an official letter, it will securely appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.offers.map((offer: any) => (
                  <div
                    key={offer.id}
                    className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all bg-white relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100 to-transparent opacity-50 group-hover:opacity-100 transition-opacity rounded-bl-full -z-0"></div>
                    
                    <div className="relative z-10 mb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          Final Selection
                        </div>
                        <TickDouble02Icon className="w-5 h-5 text-emerald-500" />
                      </div>
                      
                      <h4 className="font-bold text-lg text-slate-900 leading-tight mb-1">{offer.company}</h4>
                      <p className="font-medium text-indigo-600 text-sm mb-3">{offer.role}</p>
                      
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-md inline-flex">
                        <span className="font-semibold">Issued:</span>
                        {new Date(offer.uploadedAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    
                    {offer.offerLetterUrl ? (
                      <Button
                        className="w-full relative z-10 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                        onClick={() => window.open(offer.offerLetterUrl, '_blank')}
                      >
                        <Download01Icon className="w-4 h-4 mr-2" /> Download Offer
                      </Button>
                    ) : (
                      <Button className="w-full relative z-10" variant="outline" disabled>
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
                        Processing Letter...
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
