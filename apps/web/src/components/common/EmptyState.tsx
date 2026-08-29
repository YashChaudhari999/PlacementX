import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  variant?: 'default' | 'card';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  variant = 'default',
}: EmptyStateProps) {
  const isCard = variant === 'card';

  const content = (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-indigo-50/50"
      >
        <Icon className="w-12 h-12 text-indigo-300" strokeWidth={1.5} />
      </motion.div>
      
      <motion.h3 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-bold text-slate-800 mb-2"
      >
        {title}
      </motion.h3>
      
      <motion.p 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-slate-500 mb-8 leading-relaxed"
      >
        {description}
      </motion.p>
      
      {actionLabel && onAction && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={onAction} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 px-6 py-2.5"
          >
            {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </div>
  );

  if (isCard) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {content}
      </div>
    );
  }

  return content;
}
