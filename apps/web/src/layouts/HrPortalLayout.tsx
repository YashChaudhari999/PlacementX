import { Outlet } from 'react-router-dom';
import { Briefcase, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const HrPortalLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Premium Background Gradient Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm px-6 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/20">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-800">
            PlacementX <span className="font-medium text-slate-400 mx-2">|</span> <span className="font-semibold text-slate-600 tracking-normal">HR Collaboration Portal</span>
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-inner"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
            Secure Session
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 ml-1" />
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 z-10 relative max-w-[1400px]">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="py-8 z-10">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-200/60 pt-6">
          <div className="flex items-center gap-2 opacity-50">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-bold tracking-tight">PlacementX</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} PlacementX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
