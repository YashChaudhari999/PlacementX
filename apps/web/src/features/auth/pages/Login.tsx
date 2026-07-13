import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/lib/authService';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Detect role from email domain / pattern
    const isAdmin =
      email.toLowerCase().includes('admin') ||
      email.toLowerCase().endsWith('@placement.nmims.edu') ||
      email.toLowerCase().endsWith('@nmims.edu') && !email.toLowerCase().includes('student');

    const role = isAdmin ? 'SUPER_ADMIN' : 'STUDENT';

    try {
      const user = await authService.login({ email, password, role });
      const actualRole = user?.role ?? role;
      if (actualRole === 'STUDENT') {
        navigate('/student/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT BRAND PANEL ── */}
      <div className="hidden md:flex md:w-1/2 bg-[#C8102E] flex-col items-center justify-center px-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-10 w-40 h-40 rounded-full bg-white/5" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          {/* Logo card */}
          <div className="bg-white rounded-3xl px-6 py-5 inline-flex items-center gap-6 shadow-2xl mb-10">
            {/* CSS Replica of NMIMS Logo */}
            <div className="flex flex-col items-center justify-center p-3 border-[1.5px] border-slate-800 rounded-[2rem] w-36 bg-white relative">
              <div className="text-[8px] font-bold text-slate-800 tracking-[0.2em] uppercase leading-none mb-1">SVKM'S</div>
              <div className="text-2xl font-serif font-black text-slate-900 tracking-tight leading-none mb-2">NMIMS</div>
              
              <div className="w-16 h-16 border-[1.5px] border-slate-800 rounded-b-[2rem] rounded-t-sm flex overflow-hidden mb-3 relative bg-white">
                {/* Left side black */}
                <div className="w-1/2 h-full bg-[#333333] relative">
                   <div className="absolute bottom-0 w-full h-5 flex flex-col justify-evenly px-1 pb-1">
                     <div className="w-full h-1 bg-white"></div>
                     <div className="w-full h-1 bg-white"></div>
                   </div>
                </div>
                {/* Right side split */}
                <div className="w-1/2 h-full flex flex-col bg-white">
                   <div className="h-1/2 w-full border-b-[1.5px] border-slate-800 relative">
                      <div className="absolute -left-3 bottom-0 w-6 h-8 bg-white rounded-r-full"></div>
                   </div>
                   <div className="h-1/2 w-full bg-[#A32020]"></div>
                </div>
              </div>

              {/* Decorative Leaves/Wreath approx */}
              <div className="absolute bottom-[22px] flex w-full justify-between px-3 opacity-60">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800 -rotate-45"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 12L2 12"/><path d="M12 12L12 2"/></svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800 rotate-45 scale-x-[-1]"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 12L2 12"/><path d="M12 12L12 2"/></svg>
              </div>

              <div className="text-[6px] font-bold text-slate-800 uppercase tracking-widest text-center leading-tight">
                Deemed-to-be <br/><span className="text-[7.5px]">University</span>
              </div>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <div className="text-[11px] font-bold text-gray-800 uppercase leading-tight">
                PLACEMENT<br />CELL PORTAL
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-3 leading-tight drop-shadow">
            Launch Your Career.<br />
            <span className="text-white/80">Land Your Dream.</span>
          </h1>
          <p className="text-white/70 text-sm font-medium mb-2">
            Welcome to the NMIMS PlacementX Portal.
          </p>
          <p className="text-white/60 text-sm max-w-xs mx-auto leading-relaxed">
            Your one-stop destination for placement drives, company events,
            student profiles, and much more.
          </p>

          {/* Stats row */}
          <div className="mt-10 flex items-center justify-center gap-8">
            {[
              { value: '500+', label: 'Companies' },
              { value: '95%', label: 'Placement Rate' },
              { value: '12L+', label: 'Avg. Package' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT LOGIN FORM ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex md:hidden justify-center mb-8">
            <div className="bg-[#C8102E] text-white px-6 py-3 rounded-xl text-xl font-black tracking-wide shadow-lg">
              PlacementX
            </div>
          </div>

          <h2 className="text-3xl font-black text-gray-900 text-center mb-1">Login</h2>
          <p className="text-gray-400 text-sm text-center mb-8">Sign in with your university credentials</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="University Email ID"
                className="w-full h-12 px-4 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/40 focus:border-[#C8102E] transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                className="w-full h-12 px-4 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/40 focus:border-[#C8102E] transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <a
                href="#"
                className="text-xs font-bold text-[#C8102E] hover:text-[#a00c25] transition-colors"
              >
                Forgot Password? Click Here!
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#C8102E] hover:bg-[#a00c25] text-white font-bold text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Help text */}
          <p className="mt-6 text-center text-xs text-gray-400">
            Need help?{' '}
            <a href="mailto:placement@nmims.edu" className="font-semibold text-[#C8102E] hover:underline">
              Contact Placement Cell
            </a>
          </p>

          <p className="mt-3 text-center text-[11px] text-gray-300">
            © {new Date().getFullYear()} NMIMS University · All rights reserved
          </p>
        </motion.div>
      </div>
    </div>
  );
}
