import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/lib/authService';
import api from '@/lib/api';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    companies: '500+',
    placementRate: '95%',
    avgPackage: '12L+',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/public/stats');
        const data = response.data;
        setStats({
          companies: `${data.companies}+`,
          placementRate: `${data.placementRate}%`,
          avgPackage: `${data.avgPackageLPA}L+`,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

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
      (email.toLowerCase().endsWith('@nmims.edu') && !email.toLowerCase().includes('student'));

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
            {/* NMIMS Logo */}
            <img
              src="/nmimslogo.png"
              alt="NMIMS Logo"
              className="w-32 object-contain mix-blend-multiply"
            />
            <div className="border-l border-gray-200 pl-4">
              <div className="text-[11px] font-bold text-gray-800 uppercase leading-tight">
                PLACEMENT
                <br />
                CELL PORTAL
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-3 leading-tight drop-shadow">
            Launch Your Career.
            <br />
            <span className="text-white/80">Land Your Dream.</span>
          </h1>
          <p className="text-white/70 text-sm font-medium mb-2">
            Welcome to the NMIMS PlacementX Portal.
          </p>
          <p className="text-white/60 text-sm max-w-xs mx-auto leading-relaxed">
            Your one-stop destination for placement drives, company events, student profiles, and
            much more.
          </p>

          {/* Stats row */}
          <div className="mt-10 flex items-center justify-center gap-8">
            {[
              { value: stats.companies, label: 'Companies' },
              { value: stats.placementRate, label: 'Placement Rate' },
              { value: stats.avgPackage, label: 'Avg. Package' },
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
          <p className="text-gray-400 text-sm text-center mb-8">
            Sign in with your university credentials
          </p>

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
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="Password"
                className="w-full h-12 px-4 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/40 focus:border-[#C8102E] transition-all bg-gray-50 focus:bg-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
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
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
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
            <a
              href="mailto:placement@nmims.edu"
              className="font-semibold text-[#C8102E] hover:underline"
            >
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
