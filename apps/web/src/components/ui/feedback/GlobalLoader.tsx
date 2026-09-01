import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export const GlobalLoader = () => {
  // Check if any queries or mutations are currently running in the background
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching > 0 || isMutating > 0;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [spinnerStyle, setSpinnerStyle] = useState<React.CSSProperties>({});

  // Lock scrolling and calculate exact visible bounds for perfect centering
  useEffect(() => {
    if (isLoading && containerRef.current) {
      document.body.style.overflow = 'hidden';
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate perfectly centered position within the visible viewport.
      // The sticky navbar is roughly 80px tall. The available visible height is from 80 to window.innerHeight.
      const visibleCenterViewportY = 80 + (window.innerHeight - 80) / 2;
      
      // Because 'backdrop-blur' creates a containing block, 'fixed' positioning acts like 'absolute'.
      // Therefore, we calculate the exact absolute 'top' offset relative to the container itself.
      const topOffset = visibleCenterViewportY - rect.top;

      setSpinnerStyle({
        position: 'absolute',
        left: '0',
        width: '100%',
        top: `${topOffset}px`,
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-20 bg-slate-50/70 backdrop-blur-[2px] rounded-xl"
        >
          {/* Dynamically positioned fixed container to guarantee perfect viewport centering */}
          <div style={spinnerStyle}>
            <div className="relative flex items-center justify-center">
              {/* Spinning gradient ring (Maroon Theme) */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="absolute h-24 w-24 rounded-full border-[3px] border-transparent border-t-[#800000] border-r-[#800000]/70 border-b-[#800000]/30 border-l-transparent"
              />
              {/* Outer subtle ring */}
              <div className="absolute h-24 w-24 rounded-full border-[3px] border-[#800000]/10" />
              
              {/* Center Logo */}
              <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white shadow-sm overflow-hidden p-3 border border-slate-100">
                <img src="/nmimslogo.png" alt="NMIMS Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
