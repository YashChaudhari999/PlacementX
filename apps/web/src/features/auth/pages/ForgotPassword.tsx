import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/authService';
import {
  Mail01Icon,
  CheckmarkCircle02Icon,
  ArrowLeft01Icon,
  AlertCircleIcon,
  SentIcon,
} from 'hugeicons-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.sendPasswordReset(email.trim());
      setIsSuccess(true);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      await authService.sendPasswordReset(email.trim());
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT BRAND PANEL ── */}
      <div className="hidden md:flex md:w-1/2 bg-[#7B1C2E] flex-col items-center justify-center px-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-10 w-40 h-40 rounded-full bg-white/5" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          {/* Logo Card */}
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
            Password Recovery
          </h1>
          <p className="text-white/80 text-sm font-medium mb-2">
            PlacementX Account Security
          </p>
          <p className="text-white/60 text-sm max-w-xs mx-auto leading-relaxed">
            Quickly recover access to your placement portal using your registered email address.
          </p>
        </motion.div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#7B1C2E] transition-colors gap-1.5"
            >
              <ArrowLeft01Icon className="w-4 h-4" /> Back to Login
            </Link>
          </div>

          {!isSuccess ? (
            <div>
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#7B1C2E] flex items-center justify-center mb-6 shadow-inner">
                <Mail01Icon className="w-7 h-7" />
              </div>

              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                Forgot Your Password?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                Enter your registered email address and we'll send you a secure password reset link.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-3"
                >
                  <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{error}</div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="page-email"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="page-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full h-12 px-4 pl-11 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-[#7B1C2E]/40 focus:border-[#7B1C2E] transition-all"
                    />
                    <Mail01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#7B1C2E] hover:bg-[#5A1020] text-[#FFC107] font-bold text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  {isLoading ? (
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
                      SENDING...
                    </>
                  ) : (
                    <>
                      <SentIcon className="w-4 h-4" />
                      SEND RESET LINK
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
                <CheckmarkCircle02Icon className="w-9 h-9" />
              </div>

              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                Check your email. If an account exists with this email, we've sent you a password reset link.
              </p>
              <div className="bg-slate-100 dark:bg-slate-800 py-3 px-5 rounded-xl text-slate-900 dark:text-white font-bold text-sm mb-5 break-all inline-block max-w-full">
                {email}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || isLoading}
                  className="w-full h-12 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading
                    ? 'Sending...'
                    : cooldown > 0
                    ? `Resend link in ${cooldown}s`
                    : 'Resend Reset Email'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full h-12 bg-[#7B1C2E] hover:bg-[#5A1020] text-[#FFC107] font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ArrowLeft01Icon className="w-4 h-4" />
                  Proceed to Login
                </button>
              </div>
            </motion.div>
          )}

          <p className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} PlacementX · Campus Placement Management System
          </p>
        </motion.div>
      </div>
    </div>
  );
}
