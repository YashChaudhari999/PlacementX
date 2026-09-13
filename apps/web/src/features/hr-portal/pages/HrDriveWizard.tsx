import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, AvatarUpload } from '@/components/ui';
import {
  TickDouble02Icon,
  Alert02Icon,
  Loading02Icon,
  CloudUploadIcon,
  Delete01Icon,
  Building02Icon,
  UserCircle02Icon,
  BookOpen01Icon,
  Clock04Icon,
  Attachment01Icon,
  Tick01Icon,
} from 'hugeicons-react';
import api from '@/lib/api';
import { storage } from '@/lib/firebase/config/firebaseApp';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Loading } from '@/components/common/Loading';
const STEPS = [
  { title: 'Company Information', icon: Building02Icon },
  { title: 'Job Details', icon: UserCircle02Icon },
  { title: 'Eligibility', icon: BookOpen01Icon },
  { title: 'Registration', icon: Clock04Icon },
  { title: 'Selection Process', icon: Tick01Icon },
  { title: 'Attachments', icon: Attachment01Icon },
  { title: 'Review & Submit', icon: TickDouble02Icon },
];

export default function HrDriveWizard() {
  const { token } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

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

  const handleLogoUpload = (file: File) => {
    if (!file) return;
    setIsUploadingLogo(true);
    const storageRef = ref(storage, `companies/logos/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      null,
      (err) => {
        console.error('Logo upload failed:', err);
        alert('Failed to upload logo.');
        setIsUploadingLogo(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setCompanyData((prev: any) => ({ ...prev, logoUrl: downloadURL }));
        setIsUploadingLogo(false);
      }
    );
  };

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
            selectionRounds: undefined,
          },
          companyData,
          selectionRounds,
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

  if (loading)
    return (
      <Loading message="Authenticating Session... Please wait while we verify your secure link." />
    );

  if (error)
    return (
      <div className="bg-card border border-destructive/20 shadow-xl shadow-destructive/5 p-10 rounded-3xl max-w-xl mx-auto mt-20 text-center">
        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Alert02Icon className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-lg">{error}</p>
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      {/* Sidebar Stepper */}
      <div className="lg:w-1/3 xl:w-1/4">
        <div className="bg-card rounded-3xl shadow-sm border border-border p-8 sticky top-24">
          <h3 className="font-extrabold text-xl mb-8 text-foreground">Drive Setup</h3>
          <div className="space-y-0 relative">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border z-0"></div>
            {STEPS.map((step, index) => {
              const isActive = currentStep === index;
              const isCompleted = currentStep > index;
              const Icon = step.icon;

              return (
                <div
                  key={index}
                  className={`relative z-10 flex items-start gap-4 py-4 cursor-pointer group transition-all`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110'
                        : isCompleted
                          ? 'bg-success text-success-foreground shadow-success/20'
                          : 'bg-card border-2 border-border text-muted-foreground group-hover:border-primary/50'
                    }`}
                  >
                    {isCompleted ? (
                      <TickDouble02Icon className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="pt-2.5">
                    <span
                      className={`block font-bold ${
                        isActive
                          ? 'text-foreground text-lg'
                          : isCompleted
                            ? 'text-success'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </span>
                    {isActive && (
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1 block">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div
              className={`flex items-center gap-3 p-4 rounded-2xl ${
                isSaving
                  ? 'bg-warning/10 text-warning'
                  : lastSaved
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {isSaving ? (
                <>
                  <Loading02Icon className="w-5 h-5 animate-spin" />
                  <div>
                    <p className="text-sm font-bold">Saving Draft...</p>
                    <p className="text-xs opacity-80">Syncing with secure server</p>
                  </div>
                </>
              ) : lastSaved ? (
                <>
                  <TickDouble02Icon className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-bold">All Changes Saved</p>
                    <p className="text-xs opacity-80">
                      Last saved at {lastSaved.toLocaleTimeString()}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Alert02Icon className="w-5 h-5" />
                  <p className="text-sm font-medium">Changes auto-save</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="lg:w-2/3 xl:w-3/4">
        <div className="bg-card rounded-3xl shadow-sm border border-border p-8 md:p-12 min-h-[600px] flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* 1. Company Info */}
                {currentStep === 0 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                        Company Information
                      </h2>
                      <p className="text-muted-foreground mt-2 text-lg">
                        Provide details about your organization for the students.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="col-span-1 md:col-span-2 flex flex-col items-start space-y-3">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Company Logo
                        </label>
                        <div className="relative">
                          <AvatarUpload
                            currentUrl={companyData.logoUrl}
                            onFileSelected={handleLogoUpload}
                            size="lg"
                          />
                          {isUploadingLogo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-card/60 rounded-full backdrop-blur-sm z-10">
                              <Loading02Icon className="w-8 h-8 animate-spin text-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Upload a square logo for best display results.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Company Name
                        </label>
                        <Input
                          value={companyData.name || ''}
                          onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                          className="h-14 bg-muted border-border focus:bg-card text-lg rounded-xl"
                          placeholder="e.g. Acme Corp"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Industry
                        </label>
                        <Input
                          value={companyData.industry || ''}
                          onChange={(e) =>
                            setCompanyData({ ...companyData, industry: e.target.value })
                          }
                          className="h-14 bg-muted border-border focus:bg-card text-lg rounded-xl"
                          placeholder="e.g. Software Technology"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Detailed Description
                        </label>
                        <textarea
                          className="w-full min-h-[160px] rounded-xl border border-border bg-muted p-4 focus:ring-2 focus:ring-ring focus:border-ring focus:bg-card transition-all outline-none text-lg resize-y text-foreground"
                          value={companyData.description || ''}
                          onChange={(e) =>
                            setCompanyData({ ...companyData, description: e.target.value })
                          }
                          placeholder="Describe your company, culture, and mission..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Job Details */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                        Job Details
                      </h2>
                      <p className="text-muted-foreground mt-2 text-lg">
                        Define the role and compensation being offered.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Job Role / Title
                        </label>
                        <Input
                          value={driveData.jobRole || ''}
                          onChange={(e) => setDriveData({ ...driveData, jobRole: e.target.value })}
                          className="h-14 bg-muted border-border focus:bg-card text-lg rounded-xl"
                          placeholder="e.g. Software Development Engineer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Employment Type
                        </label>
                        <select
                          className="w-full h-14 px-4 rounded-xl border border-border bg-muted text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all focus:bg-card"
                          value={driveData.employmentType || ''}
                          onChange={(e) =>
                            setDriveData({ ...driveData, employmentType: e.target.value })
                          }
                        >
                          <option value="">Select Type</option>
                          <option value="Full-Time">Full-Time</option>
                          <option value="Internship">Internship</option>
                          <option value="Internship + PPO">Internship + PPO</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Fixed CTC (LPA)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                            ₹
                          </span>
                          <Input
                            type="number"
                            value={driveData.fixedSalary || ''}
                            onChange={(e) =>
                              setDriveData({
                                ...driveData,
                                fixedSalary: parseFloat(e.target.value),
                              })
                            }
                            className="h-14 pl-10 bg-muted border-border focus:bg-card text-lg rounded-xl"
                            placeholder="e.g. 12.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Eligibility */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                        Eligibility Criteria
                      </h2>
                      <p className="text-muted-foreground mt-2 text-lg">
                        Set strict filters. Only students meeting these criteria can apply.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="col-span-2 space-y-2">
                        <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                          Eligible Branches{' '}
                          <span className="normal-case text-muted-foreground font-medium">
                            (Hold Ctrl/Cmd to multi-select)
                          </span>
                        </label>
                        <select
                          multiple
                          className="w-full h-40 rounded-xl border border-border bg-muted text-foreground p-4 focus:ring-2 focus:ring-ring focus:border-ring focus:bg-card transition-all text-lg custom-scrollbar"
                          value={
                            driveData.eligibleBranches ? JSON.parse(driveData.eligibleBranches) : []
                          }
                          onChange={(e) => {
                            const options = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            setDriveData({
                              ...driveData,
                              eligibleBranches: JSON.stringify(options),
                            });
                          }}
                        >
                          <option value="Information Technology" className="py-1">
                            Information Technology
                          </option>
                          <option value="Computer Science" className="py-1">
                            Computer Science
                          </option>
                          <option value="Computer Engineering" className="py-1">
                            Computer Engineering
                          </option>
                          <option value="AI/ML" className="py-1">
                            AI/ML
                          </option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Minimum CGPA
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={driveData.minimumCgpa || ''}
                          onChange={(e) =>
                            setDriveData({ ...driveData, minimumCgpa: parseFloat(e.target.value) })
                          }
                          className="h-14 bg-muted border-border focus:bg-card text-lg rounded-xl"
                          placeholder="e.g. 7.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Passing Year
                        </label>
                        <Input
                          type="number"
                          value={driveData.passingYear || ''}
                          onChange={(e) =>
                            setDriveData({ ...driveData, passingYear: parseInt(e.target.value) })
                          }
                          className="h-14 bg-muted border-border focus:bg-card text-lg rounded-xl"
                          placeholder="e.g. 2025"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Active Backlogs Allowed
                        </label>
                        <Input
                          type="number"
                          value={driveData.activeBacklogsAllowed || 0}
                          onChange={(e) =>
                            setDriveData({
                              ...driveData,
                              activeBacklogsAllowed: parseInt(e.target.value),
                            })
                          }
                          className="h-14 bg-muted border-border focus:bg-card text-lg rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Year Gap Allowed
                        </label>
                        <Input
                          type="number"
                          value={driveData.yearGapAllowed || 0}
                          onChange={(e) =>
                            setDriveData({ ...driveData, yearGapAllowed: parseInt(e.target.value) })
                          }
                          className="h-14 bg-muted border-border focus:bg-card text-lg rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Registration */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                        Registration Timeline
                      </h2>
                      <p className="text-muted-foreground mt-2 text-lg">
                        Define when students can start and stop applying.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Start Date
                        </label>
                        <Input
                          type="date"
                          value={
                            driveData.registrationStart
                              ? new Date(driveData.registrationStart).toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            setDriveData({ ...driveData, registrationStart: e.target.value })
                          }
                          className="h-14 bg-muted border-border focus:bg-card text-lg rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          End Date
                        </label>
                        <Input
                          type="date"
                          value={
                            driveData.registrationEnd
                              ? new Date(driveData.registrationEnd).toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            setDriveData({ ...driveData, registrationEnd: e.target.value })
                          }
                          className="h-14 bg-muted border-border focus:bg-card text-lg rounded-xl"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
                          Maximum Applicants{' '}
                          <span className="normal-case text-muted-foreground font-medium">
                            (Leave empty for unlimited)
                          </span>
                        </label>
                        <Input
                          type="number"
                          value={driveData.maximumApplicants || ''}
                          onChange={(e) =>
                            setDriveData({
                              ...driveData,
                              maximumApplicants: parseInt(e.target.value) || null,
                            })
                          }
                          className="h-14 bg-muted border-border focus:bg-card text-lg rounded-xl"
                          placeholder="e.g. 500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Selection Process */}
                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                        Selection Process
                      </h2>
                      <p className="text-muted-foreground mt-2 text-lg">
                        Outline the interview and assessment rounds students should expect.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <AnimatePresence>
                        {selectionRounds.map((round, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, height: 0 }}
                            className="p-6 border border-border rounded-3xl bg-muted/50 shadow-sm relative group overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setSelectionRounds(selectionRounds.filter((_, i) => i !== index))
                              }
                              className="absolute top-6 right-6 text-muted-foreground hover:text-destructive p-2 rounded-full hover:bg-destructive/10 transition-colors"
                              title="Remove Round"
                            >
                              <Delete01Icon className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <h4 className="text-lg font-bold text-foreground">Round Details</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="md:col-span-2 space-y-2">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                  Round Title
                                </label>
                                <Input
                                  value={round.title || ''}
                                  placeholder="e.g. Online Technical Assessment"
                                  className="bg-card"
                                  onChange={(e) => {
                                    const updated = [...selectionRounds];
                                    updated[index].title = e.target.value;
                                    setSelectionRounds(updated);
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                  Expected Date
                                </label>
                                <Input
                                  type="date"
                                  className="bg-card"
                                  value={
                                    round.date
                                      ? new Date(round.date).toISOString().split('T')[0]
                                      : ''
                                  }
                                  onChange={(e) => {
                                    const updated = [...selectionRounds];
                                    updated[index].date = e.target.value;
                                    setSelectionRounds(updated);
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                  Duration
                                </label>
                                <Input
                                  value={round.duration || ''}
                                  placeholder="e.g. 60 mins"
                                  className="bg-card"
                                  onChange={(e) => {
                                    const updated = [...selectionRounds];
                                    updated[index].duration = e.target.value;
                                    setSelectionRounds(updated);
                                  }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setSelectionRounds([
                            ...selectionRounds,
                            {
                              title: '',
                              date: '',
                              duration: '',
                              venue: '',
                              roundNumber: selectionRounds.length + 1,
                            },
                          ])
                        }
                        className="w-full border-2 border-dashed border-border bg-transparent py-8 text-muted-foreground font-bold hover:bg-muted hover:text-foreground rounded-3xl"
                      >
                        + Add Assessment Round
                      </Button>
                    </div>
                  </div>
                )}

                {/* 6. Attachments */}
                {currentStep === 5 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                        Attachments
                      </h2>
                      <p className="text-muted-foreground mt-2 text-lg">
                        Upload Job Descriptions (JD) or company presentation decks.
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-muted hover:bg-muted/80 hover:border-primary/50 transition-colors cursor-pointer group">
                      <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center shadow-sm border border-border mb-6 group-hover:scale-110 transition-transform">
                        <CloudUploadIcon className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">Drag & Drop files here</h3>
                      <p className="text-base text-muted-foreground mt-2">
                        or click to browse from your computer
                      </p>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-6">
                        Supported formats: PDF, PPTX, DOCX (Max 10MB)
                      </p>
                    </div>
                  </div>
                )}

                {/* 7. Review */}
                {currentStep === 6 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                        Review & Submit
                      </h2>
                      <p className="text-muted-foreground mt-2 text-lg">
                        You are almost done! Confirm your details to publish.
                      </p>
                    </div>

                    <div className="bg-muted p-8 rounded-3xl border border-border shadow-inner">
                      <h4 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                        <Alert02Icon className="w-5 h-5 text-warning" />
                        Final Confirmation
                      </h4>
                      <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                        Please review all information before submitting to the NMIMS Placement Cell.
                        Once submitted, the placement cell will review and publish your drive to the
                        eligible students.
                      </p>

                      <label className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border cursor-pointer hover:border-primary/50 transition-colors">
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={isConfirmed}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-ring"
                            onChange={(e) => {
                              setIsConfirmed(e.target.checked);
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            I confirm that all provided details are accurate.
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Check this box to enable the submit button.
                          </p>
                        </div>
                      </label>

                      {isConfirmed && (
                        <div className="mt-8 flex justify-end">
                          <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="h-12 px-8 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                          >
                            {loading ? (
                              <Loading02Icon className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                              <TickDouble02Icon className="w-5 h-5 mr-2" />
                            )}
                            Submit Drive
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form Navigation */}
          <div className="mt-12 flex justify-between items-center pt-8 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="h-12 px-6 rounded-xl font-bold text-foreground border-border hover:bg-muted"
            >
              Previous Step
            </Button>

            {currentStep < STEPS.length - 1 && (
              <Button
                onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
                className="h-12 px-8 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                Next Step
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
