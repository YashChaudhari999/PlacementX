import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  Shield01Icon,
  Clock01Icon,
  Alert01Icon,
  Note01Icon,
  ArrowRight01Icon,
  RefreshIcon,
  TickDouble02Icon,
} from 'hugeicons-react';
import { motion } from 'framer-motion';

const STATUS_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    badge: string;
    badgeColor: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaPath: string;
  }
> = {
  NOT_COMPLETED: {
    icon: Note01Icon,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border border-amber-200',
    badge: 'Incomplete',
    badgeColor: 'bg-amber-100 text-amber-700',
    title: 'Complete Your Profile First',
    description:
      'You need to fill in all required details and submit your profile for verification before you can access the student portal.',
    ctaLabel: 'Complete My Profile',
    ctaPath: '/student/profile',
  },
  PENDING: {
    icon: Clock01Icon,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border border-blue-200',
    badge: 'Pending Submission',
    badgeColor: 'bg-blue-100 text-blue-700',
    title: 'Submit Your Profile for Verification',
    description:
      'Your profile has been saved but not yet submitted for admin review. Fill in the remaining details and submit to unlock the portal.',
    ctaLabel: 'Go to My Profile',
    ctaPath: '/student/profile',
  },
  PENDING_VERIFICATION: {
    icon: Shield01Icon,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border border-indigo-200',
    badge: 'Under Review',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    title: 'Profile is Under Review',
    description:
      'Your profile has been submitted and is currently being reviewed by the Placement Cell. You will be notified once it is verified. This typically takes 1–2 business days.',
    ctaLabel: 'View My Profile',
    ctaPath: '/student/profile',
  },
  UPDATE_REJECTED: {
    icon: Alert01Icon,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50 border border-red-200',
    badge: 'Changes Requested',
    badgeColor: 'bg-red-100 text-red-700',
    title: 'Profile Changes Requested',
    description:
      'The Placement Cell has reviewed your profile and requested some changes. Please update your profile and resubmit for verification.',
    ctaLabel: 'Update My Profile',
    ctaPath: '/student/profile',
  },
};

const STEPS = [
  { label: 'Fill in all required profile details', icon: Note01Icon },
  { label: 'Submit profile for admin verification', icon: Shield01Icon },
  { label: 'Admin reviews and verifies your profile', icon: TickDouble02Icon },
  { label: 'Full portal access unlocked', icon: ArrowRight01Icon },
];

export const ProfileUnderReview = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const status = user?.profileStatus || 'NOT_COMPLETED';
  const config = (STATUS_CONFIG[status] || STATUS_CONFIG.NOT_COMPLETED)!;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-400/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4" />

      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
            {/* Top stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

            <div className="p-8 sm:p-12">
              {/* Icon + Badge */}
              <div className="flex flex-col items-center text-center mb-8">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5, type: 'spring' }}
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 ${config.iconBg}`}
                >
                  <Icon className={`w-10 h-10 ${config.iconColor}`} />
                </motion.div>

                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-4 ${config.badgeColor}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {config.badge}
                </span>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  {config.title}
                </h1>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-md">
                  {config.description}
                </p>
              </div>

              {/* Steps */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                  How it works
                </p>
                <div className="space-y-3">
                  {STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    // Determine if this step is "done"
                    const isDone =
                      (status === 'PENDING_VERIFICATION' && i < 2) ||
                      (status === 'UPDATE_REJECTED' && i < 1) ||
                      (status === 'PENDING' && i < 1) ||
                      (status === 'VERIFIED' && i < 4);

                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                          ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}
                        >
                          {isDone ? <TickDouble02Icon className="w-4 h-4" /> : i + 1}
                        </div>
                        <span
                          className={`text-sm font-medium ${isDone ? 'text-emerald-700 line-through' : 'text-slate-700'}`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(config.ctaPath)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5"
                >
                  {config.ctaLabel}
                  <ArrowRight01Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all text-sm"
                >
                  <RefreshIcon className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center mt-4">
                For any issues, contact{' '}
                <a
                  href="mailto:placements@nmims.edu"
                  className="text-indigo-500 hover:underline font-medium"
                >
                  placements@nmims.edu
                </a>
              </p>
            </div>
          </div>

          {/* User info chip */}
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-2 text-xs text-slate-500 bg-white/60 backdrop-blur border border-slate-200/60 px-3 py-1.5 rounded-full">
              Logged in as <span className="font-semibold text-slate-700">{user?.email}</span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
