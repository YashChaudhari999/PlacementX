import { cva, type VariantProps } from 'class-variance-authority';

// ============================================
// Badge
// ============================================
export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
        info: 'border-transparent bg-info text-info-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return <div className={badgeVariants({ variant, className })} {...props} />;
};

// ============================================
// StatusChip — semantic status display
// ============================================
export type StatusType =
  'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft' | 'completed';

const statusMap: Record<
  StatusType,
  { label: string; variant: NonNullable<BadgeProps['variant']> }
> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  draft: { label: 'Draft', variant: 'outline' },
  completed: { label: 'Completed', variant: 'info' },
};

export interface StatusChipProps {
  status: StatusType;
  className?: string;
}

export const StatusChip = ({ status, className }: StatusChipProps) => {
  const config = statusMap[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

// ============================================
// Tag — removable label
// ============================================
export interface TagProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export const Tag = ({ label, onRemove, className }: TagProps) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium',
        className,
      ].join(' ')}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
        >
          <span className="text-muted-foreground hover:text-foreground">×</span>
        </button>
      )}
    </span>
  );
};

// ============================================
// Timeline
// ============================================
export interface TimelineItem {
  title: string;
  description?: string;
  time?: string;
  status?: 'completed' | 'active' | 'upcoming';
  icon?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline = ({ items, className }: TimelineProps) => {
  return (
    <div className={['space-y-0', className].join(' ')}>
      {items.map((item, idx) => (
        <div key={idx} className="relative flex gap-4 pb-8 last:pb-0">
          {idx < items.length - 1 && (
            <div className="absolute left-[11px] top-6 h-full w-px bg-border" />
          )}
          <div
            className={[
              'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
              item.status === 'completed'
                ? 'border-success bg-success text-success-foreground'
                : item.status === 'active'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted',
            ].join(' ')}
          >
            {item.icon || <span className="h-2 w-2 rounded-full bg-current" />}
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-medium">{item.title}</p>
            {item.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
            )}
            {item.time && <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
