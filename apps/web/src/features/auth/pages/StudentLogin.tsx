import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, FormWrapper, FieldWrapper, Checkbox } from '@/components/ui';
import { GraduationCap, ArrowLeft, Building2 } from 'lucide-react';

import { authService } from '@/lib/authService';

export default function StudentLogin() {
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
      await authService.login({ email, password, role: 'STUDENT' });
      navigate('/student/dashboard');
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
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl mb-4">
            <GraduationCap className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Sign in using your NMIMS University credentials
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
          <FormWrapper onSubmit={handleLogin}>
            <div className="space-y-5">
              <FieldWrapper label="University Email ID" error="">
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  defaultValue="student.name@nmims.edu" 
                  required 
                  className="h-11"
                />
              </FieldWrapper>

              <FieldWrapper label="Password" error="">
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="current-password"
                  defaultValue="student123" 
                  required 
                  className="h-11"
                />
              </FieldWrapper>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <Checkbox id="remember-me" name="remember-me" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <Button type="submit" variant="primary" className="w-full h-11 text-base shadow-md" isLoading={isLoading}>
                  Sign in to Portal
                </Button>
              </div>
            </div>
          </FormWrapper>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="outline" className="w-full h-11 font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200">
                <svg className="w-5 h-5 mr-2 text-slate-800" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0L21 0L21 10L10 10L10 0Z" fill="#F25022"/>
                  <path d="M0 0L10 0L10 10L0 10L0 0Z" fill="#00A4EF"/>
                  <path d="M0 11L10 11L10 21L0 21L0 11Z" fill="#7FBA00"/>
                  <path d="M10 11L21 11L21 21L10 21L10 11Z" fill="#FFB900"/>
                </svg>
                Sign in with Microsoft
              </Button>
            </div>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
