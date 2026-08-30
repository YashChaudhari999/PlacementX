import { cva, type VariantProps } from 'class-variance-authority';
import {
  Cancel01Icon,
  Alert02Icon,
  Tick02Icon,
  InformationCircleIcon,
  Alert01Icon,
} from 'hugeicons-react';

// ============================================
// Alert
// ============================================
export const alertVariants = cva('relative w-full rounded-lg border p-4 text-sm', {
  variants: {
    variant: {
      default: 'bg-background text-foreground border-border',
      info: 'border-info/50 text-info bg-info/10',
      success: 'border-success/50 text-success bg-success/10',
      warning: 'border-warning/50 text-warning bg-warning/10',
      destructive: 'border-destructive/50 text-destructive bg-destructive/10',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  onClose?: () => void;
}

const alertIcons = {
  default: <InformationCircleIcon className="h-4 w-4" />,
  info: <InformationCircleIcon className="h-4 w-4" />,
  success: <Tick02Icon className="h-4 w-4" />,
  warning: <Alert01Icon className="h-4 w-4" />,
  destructive: <Alert02Icon className="h-4 w-4" />,
};

export const Alert = ({ className, variant, title, onClose, children, ...props }: AlertProps) => {
  return (
    <div className={alertVariants({ variant, className })} role="alert" {...props}>
      <div className="flex items-start space-x-3">
        <span className="mt-0.5">{alertIcons[variant || 'default']}</span>
        <div className="flex-1">
          {title && <p className="font-semibold">{title}</p>}
          {children && <div className="mt-1">{children}</div>}
        </div>
        {onClose && (
          <button onClick={onClose} className="cursor-pointer opacity-70 hover:opacity-100">
            <Cancel01Icon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// Banner
// ============================================
export interface BannerProps {
  message: string;
  variant?: 'info' | 'warning' | 'destructive';
  onDismiss?: () => void;
  className?: string;
}

export const Banner = ({ message, variant = 'info', onDismiss, className }: BannerProps) => {
  const bgMap = {
    info: 'bg-info/10 text-info border-info/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    destructive: 'bg-destructive/10 text-destructive border-destructive/30',
  };
  return (
    <div
      className={[
        'flex items-center justify-between border-b px-4 py-2 text-sm',
        bgMap[variant],
        className,
      ].join(' ')}
    >
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="cursor-pointer opacity-70 hover:opacity-100">
          <Cancel01Icon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// ============================================
// Progress
// ============================================
export interface ProgressProps {
  value: number; // 0-100
  max?: number;
  className?: string;
}

export const Progress = ({ value, max = 100, className }: ProgressProps) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={['relative h-2 w-full overflow-hidden rounded-full bg-muted', className].join(' ')}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// ============================================
// Skeleton
// ============================================
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return <div className={['animate-pulse rounded-md bg-muted', className].join(' ')} {...props} />;
};

// ============================================
// Spinner
// ============================================
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <svg
      className={['animate-spin text-primary', sizeMap[size], className].join(' ')}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
};

// ============================================
// Toast (architecture — rendered by ToastProvider)
// ============================================
export type ToastVariant = 'default' | 'success' | 'destructive' | 'warning';

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}
