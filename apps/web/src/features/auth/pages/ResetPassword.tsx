import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '@/lib/authService';
import {
  LockKeyIcon,
  ViewIcon,
  ViewOffIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ArrowLeft01Icon,
  SecurityCheckIcon,
} from 'hugeicons-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [codeError, setCodeError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // 1. Verify action code on mount using Firebase Authentication
  useEffect(() => {
    if (!oobCode) {
      setCodeError('This password reset link is invalid or has already been used.');
      setIsVerifying(false);
      return;
    }

    const verifyCode = async () => {
      try {
        const res = await authService.verifyResetCode(oobCode);
        setVerifiedEmail(res.email || '');
      } catch (err: any) {
        setCodeError(err.message || 'Unable to process this password reset request.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [oobCode]);

  // 2. Countdown timer for auto-redirect after success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isSuccess && countdown === 0) {
      navigate('/login');
    }
    return () => clearInterval(timer);
  }, [isSuccess, countdown, navigate]);

  // Client-side password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    if (!isPasswordValid) {
      if (!hasMinLength) {
        setSubmitError('Password must be at least 8 characters long.');
        return;
      }
      if (!passwordsMatch) {
        setSubmitError('Passwords do not match.');
        return;
      }
      setSubmitError('Password does not meet all required security criteria.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await authService.confirmResetPassword(oobCode, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Unable to process this password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* ── LEFT BRAND PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#7B1C2E] flex-col items-center justify-center px-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-10 w-40 h-40 rounded-full bg-white/5" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <div className="bg-white rounded-3xl px-6 py-5 inline-flex items-center gap-6 shadow-2xl mb-10">
            <img
              src="/nmimslogo_transparent.png"
              alt="NMIMS Logo"
              className="w-32 object-contain"
            />
            <div className="border-l border-gray-200 pl-4">
              <div className="text-[11px] font-bold text-gray-900 uppercase leading-tight">
                PLACEMENT
                <br />
                CELL PORTAL
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-3 leading-tight drop-shadow">
            Create New Password
          </h1>
          <p className="text-white/80 text-sm font-medium mb-2">
            PlacementX Account Security
          </p>
          <p className="text-white/60 text-sm max-w-xs mx-auto leading-relaxed">
            Ensure your new password meets all security criteria to protect your PlacementX account.
          </p>
        </motion.div>
      </div>

      {/* ── RIGHT CONTENT PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* VERIFYING STATE */}
          {isVerifying ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#7B1C2E] flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                <SecurityCheckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Verifying Reset Link…
              </h3>
              <p className="text-slate-500 text-sm">
                Please wait while we validate your reset link.
              </p>
            </div>
          ) : codeError ? (
            /* INVALID/EXPIRED CODE STATE */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-6">
                <AlertCircleIcon className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                Unable to Process Request
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                {codeError}
              </p>

              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="w-full h-12 bg-[#7B1C2E] hover:bg-[#5A1020] text-[#FFC107] font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Request New Reset Link
                </Link>

                <Link
                  to="/login"
                  className="w-full h-12 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft01Icon className="w-4 h-4" />
                  Go to Login
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            /* SUCCESS STATE */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                <CheckmarkCircle02Icon className="w-10 h-10" />
              </div>

              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                Password Reset Successful
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Your password has been updated successfully.
              </p>

              <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-2xl text-xs text-slate-500 dark:text-slate-400 mb-8">
                Redirecting to login page in{' '}
                <span className="font-bold text-[#7B1C2E] text-sm">{countdown}s</span>...
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-[#7B1C2E] hover:bg-[#5A1020] text-[#FFC107] font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                GO TO LOGIN
              </button>
            </motion.div>
          ) : (
            /* RESET FORM STATE */
            <div>
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#7B1C2E] flex items-center justify-center mb-6 shadow-inner">
                <LockKeyIcon className="w-7 h-7" />
              </div>

              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                Reset Your Password
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Enter a new password for your PlacementX account.
              </p>

              {verifiedEmail && (
                <div className="mb-5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  Account: <span className="font-semibold text-slate-900 dark:text-white">{verifiedEmail}</span>
                </div>
              )}

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-3"
                >
                  <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{submitError}</div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full h-12 px-4 pr-11 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-[#7B1C2E]/40 focus:border-[#7B1C2E] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <ViewOffIcon className="w-4 h-4" />
                      ) : (
                        <ViewIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full h-12 px-4 pr-11 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-[#7B1C2E]/40 focus:border-[#7B1C2E] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <ViewOffIcon className="w-4 h-4" />
                      ) : (
                        <ViewIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password strength indicators */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Password requirements:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                      }`}
                    >
                      <span>{hasMinLength ? '✓' : '•'}</span>
                      At least 8 characters
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                      }`}
                    >
                      <span>{hasUppercase ? '✓' : '•'}</span>
                      Contains uppercase letter
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasLowercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                      }`}
                    >
                      <span>{hasLowercase ? '✓' : '•'}</span>
                      Contains lowercase letter
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                      }`}
                    >
                      <span>{hasNumber ? '✓' : '•'}</span>
                      Contains a number
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                      }`}
                    >
                      <span>{hasSpecial ? '✓' : '•'}</span>
                      Contains a special character
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isPasswordValid}
                  className="w-full h-12 bg-[#7B1C2E] hover:bg-[#5A1020] text-[#FFC107] font-bold text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      RESETTING PASSWORD...
                    </>
                  ) : (
                    'RESET PASSWORD'
                  )}
                </button>
              </form>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} PlacementX · Campus Placement Management System
          </p>
        </motion.div>
      </div>
    </div>
  );
}
