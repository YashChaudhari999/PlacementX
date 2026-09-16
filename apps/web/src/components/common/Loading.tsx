import { motion } from 'framer-motion';

interface LoadingProps {
 message?: string;
}

export const Loading = ({ message }: LoadingProps) => (
 <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-muted/70 backdrop-blur-[2px]">
 <div className="relative flex items-center justify-center mb-6">
 {/* Spinning gradient ring (Maroon Theme) */}
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
 className="absolute h-24 w-24 rounded-full border-[3px] border-transparent border-t-[#800000] border-r-[#800000]/70 border-b-[#800000]/30 border-l-transparent"
 />
 {/* Outer subtle ring */}
 <div className="absolute h-24 w-24 rounded-full border-[3px] border-[#800000]/10"/>

 {/* Center Logo */}
 <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-card shadow-sm overflow-hidden p-3 border border-border">
 <img src="/nmimslogo_transparent.png"alt="NMIMS Logo"className="dark:brightness-0 dark:invert w-full h-full object-contain"/>
 </div>
 </div>
 {message && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-muted-foreground font-medium text-lg text-center"
 >
 {message}
 </motion.div>
 )}
 </div>
);
