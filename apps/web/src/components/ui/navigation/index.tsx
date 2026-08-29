import { forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight01Icon } from 'hugeicons-react';
import { cva, type VariantProps } from 'class-variance-authority';

// ============================================
// Breadcrumb
// ============================================
export interface BreadcrumbItem {
  name: string;
  href: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={['flex items-center space-x-1 text-sm text-muted-foreground', className].join(' ')}
    >
      {items.map((item, idx) => (
        <div key={item.href} className="flex items-center">
          {idx > 0 && <ArrowRight01Icon className="mx-1 h-4 w-4" />}
          {idx === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.name}</span>
          ) : (
            <Link to={item.href} className="hover:text-foreground transition-colors">
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

// ============================================
// Tabs
// ============================================
export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export const Tabs = ({ items, activeKey, onChange, className }: TabsProps) => {
  return (
    <div
      className={[
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className,
      ].join(' ')}
    >
      {items.map((tab) => (
        <button
          key={tab.key}
          onClick={() => !tab.disabled && onChange(tab.key)}
          disabled={tab.disabled}
          className={[
            'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            activeKey === tab.key ? 'bg-background text-foreground shadow-sm' : '',
          ].join(' ')}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// ============================================
// SidebarItem
// ============================================
export const sidebarItemVariants = cva(
  'flex items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors',
  {
    variants: {
      state: {
        default: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        active: 'bg-primary/10 text-primary font-medium',
      },
    },
    defaultVariants: { state: 'default' },
  }
);

export interface SidebarItemProps extends VariantProps<typeof sidebarItemVariants> {
  href: string;
  icon?: React.ReactNode;
  label: string;
  badge?: string | number;
  className?: string;
}

export const SidebarItem = ({ href, icon, label, badge, state, className }: SidebarItemProps) => {
  return (
    <Link to={href} className={sidebarItemVariants({ state, className })}>
      {icon && <span className="h-5 w-5">{icon}</span>}
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
          {badge}
        </span>
      )}
    </Link>
  );
};

// ============================================
// NavbarItem
// ============================================
export interface NavbarItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  className?: string;
}

export const NavbarItem = ({ href, label, isActive, className }: NavbarItemProps) => {
  return (
    <Link
      to={href}
      className={[
        'text-sm font-medium transition-colors hover:text-foreground',
        isActive ? 'text-foreground' : 'text-muted-foreground',
        className,
      ].join(' ')}
    >
      {label}
    </Link>
  );
};

// ============================================
// Menu (Dropdown placeholder)
// ============================================
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface MenuProps {
  items: MenuItem[];
  className?: string;
}

export const Menu = ({ items, className }: MenuProps) => {
  return (
    <div
      className={[
        'min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
        className,
      ].join(' ')}
    >
      {items.map((item) => (
        <button
          key={item.key}
          onClick={item.onClick}
          disabled={item.disabled}
          className={[
            'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
            item.danger ? 'text-destructive hover:text-destructive' : '',
          ].join(' ')}
        >
          {item.icon && <span className="mr-2 h-4 w-4">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
};
