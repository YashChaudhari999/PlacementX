import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/lib/authService';
import {
  Mail01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  ArrowLeft01Icon,
  AlertCircleIcon,
  SentIcon,
  LockIcon,
  SecurityLockIcon,
} from 'hugeicons-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  defaultEmail = '',
}: ForgotPasswordModalProps) {
  const [email] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsSuccess(false);
    }
  }, [isOpen]);

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
    setIsLoading(true);
    setError('');

    try {
      await authService.sendPasswordReset(defaultEmail.trim());
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
      await authService.sendPasswordReset(defaultEmail.trim());
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(10, 4, 6, 0.75)', backdropFilter: 'blur(8px)' }}
      >
        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative w-full max-w-[420px] overflow-hidden"
          style={{
            borderRadius: '24px',
            background: '#fff',
            boxShadow: '0 32px 80px rgba(123,28,46,0.18), 0 4px 24px rgba(0,0,0,0.10)',
          }}
        >
          {/* Top gradient accent bar */}
          <div
            style={{
              height: '5px',
              background: 'linear-gradient(90deg, #7B1C2E 0%, #B5293F 50%, #7B1C2E 100%)',
            }}
          />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all"
            style={{ color: '#94a3b8' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9';
              (e.currentTarget as HTMLButtonElement).style.color = '#475569';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
            }}
            aria-label="Close modal"
          >
            <Cancel01Icon className="w-5 h-5" />
          </button>

          <div className="px-8 pb-8 pt-6">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Animated envelope icon */}
                  <motion.div
                    initial={{ scale: 0.7, rotate: -8 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
                    style={{ background: 'linear-gradient(135deg, #fef2f4 0%, #fde8eb 100%)', border: '1.5px solid #fccdd3' }}
                  >
                    <Mail01Icon className="w-7 h-7" style={{ color: '#7B1C2E' }} />
                  </motion.div>

                  <h3 className="text-2xl font-black tracking-tight mb-1.5" style={{ color: '#1a0a0e' }}>
                    Forgot Your Password?
                  </h3>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: '#64748b' }}>
                    We'll send a secure reset link to your registered email address. Check your inbox after clicking send.
                  </p>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -6, height: 0 }}
                        className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-medium"
                        style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c' }}
                      >
                        <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Read-only locked email field */}
                    <div>
                      <label
                        htmlFor="forgot-email"
                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-2.5"
                        style={{ color: '#475569' }}
                      >
                        <LockIcon className="w-3 h-3" style={{ color: '#7B1C2E' }} />
                        Sending Reset Link To
                      </label>

                      <div
                        className="relative flex items-center gap-3 px-4 rounded-xl"
                        style={{
                          height: '52px',
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                          border: '1.5px solid #e2e8f0',
                          cursor: 'not-allowed',
                        }}
                      >
                        {/* Mail icon left */}
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                          style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#7B1C2E' }}
                        >
                          <Mail01Icon className="w-4 h-4" />
                        </div>

                        {/* Email text */}
                        <span
                          className="flex-1 text-sm font-semibold truncate select-none"
                          style={{ color: '#1e293b' }}
                        >
                          {defaultEmail || 'No email provided'}
                        </span>

                        {/* Lock badge right */}
                        <div
                          className="flex items-center gap-1 px-2 py-1 rounded-md shrink-0"
                          style={{ background: '#fef3c7', border: '1px solid #fde68a' }}
                        >
                          <SecurityLockIcon className="w-3 h-3" style={{ color: '#92400e' }} />
                          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#92400e' }}>
                            Locked
                          </span>
                        </div>

                        {/* Hidden native input for form submission */}
                        <input
                          id="forgot-email"
                          type="email"
                          readOnly
                          value={defaultEmail}
                          className="sr-only"
                          tabIndex={-1}
                          aria-hidden="true"
                        />
                      </div>

                      <p className="mt-2 text-xs flex items-center gap-1" style={{ color: '#94a3b8' }}>
                        <LockIcon className="w-3 h-3" />
                        This is your registered account email. It cannot be changed here.
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 font-semibold text-sm rounded-xl transition-all"
                        style={{
                          height: '48px',
                          border: '1.5px solid #e2e8f0',
                          color: '#475569',
                          background: '#fff',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading || !defaultEmail}
                        className="flex-[2] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                        style={{
                          height: '48px',
                          background: isLoading ? '#9a2236' : '#7B1C2E',
                          color: '#FFC107',
                          boxShadow: '0 4px 16px rgba(123,28,46,0.35)',
                          opacity: isLoading || !defaultEmail ? 0.75 : 1,
                          cursor: isLoading || !defaultEmail ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!isLoading && defaultEmail)
                            (e.currentTarget as HTMLButtonElement).style.background = '#5A1020';
                        }}
                        onMouseLeave={(e) => {
                          if (!isLoading && defaultEmail)
                            (e.currentTarget as HTMLButtonElement).style.background = '#7B1C2E';
                        }}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span>SENDING...</span>
                          </>
                        ) : (
                          <>
                            <SentIcon className="w-4 h-4" />
                            <span>SEND RESET LINK</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                /* ─── Success View ─── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  className="text-center py-2"
                >
                  {/* Success icon with ring animation */}
                  <div className="relative mx-auto mb-5 w-20 h-20 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.15)' }}
                    />
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: '2px solid #6ee7b7' }}
                    >
                      <CheckmarkCircle02Icon className="w-10 h-10" style={{ color: '#059669' }} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black tracking-tight mb-2" style={{ color: '#1a0a0e' }}>
                    Email Sent!
                  </h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748b' }}>
                    Check your inbox. A secure password reset link has been sent to:
                  </p>

                  {/* Email pill */}
                  <div
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl mb-6 max-w-full"
                    style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                  >
                    <Mail01Icon className="w-4 h-4 shrink-0" style={{ color: '#7B1C2E' }} />
                    <span className="text-sm font-bold truncate" style={{ color: '#1e293b' }}>
                      {email || defaultEmail}
                    </span>
                  </div>

                  {/* Spam hint */}
                  <div
                    className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 text-left"
                    style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
                  >
                    <span className="text-base shrink-0">💡</span>
                    <p className="text-xs leading-relaxed" style={{ color: '#92400e' }}>
                      Can't find the email? Check your <strong>Spam</strong> or <strong>Junk</strong> folder. The link expires in 1 hour.
                    </p>
                  </div>

                  {error && (
                    <div
                      className="mb-4 p-3 rounded-xl text-xs flex items-start gap-2"
                      style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c' }}
                    >
                      <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Resend button */}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={cooldown > 0 || isLoading}
                      className="w-full font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                      style={{
                        height: '46px',
                        border: '1.5px solid #e2e8f0',
                        color: cooldown > 0 ? '#94a3b8' : '#475569',
                        background: '#fff',
                        cursor: cooldown > 0 || isLoading ? 'not-allowed' : 'pointer',
                        opacity: cooldown > 0 || isLoading ? 0.65 : 1,
                      }}
                    >
                      {isLoading ? (
                        <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Sending...</>
                      ) : cooldown > 0 ? (
                        <>
                          <span
                            className="inline-flex items-center justify-center rounded-md text-xs font-bold px-2 py-0.5"
                            style={{ background: '#f1f5f9', color: '#7B1C2E', minWidth: '36px' }}
                          >
                            {cooldown}s
                          </span>
                          Resend available in {cooldown}s
                        </>
                      ) : (
                        'Resend Reset Email'
                      )}
                    </button>

                    {/* Return to Login */}
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full font-bold text-sm rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
                      style={{
                        height: '46px',
                        background: '#7B1C2E',
                        color: '#FFC107',
                        boxShadow: '0 4px 16px rgba(123,28,46,0.30)',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#5A1020';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#7B1C2E';
                      }}
                    >
                      <ArrowLeft01Icon className="w-4 h-4" />
                      <span>Return to Login</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
