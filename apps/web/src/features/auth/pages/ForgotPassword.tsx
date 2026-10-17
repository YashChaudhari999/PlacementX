import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/authService';

type Step = 'email' | 'otp' | 'password' | 'success';
const messageFor = (error: any) => error?.response?.data?.error?.message || error?.message || 'Unable to process the request. Try again.';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetGrant, setResetGrant] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const requestCode = async (resend = false) => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid registered email address.');
    setBusy(true); setError('');
    try {
      if (resend) await authService.resendPasswordReset(email);
      else await authService.sendPasswordReset(email);
      setStep('otp'); setCooldown(60); setOtp('');
    } catch (err) { setError(messageFor(err)); }
    finally { setBusy(false); }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) return setError('Enter the six-digit verification code.');
    setBusy(true); setError('');
    try {
      const result = await authService.verifyPasswordResetOtp(email, otp);
      setResetGrant(result.resetGrant); setOtp(''); setStep('password');
    } catch (err) { setError(messageFor(err)); }
    finally { setBusy(false); }
  };

  const savePassword = async () => {
    if (newPassword.length < 12) return setError('Password must be at least 12 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    setBusy(true); setError('');
    try {
      await authService.confirmResetPassword(resetGrant, newPassword);
      setResetGrant(''); setNewPassword(''); setConfirmPassword(''); setStep('success');
    } catch (err) { setError(messageFor(err)); }
    finally { setBusy(false); }
  };

  const title = step === 'email' ? 'Reset your password' : step === 'otp' ? 'Enter verification code' : step === 'password' ? 'Create a new password' : 'Password updated';

  return <main className="min-h-screen bg-[#f8f5f0] px-5 py-10 flex items-center justify-center">
    <section className="w-full max-w-md rounded-3xl border border-[#eadfd4] bg-white p-7 shadow-xl" aria-labelledby="reset-title">
      <div className="mb-7"><div className="text-2xl font-black text-[#7B1C2E]">PlacementX</div><div className="mt-2 h-1 w-12 rounded bg-[#FFC107]" /></div>
      <h1 id="reset-title" className="text-2xl font-black text-slate-900">{title}</h1>
      <p className="mt-2 mb-6 text-sm leading-6 text-slate-500">
        {step === 'email' && 'Enter your registered email. We will send a six-digit code that expires in five minutes.'}
        {step === 'otp' && `If an account exists for ${email}, a verification code has been sent.`}
        {step === 'password' && 'Use at least 12 characters. Long passphrases are supported.'}
        {step === 'success' && 'Your password has been changed. Sign in again with your new password.'}
      </p>
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {step === 'email' && <form onSubmit={event => { event.preventDefault(); requestCode(); }} className="space-y-4">
        <label className="block text-sm font-semibold">Registered email<input aria-label="Registered email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-[#7B1C2E] focus:ring-2 focus:ring-[#7B1C2E]/20" /></label>
        <button disabled={busy} className="h-12 w-full rounded-xl bg-[#7B1C2E] font-bold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send verification code'}</button>
      </form>}

      {step === 'otp' && <div className="space-y-4">
        <label className="block text-sm font-semibold">Six-digit code<input aria-label="Six-digit verification code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} className="mt-2 h-14 w-full rounded-xl border border-slate-300 px-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-[#7B1C2E]" /></label>
        <button onClick={verifyOtp} disabled={busy || otp.length !== 6} className="h-12 w-full rounded-xl bg-[#7B1C2E] font-bold text-white disabled:opacity-50">{busy ? 'Verifying…' : 'Verify code'}</button>
        <button onClick={() => requestCode(true)} disabled={busy || cooldown > 0} className="h-11 w-full rounded-xl border border-slate-300 text-sm font-semibold disabled:opacity-50">{cooldown ? `Resend code in ${cooldown}s` : 'Resend code'}</button>
      </div>}

      {step === 'password' && <form onSubmit={event => { event.preventDefault(); savePassword(); }} className="space-y-4">
        <label className="block text-sm font-semibold">New password<input aria-label="New password" type="password" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-[#7B1C2E]" /></label>
        <div className="text-xs text-slate-500" aria-live="polite">Strength: {newPassword.length >= 16 ? 'Strong' : newPassword.length >= 12 ? 'Good' : 'Too short'}</div>
        <label className="block text-sm font-semibold">Confirm password<input aria-label="Confirm password" type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-[#7B1C2E]" /></label>
        <div className="text-xs text-slate-500" aria-live="polite">{confirmPassword && (newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match')}</div>
        <button disabled={busy || newPassword.length < 12 || newPassword !== confirmPassword} className="h-12 w-full rounded-xl bg-[#7B1C2E] font-bold text-white disabled:opacity-50">{busy ? 'Updating…' : 'Update password'}</button>
      </form>}

      {step === 'success' && <button onClick={() => navigate('/login')} className="h-12 w-full rounded-xl bg-[#7B1C2E] font-bold text-white">Return to login</button>}
      {step !== 'success' && <Link to="/login" className="mt-5 block text-center text-sm font-semibold text-[#7B1C2E]">Back to login</Link>}
    </section>
  </main>;
}
