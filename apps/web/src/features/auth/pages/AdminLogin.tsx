import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, FormWrapper, FieldWrapper, Checkbox } from '@/components/ui';
import { Building2, ArrowLeft, ShieldCheck } from 'lucide-react';
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
    <div className="w-full min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl mb-4 ring-1 ring-slate-900/10">
            <Building2 className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Placement Cell
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Secure Administrator Access Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100"
        >
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start gap-3 mb-6">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 leading-relaxed">
              This system is restricted to authorized NMIMS placement personnel only. All activities are monitored and logged.
            </p>
          </div>

          <FormWrapper onSubmit={handleLogin}>
            <div className="space-y-5">
              <FieldWrapper label={<span className="text-slate-700">Admin Email ID</span>} error="">
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  defaultValue="admin@nmims.edu" 
                  required 
                  className="h-11 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-900"
                />
              </FieldWrapper>

              <FieldWrapper label={<span className="text-slate-700">Password</span>} error="">
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="current-password"
                  defaultValue="admin123" 
                  required 
                  className="h-11 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-900"
                />
              </FieldWrapper>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <Checkbox id="remember-me" name="remember-me" className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-slate-900 hover:text-slate-700 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <Button type="submit" variant="primary" className="w-full h-11 text-base shadow-md bg-slate-900 hover:bg-slate-800 text-white" isLoading={isLoading}>
                  Authenticate
                </Button>
              </div>
            </div>
          </FormWrapper>
          
        </motion.div>
      </div>
    </div>
  );
}
