// ============================================
// Layout Components — Enterprise Architecture
// ============================================

// ============================================
// PageHeader
// ============================================
export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, actions, className }: PageHeaderProps) => {
  return (
    <div className={['flex items-center justify-between pb-6', className].join(' ')}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
};

// ============================================
// SectionHeader
// ============================================
export interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader = ({ title, description, action, className }: SectionHeaderProps) => {
  return (
    <div className={['flex items-center justify-between pb-4', className].join(' ')}>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
};

// ============================================
// PageContainer
// ============================================
export interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export const PageContainer = ({ children, maxWidth = 'xl', className }: PageContainerProps) => {
  return (
    <div
      className={[
        'mx-auto w-full px-4 py-6 sm:px-6 lg:px-8',
        maxWidthMap[maxWidth],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
};

// ============================================
// Divider
// ============================================
export interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider = ({ label, className }: DividerProps) => {
  if (label) {
    return (
      <div className={['relative my-6', className].join(' ')}>
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{label}</span>
        </div>
      </div>
    );
  }
  return <hr className={['my-6 border-border', className].join(' ')} />;
};
