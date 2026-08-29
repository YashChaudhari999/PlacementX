import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, FormWrapper, FieldWrapper, Checkbox } from '@/components/ui';
import { ArrowLeft, ShieldCheck, TrendingUp, Building } from 'lucide-react';
import { authService } from '@/lib/authService';

export default function AdminLogin() {
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

    try {
      await authService.login({ email, password, role: 'SUPER_ADMIN' });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-white">
      {/* LEFT PANEL - BRANDING & VISUALS */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 z-0" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-3xl z-0" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl z-0" />

        <div className="relative z-10 p-12 flex flex-col justify-between h-full w-full">
          <div>
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Website
            </Link>
          </div>

          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                Enterprise <span className="text-primary">Placement</span> Management
              </h1>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Empowering the placement cell to orchestrate campus drives, manage student
                applications, and collaborate seamlessly with corporate HRs.
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
                    <TrendingUp className="text-primary w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">98%</h3>
                  <p className="text-slate-400 text-sm">Placement Rate</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                    <Building className="text-blue-400 w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">250+</h3>
                  <p className="text-slate-400 text-sm">Partner Companies</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <p>Secure SSL Encrypted Connection</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                Admin Portal
              </h2>
              <p className="text-slate-500">Sign in to manage placement operations.</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-3"
              >
                <div className="mt-0.5">•</div>
                <div>{error}</div>
              </motion.div>
            )}

            <FormWrapper onSubmit={handleLogin}>
              <div className="space-y-5">
                <FieldWrapper label="Work Email" error="">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue="admin@nmims.edu"
                    required
                    className="h-12 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary bg-slate-50/50"
                  />
                </FieldWrapper>

                <FieldWrapper label="Password" error="">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    defaultValue="admin123"
                    required
                    className="h-12 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary bg-slate-50/50"
                  />
                </FieldWrapper>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="remember-me"
                      name="remember-me"
                      className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-12 text-base shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all"
                    isLoading={isLoading}
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </FormWrapper>

            <div className="mt-8 text-center text-sm text-slate-500">
              <p>
                Having trouble signing in?{' '}
                <a href="#" className="text-primary font-medium hover:underline">
                  Contact IT Support
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
