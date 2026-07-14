// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, } from '@/components/ui';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const STEPS = [
  'Company Information',
  'Job Details',
  'Eligibility',
  'Registration',
  'Selection Process',
  'Attachments',
  'Review & Submit'
];

export default function HrDriveWizard() {
  const { token } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Form State
  const [companyData, setCompanyData] = useState<any>({});
  const [driveData, setDriveData] = useState<any>({});
  const [selectionRounds, setSelectionRounds] = useState<any[]>([]);

  useEffect(() => {
    // Validate token on mount
    const validateToken = async () => {
      try {
        const response = await api.post('/hr/validate', { token });
        if (response.data.success) {
          const { drive } = response.data.data;
          setDriveData(drive);
          setCompanyData(drive.company || {});
          setSelectionRounds(drive.selectionRounds || []);
        } else {
          setError(response.data.message || 'Invalid link');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to validate link');
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  // Debounced Auto-Save
  useEffect(() => {
    if (loading || error) return;
    const saveTimer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await api.put('/hr/draft', {
          token,
          driveData: {
            ...driveData,
            // Exclude relations
            company: undefined,
            selectionRounds: undefined
          },
          companyData,
          selectionRounds
        });
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed', err);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [companyData, driveData, selectionRounds, loading, error, token]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post('/hr/submit', { token });
      alert('Drive submitted successfully!');
      // Navigate to a success page or show success state
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl max-w-xl mx-auto mt-20 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Access Denied</h2>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Stepper */}
      <div className="lg:w-1/4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
          <h3 className="font-semibold text-lg mb-6">Drive Setup Progress</h3>
          <div className="space-y-4">
            {STEPS.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 cursor-pointer ${currentStep === index ? 'text-primary font-medium' : currentStep > index ? 'text-green-600' : 'text-slate-400'}`}
                onClick={() => setCurrentStep(index)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep === index ? 'bg-primary text-white' : currentStep > index ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`}>
                  {currentStep > index ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            {isSaving ? (
              <p className="text-sm text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving draft...</p>
            ) : lastSaved ? (
              <p className="text-sm text-green-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Draft saved {lastSaved.toLocaleTimeString()}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="lg:w-3/4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Company Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                      <Input value={companyData.name || ''} onChange={(e) => setCompanyData({...companyData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                      <Input value={companyData.industry || ''} onChange={(e) => setCompanyData({...companyData, industry: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description</label>
                      <textarea 
                        className="w-full min-h-[120px] rounded-lg border border-slate-300 p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={companyData.description || ''} 
                        onChange={(e) => setCompanyData({...companyData, description: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Job Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Job Role</label>
                      <Input value={driveData.jobRole || ''} onChange={(e) => setDriveData({...driveData, jobRole: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                      <Input value={driveData.employmentType || ''} onChange={(e) => setDriveData({...driveData, employmentType: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fixed CTC (LPA)</label>
                      <Input type="number" value={driveData.fixedSalary || ''} onChange={(e) => setDriveData({...driveData, fixedSalary: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Eligibility Criteria</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700">Eligible Branches (Hold Ctrl/Cmd to select multiple)</label>
                      <select 
                        multiple 
                        className="w-full h-32 rounded-md border border-slate-300 p-3 focus:ring-2 focus:ring-primary/20"
                        value={driveData.eligibleBranches ? JSON.parse(driveData.eligibleBranches) : []}
                        onChange={(e) => {
                          const options = Array.from(e.target.selectedOptions, option => option.value);
                          setDriveData({...driveData, eligibleBranches: JSON.stringify(options)});
                        }}
                      >
                        <option value="CS">Computer Science</option>
                        <option value="IT">Information Technology</option>
                        <option value="EXTC">Electronics & Telecommunication</option>
                        <option value="MECH">Mechanical Engineering</option>
                        <option value="CIVIL">Civil Engineering</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Minimum CGPA</label>
                      <Input type="number" step="0.01" value={driveData.minimumCgpa || ''} onChange={(e) => setDriveData({...driveData, minimumCgpa: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Passing Year</label>
                      <Input type="number" value={driveData.passingYear || ''} onChange={(e) => setDriveData({...driveData, passingYear: parseInt(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Active Backlogs Allowed</label>
                      <Input type="number" value={driveData.activeBacklogsAllowed || 0} onChange={(e) => setDriveData({...driveData, activeBacklogsAllowed: parseInt(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Year Gap Allowed</label>
                      <Input type="number" value={driveData.yearGapAllowed || 0} onChange={(e) => setDriveData({...driveData, yearGapAllowed: parseInt(e.target.value)})} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Registration Timeline</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Registration Start Date</label>
                      <Input type="date" value={driveData.registrationStart ? new Date(driveData.registrationStart).toISOString().split('T')[0] : ''} onChange={(e) => setDriveData({...driveData, registrationStart: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Registration End Date</label>
                      <Input type="date" value={driveData.registrationEnd ? new Date(driveData.registrationEnd).toISOString().split('T')[0] : ''} onChange={(e) => setDriveData({...driveData, registrationEnd: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Applicants (Leave empty for unlimited)</label>
                      <Input type="number" value={driveData.maximumApplicants || ''} onChange={(e) => setDriveData({...driveData, maximumApplicants: parseInt(e.target.value) || null})} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Selection Process</h2>
                  <div className="space-y-4">
                    {selectionRounds.map((round, index) => (
                      <div key={index} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative">
                        <button 
                          type="button" 
                          onClick={() => setSelectionRounds(selectionRounds.filter((_, i) => i !== index))}
                          className="absolute top-4 right-4 text-red-500 text-sm font-medium hover:underline"
                        >
                          Remove
                        </button>
                        <h4 className="text-sm font-semibold text-slate-700 mb-4">Round {index + 1}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Round Title</label>
                            <Input value={round.title || ''} onChange={(e) => {
                              const updated = [...selectionRounds];
                              updated[index].title = e.target.value;
                              setSelectionRounds(updated);
                            }} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Expected Date</label>
                            <Input type="date" value={round.date ? new Date(round.date).toISOString().split('T')[0] : ''} onChange={(e) => {
                              const updated = [...selectionRounds];
                              updated[index].date = e.target.value;
                              setSelectionRounds(updated);
                            }} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
                            <Input value={round.duration || ''} placeholder="e.g. 60 mins" onChange={(e) => {
                              const updated = [...selectionRounds];
                              updated[index].duration = e.target.value;
                              setSelectionRounds(updated);
                            }} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setSelectionRounds([...selectionRounds, { title: '', date: '', duration: '', venue: '', roundNumber: selectionRounds.length + 1 }])}
                      className="w-full border-dashed py-8 text-slate-500 hover:text-slate-800"
                    >
                      + Add Another Round
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Attachments</h2>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <h3 className="text-base font-semibold text-slate-800">Drag & Drop files here</h3>
                    <p className="text-sm text-slate-500 mt-1">or click to browse from your computer</p>
                    <p className="text-xs text-slate-400 mt-4">Supported formats: PDF, PPTX, DOCX (Max 10MB)</p>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Review & Submit</h2>
                  <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <p className="mb-4">Please review all information before submitting to the Placement Cell. Once submitted, the Placement Cell will review your application.</p>
                    <div className="flex items-center gap-2 mt-4">
                      <input 
                        type="checkbox" 
                        id="confirm-submit" 
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSubmit();
                          }
                        }}
                      />
                      <label htmlFor="confirm-submit" className="text-sm font-medium text-slate-700 cursor-pointer">
                        I confirm that the provided details are accurate. (Clicking this will immediately submit the form)
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex justify-between pt-6 border-t border-slate-200">
            <Button variant="outline" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>Previous</Button>
            {currentStep < STEPS.length - 1 && (
              <Button onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}>Next Step</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
