import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, FormWrapper, FieldWrapper, Checkbox } from '@/components/ui';
import { GraduationCap, ArrowLeft, Rocket, Briefcase, Award } from 'lucide-react';
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
    <div className="w-full min-h-screen flex bg-white">
      
      {/* LEFT PANEL - STUDENT SUCCESS BRANDING */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-primary overflow-hidden">
        {/* Background Gradients & Patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-600 z-0" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0" />
        
        {/* Glowing Orbs */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/20 rounded-full blur-3xl z-0" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl z-0" />

        <div className="relative z-10 p-12 flex flex-col justify-between h-full w-full text-white">
          <div>
            <Link to="/" className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </div>

          <div className="max-w-md mt-12 mb-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white text-primary mb-8 shadow-xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-extrabold mb-6 leading-tight">
                Launch Your <br/><span className="text-blue-200">Dream Career</span>
              </h1>
              <p className="text-white/80 text-lg mb-10 leading-relaxed">
                Connect with top-tier companies, manage your placement journey, and unlock exclusive campus opportunities.
              </p>

              {/* Stats Highlights */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">500+ Offers</h4>
                    <p className="text-white/70 text-sm">Secured last academic year</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                  <div className="w-12 h-12 bg-blue-400/30 rounded-full flex items-center justify-center shrink-0">
                    <Rocket className="w-6 h-6 text-blue-100" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Highest CTC</h4>
                    <p className="text-white/70 text-sm">₹ 42 LPA Domestic</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-white/70 font-medium">
            <Award className="w-5 h-5 text-yellow-300" />
            <p>NMIMS Official Placement Portal</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 relative bg-slate-50">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
          >
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Student Portal</h2>
              <p className="text-slate-500 text-sm">Sign in with your university credentials.</p>
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
                <FieldWrapper label="University Email" error="">
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    autoComplete="email" 
                    defaultValue="student.name@nmims.edu" 
                    required 
                    className="h-12 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary bg-slate-50/50 rounded-xl"
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
                    className="h-12 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary bg-slate-50/50 rounded-xl"
                  />
                </FieldWrapper>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <Checkbox id="remember-me" name="remember-me" className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded text-primary focus:ring-primary" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary" className="w-full h-12 text-base shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all" isLoading={isLoading}>
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
                  <span className="px-3 bg-white text-slate-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full h-12 font-medium bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-xl shadow-sm transition-all">
                  <svg className="w-5 h-5 mr-3 text-slate-800" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
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
    </div>
  );
}
