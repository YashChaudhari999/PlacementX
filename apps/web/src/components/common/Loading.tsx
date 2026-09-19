import { motion, useReducedMotion } from 'framer-motion';

interface LoadingProps {
 message?: string;
}

export const Loading = ({ message = 'Syncing the latest placement data' }: LoadingProps) => {
 const reduceMotion = useReducedMotion();

 return (
 <div
 className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-6 backdrop-blur-md"
 role="status"
 aria-live="polite"
 >
 <div className="relative w-full max-w-[280px] overflow-hidden rounded-3xl border border-border/80 bg-card p-7 text-center shadow-[0_24px_70px_-28px_rgba(15,23,42,0.45)]">
 <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"/>
 <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
 <motion.div
 animate={reduceMotion ? undefined : { rotate: 360 }}
 transition={{ repeat: Infinity, duration: 1.35, ease: 'linear' }}
 className="absolute inset-0 rounded-full border-2 border-primary/15 border-t-primary border-r-primary/55"
 />
 <div className="flex h-[66px] w-[66px] items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-2.5 shadow-sm">
 <img
 src="/nmimslogo_transparent.png"
 alt="NMIMS Logo"
 className="h-full w-full object-contain"
 />
 </div>
 </div>
 <p className="text-base font-bold tracking-tight text-foreground">Preparing your workspace</p>
 <motion.p
 initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 className="mt-1.5 text-xs leading-5 text-muted-foreground"
 >
 {message}
 </motion.p>
 </div>
 </div>
 );
};
