import { useState } from 'react';
import { useForm, FormProvider, useFormContext, useFieldArray } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  Building2,
  Briefcase,
  GraduationCap,
  CalendarDays,
  ClipboardCheck,
  Paperclip,
  Eye,
  Loader2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import { useEffect, useState as useState2 } from 'react';
import { toast } from 'sonner';
import { Card, Input, Button, AvatarUpload } from '@/components/ui';
import { storage } from '@/lib/firebase/config/firebaseApp';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Step definitions
const STEPS = [
  { id: 1, title: 'Company', icon: Building2 },
  { id: 2, title: 'Job Details', icon: Briefcase },
  { id: 3, title: 'Eligibility', icon: GraduationCap },
  { id: 4, title: 'Registration', icon: CalendarDays },
  { id: 5, title: 'Selection', icon: ClipboardCheck },
  { id: 6, title: 'Attachments', icon: Paperclip },
  { id: 7, title: 'Preview', icon: Eye },
];

export default function CreateDriveWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const methods = useForm({
    defaultValues: {
      companyName: '',
      logoUrl: '',
      industry: '',
      hrName: '',
      hrEmail: '',
      workMode: 'On Campus',
      jobRole: '',
      jobDescription: '',
      employmentType: 'Full Time',
      package: '', // Legacy support or visual
      ctc: '',
      variablePay: '',
      internshipStipend: '',
      ppoAvailable: false,
      bondDetails: '',
      vacancies: '',
      location: '',
      eligibleBranches: [],
      minimumCgpa: '',
      passingYear: '',
      activeBacklogs: '0',
      yearGap: '0',
      genderRestriction: 'ANY',
      maxOffers: '1',
      registrationStart: '',
      registrationEnd: '',
      nominationLink: '',
      maximumApplicants: '',
      resumeMandatory: true,
      portfolioRequired: false,
      githubRequired: false,
      selectionRounds: [
        { title: 'Online Assessment', date: '', time: '', duration: '', venue: '' },
      ],
    },
  });

  const nextStep = async () => {
    if (currentStep < 7) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      api
        .get(`/admin/drives/${id}`)
        .then((res) => {
          const d = res.data;
          let branches = [];
          try {
            branches = JSON.parse(d.eligibleBranches || '[]');
          } catch (e) {}

          methods.reset({
            companyName: d.company?.name || '',
            logoUrl: d.company?.logoUrl || '',
            industry: d.company?.industry || '',
            hrName: d.company?.hrName || '',
            hrEmail: d.company?.hrEmail || '',
            workMode: d.workMode || 'On Campus',
            jobRole: d.jobRole || '',
            jobDescription: d.jobDescription || '',
            employmentType: d.employmentType || 'Full Time',
            package: d.fixedSalary ? String(d.fixedSalary) : '',
            ctc: d.fixedSalary ? String(d.fixedSalary) : '',
            variablePay: '', // Usually not stored unless we add to schema
            internshipStipend: '',
            ppoAvailable: d.ppoAvailable || false,
            bondDetails: d.bondDetails || '',
            vacancies: d.vacancies ? String(d.vacancies) : '',
            location: '', // Not in schema directly
            eligibleBranches: branches,
            minimumCgpa: d.minimumCgpa ? String(d.minimumCgpa) : '',
            passingYear: d.passingYear ? String(d.passingYear) : '',
            activeBacklogs: d.activeBacklogsAllowed ? String(d.activeBacklogsAllowed) : '0',
            yearGap: d.yearGapAllowed ? String(d.yearGapAllowed) : '0',
            genderRestriction: d.genderRestriction || 'ANY',
            maxOffers: d.maximumLiveOffers ? String(d.maximumLiveOffers) : '1',
            registrationStart: d.registrationStart ? d.registrationStart.split('T')[0] : '',
            registrationEnd: d.registrationEnd ? d.registrationEnd.split('T')[0] : '',
            nominationLink: d.nominationLink || '',
            maximumApplicants: d.maximumApplicants ? String(d.maximumApplicants) : '',
            resumeMandatory: d.resumeMandatory !== false,
            portfolioRequired: false,
            githubRequired: false,
            selectionRounds: d.selectionRounds?.length
              ? d.selectionRounds.map((r: any) => ({
                  title: r.title || '',
                  date: r.date ? r.date.split('T')[0] : '',
                  time: r.time || '',
                  duration: r.duration || '',
                  venue: r.venue || '',
                }))
              : [{ title: 'Online Assessment', date: '', time: '', duration: '', venue: '' }],
          });
        })
        .catch((err) => {
          console.error(err);
          toast.error('Failed to load drive details');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditMode, methods]);

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        isDraft: false,
        branches: data.eligibleBranches,
        cgpa: data.minimumCgpa,
        backlogs: data.activeBacklogs,
      };

      if (isEditMode) {
        await api.put(`/admin/drives/${id}`, payload);
        toast.success('Drive Updated Successfully!');
      } else {
        await api.post('/admin/drives', payload);
        toast.success('Drive Published Successfully!');
      }
      navigate('/admin/placement-events');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save drive. Check console.');
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          {isEditMode ? 'Edit Placement Drive' : 'Create Placement Drive'}
        </h1>
        <p className="text-slate-500 mt-1">
          {isEditMode
            ? 'Update company visit details.'
            : 'Configure a new company visit and recruitment process.'}
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-slate-500">Loading drive details...</div>
      )}

      {!isLoading && (
        <>
          {/* Stepper Header */}
          <div className="mb-12 relative">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-10" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-10"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />

            <div className="flex justify-between">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-300 ${
                        isCompleted
                          ? 'border-primary text-primary'
                          : isCurrent
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${isCurrent || isCompleted ? 'text-slate-800' : 'text-slate-400'}`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Container */}
          <Card className="p-8 min-h-[500px] flex flex-col">
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="flex-1 flex flex-col relative overflow-hidden"
              >
                <div className="flex-1">
                  <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                      key={currentStep}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="w-full"
                    >
                      {currentStep === 1 && <Step1Company />}
                      {currentStep === 2 && <Step2Job />}
                      {currentStep === 3 && <Step3Eligibility />}
                      {currentStep === 4 && <Step4Registration />}
                      {currentStep === 5 && <Step5Selection />}
                      {currentStep === 6 && <Step6Attachments />}
                      {currentStep === 7 && <Step7Preview />}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  {currentStep < 7 ? (
                    <Button type="button" onClick={nextStep}>
                      Next Step
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Publish Drive
                    </Button>
                  )}
                </div>
              </form>
            </FormProvider>
          </Card>
        </>
      )}
    </div>
  );
}

// --- STEP COMPONENTS ---

function Step1Company() {
  const { register, watch, setValue } = useFormContext();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoUrl = watch('logoUrl');

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
        toast.error('Failed to upload logo.');
        setIsUploadingLogo(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setValue('logoUrl', downloadURL, { shouldDirty: true });
        setIsUploadingLogo(false);
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Company Information</h2>
        <p className="text-slate-500 text-sm mt-1">
          Basic details about the visiting organization.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2 flex flex-col items-start space-y-3">
          <label className="text-sm font-medium text-slate-700">Company Logo</label>
          <div className="relative">
            <AvatarUpload currentUrl={logoUrl} onFileSelected={handleLogoUpload} size="lg" />
            {isUploadingLogo && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full backdrop-blur-sm z-10">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">Upload a square logo for best display results.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Company Name *</label>
          <Input {...register('companyName')} placeholder="e.g. Google India" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Industry</label>
          <select
            {...register('industry')}
            className="w-full h-10 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-transparent"
          >
            <option value="">Select Industry</option>
            <option value="IT">Information Technology</option>
            <option value="Finance">Finance & Banking</option>
            <option value="Consulting">Consulting</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Company Website</label>
          <Input {...register('companyWebsite')} placeholder="https://..." />
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-700">Company Profile *</label>
          <textarea
            {...register('companyProfile')}
            rows={3}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-transparent"
            placeholder="Brief description of the company..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">HR Name</label>
          <Input {...register('hrName')} placeholder="Primary contact person" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">HR Email</label>
          <Input {...register('hrEmail')} type="email" placeholder="hr@company.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Work Mode</label>
          <select
            {...register('workMode')}
            className="w-full h-10 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-transparent"
          >
            <option value="On Campus">On Campus</option>
            <option value="Off Campus">Off Campus</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function Step2Job() {
  const { register } = useFormContext();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Job Details</h2>
        <p className="text-slate-500 text-sm mt-1">Role, package, and employment type specifics.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-700">Job Role *</label>
          <Input
            {...register('jobRole')}
            placeholder="e.g. Software Development Engineer (SDE-1)"
          />
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-700">Job Description *</label>
          <textarea
            {...register('jobDescription')}
            rows={4}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-transparent"
            placeholder="Key responsibilities and requirements..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Employment Type</label>
          <select
            {...register('employmentType')}
            className="w-full h-10 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-transparent"
          >
            <option value="Full Time">Full Time</option>
            <option value="Internship">Internship</option>
            <option value="Internship + PPO">Internship + PPO</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Fixed CTC (LPA)</label>
          <Input {...register('ctc')} type="number" step="0.1" placeholder="e.g. 12.5" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Variable Pay (LPA)</label>
          <Input {...register('variablePay')} type="number" step="0.1" placeholder="e.g. 2.0" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Internship Stipend (/mo)</label>
          <Input
            {...register('internshipStipend')}
            type="number"
            step="1000"
            placeholder="e.g. 40000"
          />
        </div>
        <div className="space-y-2 pt-8">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              {...register('ppoAvailable')}
              className="rounded border-slate-300 text-primary focus:ring-primary/20"
            />
            PPO Available
          </label>
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-700">Bond Details (if any)</label>
          <Input {...register('bondDetails')} placeholder="e.g. 2 years bond, 2 Lakhs penalty" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">No. of Vacancies</label>
          <Input
            {...register('vacancies')}
            type="number"
            placeholder="Leave empty if unspecified"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Job Location</label>
          <Input {...register('location')} placeholder="e.g. Bangalore, Mumbai" />
        </div>
      </div>
    </div>
  );
}

function Step3Eligibility() {
  const { register } = useFormContext();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Eligibility Criteria</h2>
        <p className="text-slate-500 text-sm mt-1">
          Set academic and branch requirements for applicants.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Eligible Branches (Hold Ctrl/Cmd to select multiple)
          </label>
          <select
            multiple
            {...register('eligibleBranches')}
            className="w-full h-32 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-transparent"
          >
            <option value="Information Technology">Information Technology</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="AI/ML">AI/ML</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Minimum CGPA</label>
          <Input {...register('minimumCgpa')} type="number" step="0.01" placeholder="e.g. 7.5" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Passing Year</label>
          <Input {...register('passingYear')} type="number" placeholder="e.g. 2026" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Active Backlogs Allowed</label>
          <Input {...register('activeBacklogs')} type="number" defaultValue={0} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Year Gap Allowed</label>
          <Input {...register('yearGap')} type="number" defaultValue={0} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Gender Restriction</label>
          <select
            {...register('genderRestriction')}
            className="w-full h-10 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-transparent"
          >
            <option value="ANY">Any</option>
            <option value="MALE">Male Only</option>
            <option value="FEMALE">Female Only</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Maximum Live Offers Allowed</label>
          <Input {...register('maxOffers')} type="number" defaultValue={1} />
        </div>
      </div>
    </div>
  );
}

function Step4Registration() {
  const { register } = useFormContext();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Registration Timeline</h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage application windows and document requirements.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Registration Start Date *
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="date"
                  className="pl-10"
                  {...register('registrationStart', { required: true })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Registration End Date *</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="date"
                  className="pl-10"
                  {...register('registrationEnd', { required: true })}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2 pt-4">
            <label className="text-sm font-medium text-slate-700">
              Nomination Link (External form, if any)
            </label>
            <Input placeholder="https://forms.gle/..." {...register('nominationLink')} />
          </div>
          <div className="space-y-2 pt-4">
            <label className="text-sm font-medium text-slate-700">Maximum Applicants</label>
            <Input
              type="number"
              placeholder="Leave empty for unlimited"
              {...register('maximumApplicants')}
            />
          </div>
        </div>
        <div className="col-span-2 space-y-2 mt-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-2 border-b pb-2">
            Required Documents
          </h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                {...register('resumeMandatory')}
                className="rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              Resume / CV
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                {...register('portfolioRequired')}
                className="rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              Portfolio Link
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                {...register('githubRequired')}
                className="rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              GitHub Profile
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step5Selection() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'selectionRounds',
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Selection Process</h2>
        <p className="text-slate-500 text-sm mt-1">Define the interview rounds and assessments.</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group"
          >
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Round {index + 1}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-medium text-slate-600">Round Title</label>
                <Input
                  {...register(`selectionRounds.${index}.title` as const)}
                  placeholder="e.g. Technical Interview"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Expected Date</label>
                <Input type="date" {...register(`selectionRounds.${index}.date` as const)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Time</label>
                <Input type="time" {...register(`selectionRounds.${index}.time` as const)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Duration</label>
                <Input
                  {...register(`selectionRounds.${index}.duration` as const)}
                  placeholder="e.g. 60 mins"
                />
              </div>
              <div className="space-y-2 col-span-3">
                <label className="text-xs font-medium text-slate-600">Venue / Link</label>
                <Input
                  {...register(`selectionRounds.${index}.venue` as const)}
                  placeholder="e.g. Room 402 or MS Teams link"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ title: '', date: '', time: '', duration: '', venue: '' })}
          className="w-full border-dashed py-8 text-slate-500 hover:text-slate-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Round
        </Button>
      </div>
    </div>
  );
}

function Step6Attachments() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Attachments</h2>
        <p className="text-slate-500 text-sm mt-1">
          Upload JD PDFs, PPTs, or preparation material.
        </p>
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-primary">
          <Paperclip className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Drag & Drop files here</h3>
        <p className="text-sm text-slate-500 mt-1">or click to browse from your computer</p>
        <p className="text-xs text-slate-400 mt-4">Supported formats: PDF, PPTX, DOCX (Max 10MB)</p>
      </div>
    </div>
  );
}

function Step7Preview() {
  const { getValues } = useFormContext();
  const data = getValues();

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Preview Drive</h2>
          <p className="text-slate-500 text-sm mt-1">
            Review the details before publishing to students.
          </p>
        </div>
        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full uppercase tracking-wider">
          Draft Mode
        </span>
      </div>

      <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl p-6 bg-slate-50 space-y-8">
        {/* Header Preview */}
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {data.companyName || 'Company Name'}
            </h3>
            <p className="text-slate-600 font-medium">
              {data.jobRole || 'Job Role'} • {data.employmentType}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Package (CTC)
            </p>
            <p className="font-medium text-slate-800">
              {data.package ? `${data.package} LPA` : 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Work Mode
            </p>
            <p className="font-medium text-slate-800">{data.workMode}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Minimum CGPA
            </p>
            <p className="font-medium text-slate-800">{data.minimumCgpa || 'No minimum'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Eligible Branches
            </p>
            <p className="font-medium text-slate-800">
              {data.eligibleBranches?.length ? data.eligibleBranches.join(', ') : 'All Branches'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Selection Rounds
            </p>
            <div className="flex flex-wrap gap-2">
              {data.selectionRounds?.map((r: any, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 shadow-sm"
                >
                  {i + 1}. {r.title || 'Round'}{' '}
                  {r.date ? `(${new Date(r.date).toLocaleDateString()})` : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
