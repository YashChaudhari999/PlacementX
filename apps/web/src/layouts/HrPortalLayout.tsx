import { Outlet } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export const HrPortalLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <Briefcase className="h-6 w-6" />
          <span className="text-xl font-bold tracking-tight">PlacementX <span className="font-medium text-slate-400">| HR Collaboration Portal</span></span>
        </div>
        <div className="text-sm font-medium text-slate-500">
          Secure Session Active
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} PlacementX. All rights reserved.
      </footer>
    </div>
  );
};
