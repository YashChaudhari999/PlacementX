import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// ============================================
// Card — Enterprise Component
// ============================================

export const cardVariants = cva('rounded-lg border border-border bg-card text-card-foreground', {
  variants: {
    variant: {
      default: 'shadow-card',
      interactive: 'shadow-card hover:shadow-md transition-shadow cursor-pointer',
      flat: 'shadow-none',
      elevated: 'shadow-md',
    },
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return <div ref={ref} className={cardVariants({ variant, padding, className })} {...props} />;
  }
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={['flex flex-col space-y-1.5 pb-4', className].join(' ')} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={['text-lg font-semibold leading-none tracking-tight', className].join(' ')}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={['text-sm text-muted-foreground', className].join(' ')} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={className} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={['flex items-center pt-4', className].join(' ')} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

// ============================================
// StatisticCard
// ============================================
export interface StatisticCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
  className?: string;
}

export const StatisticCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatisticCardProps) => {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          {trend && (
            <p
              className={[
                'text-xs font-medium mt-1',
                trend.direction === 'up' ? 'text-success' : 'text-destructive',
              ].join(' ')}
            >
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
            </p>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </Card>
  );
};

// ============================================
// InformationCard
// ============================================
export interface InformationCardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const InformationCard = ({
  title,
  subtitle,
  children,
  action,
  className,
}: InformationCardProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </div>
          {action}
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
};

// ============================================
// CompanyCard
// ============================================
export interface CompanyCardProps {
  name: string;
  industry?: string;
  logoUrl?: string;
  status?: string;
  onClick?: () => void;
  className?: string;
}

export const CompanyCard = ({
  name,
  industry,
  logoUrl,
  status,
  onClick,
  className,
}: CompanyCardProps) => {
  return (
    <Card variant="interactive" className={className} onClick={onClick}>
      <div className="flex items-center space-x-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="h-8 w-8 object-contain" />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">{name[0]}</span>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{name}</p>
          {industry && <p className="text-sm text-muted-foreground">{industry}</p>}
        </div>
        {status && <span className="text-xs font-medium text-muted-foreground">{status}</span>}
      </div>
    </Card>
  );
};

// ============================================
// StudentCard
// ============================================
export interface StudentCardProps {
  name: string;
  email?: string;
  branch?: string;
  cgpa?: number;
  avatarUrl?: string;
  onClick?: () => void;
  className?: string;
}

export const StudentCard = ({
  name,
  email,
  branch,
  cgpa,
  avatarUrl,
  onClick,
  className,
}: StudentCardProps) => {
  return (
    <Card variant="interactive" className={className} onClick={onClick}>
      <div className="flex items-center space-x-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            name[0]
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{name}</p>
          {email && <p className="text-xs text-muted-foreground">{email}</p>}
        </div>
        <div className="text-right text-sm">
          {branch && <p className="text-muted-foreground">{branch}</p>}
          {cgpa !== undefined && <p className="font-medium">{cgpa} CGPA</p>}
        </div>
      </div>
    </Card>
  );
};

// ============================================
// NotificationCard
// ============================================
export interface NotificationCardProps {
  title: string;
  message: string;
  time?: string;
  read?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NotificationCard = ({
  title,
  message,
  time,
  read,
  onClick,
  className,
}: NotificationCardProps) => {
  return (
    <Card
      variant="interactive"
      padding="sm"
      className={[!read ? 'border-l-4 border-l-primary' : '', className].join(' ')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={[
              'text-sm',
              !read ? 'font-semibold' : 'font-medium text-muted-foreground',
            ].join(' ')}
          >
            {title}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{message}</p>
        </div>
        {time && (
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{time}</span>
        )}
      </div>
    </Card>
  );
};
