import { Outlet } from 'react-router-dom';
import { Shield01Icon } from 'hugeicons-react';
import { motion } from 'framer-motion';
import { GlobalLoader } from '@/components/ui/feedback';

export const HrPortalLayout = () => {
 return (
 <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
 {/* Premium Background Gradient Mesh */}
 <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
 <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-info/10 blur-[120px]"/>
 <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"/>
 </div>

 {/* Header */}
 <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border/60 sticky top-0 z-50 shadow-sm px-6 flex items-center justify-between">
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 className="flex items-center gap-3"
 >
 <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shadow-sm border border-border p-1.5">
 <img src="/nmimslogo_transparent.png"alt="NMIMS Logo"className="dark:brightness-0 dark:invert w-full h-full object-contain"/>
 </div>
 <span className="text-xl font-extrabold tracking-tight text-foreground">
 PlacementX <span className="font-medium text-muted-foreground mx-2">|</span>{' '}
 <span className="font-semibold text-muted-foreground tracking-normal">
 HR Collaboration Portal
 </span>
 </span>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 shadow-inner"
 >
 <span className="relative flex h-2.5 w-2.5">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/75 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
 </span>
 <span className="text-xs font-bold text-success tracking-wide uppercase">
 Secure Session
 </span>
 <Shield01Icon className="w-3.5 h-3.5 text-success ml-1"/>
 </motion.div>
 </header>

 {/* Main Content */}
 <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 z-10 relative max-w-[1400px]">
 <GlobalLoader />
 <Outlet />
 </main>

 {/* Footer */}
 <footer className="py-8 z-10">
 <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-border/60 pt-6">
 <div className="flex items-center gap-2 opacity-60">
 <img
 src="/nmimslogo_transparent.png"
 alt="NMIMS Logo"
 className="dark:brightness-0 dark:invert w-5 h-5 object-contain grayscale"
 />
 <span className="text-sm font-bold tracking-tight text-foreground">PlacementX</span>
 </div>
 <p className="text-muted-foreground text-sm font-medium">
 &copy; {new Date().getFullYear()} PlacementX. All rights reserved.
 </p>
 </div>
 </footer>
 </div>
 );
};
