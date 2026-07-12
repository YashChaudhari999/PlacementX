import { cva } from 'class-variance-authority';

/**
 * ============================================
 * PlacementX — Reusable Variant Definitions
 * ============================================
 * 
 * Reusable component variants using class-variance-authority.
 * Tailwind V4 uses the custom CSS variables defined in index.css.
 */

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-button font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm',
        outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        
        // Status Variants
        approved: 'border-transparent bg-success text-success-foreground',
        pending: 'border-transparent bg-warning text-warning-foreground',
        rejected: 'border-transparent bg-destructive text-destructive-foreground',
        active: 'border-transparent bg-info text-info-foreground',
        inactive: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const cardVariants = cva(
  'rounded-lg border border-border bg-card text-card-foreground',
  {
    variants: {
      variant: {
        default: 'shadow-card',
        interactive: 'shadow-card hover:shadow-md transition-shadow cursor-pointer',
        flat: 'shadow-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
