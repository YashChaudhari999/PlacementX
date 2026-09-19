import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export const GlobalLoader = () => {
 // Hooks must run in the same order on every render. Keep these calls separate;
 // combining them with `||` can short-circuit the second hook and crash React.
 const activeQueries = useIsFetching();
 const activeMutations = useIsMutating();
 const isLoading = activeQueries > 0 || activeMutations > 0;
 const [isVisible, setIsVisible] = useState(false);
 const reduceMotion = useReducedMotion();

 // Do not flash a full loading state for requests that resolve immediately.
 useEffect(() => {
 if (!isLoading) {
 setIsVisible(false);
 return;
 }

 const timer = window.setTimeout(() => setIsVisible(true), 180);
 return () => window.clearTimeout(timer);
 }, [isLoading]);

 useEffect(() => {
 document.body.style.overflow = isVisible ? 'hidden' : '';
 return () => {
 document.body.style.overflow = '';
 };
 }, [isVisible]);

 return (
 <AnimatePresence>
 {isVisible && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: reduceMotion ? 0 : 0.2 }}
 className="fixed inset-0 z-[100] grid place-items-center bg-background/80 px-6 backdrop-blur-md"
 role="status"
 aria-live="polite"
 aria-label="Loading PlacementX"
 >
 <motion.div
 initial={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={reduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
 transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
 className="relative w-full max-w-[280px] overflow-hidden rounded-3xl border border-border/80 bg-card p-7 text-center shadow-[0_24px_70px_-28px_rgba(15,23,42,0.45)]"
 >
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
 <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
 Syncing the latest placement data
 </p>
 <div className="mx-auto mt-5 flex w-fit items-center gap-1.5" aria-hidden="true">
 {[0, 1, 2].map((index) => (
 <motion.span
 key={index}
 className="h-1.5 w-1.5 rounded-full bg-primary"
 animate={reduceMotion ? undefined : { opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
 transition={{ duration: 1, repeat: Infinity, delay: index * 0.14 }}
 />
 ))}
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
};
