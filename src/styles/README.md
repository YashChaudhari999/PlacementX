# PlacementX Design System

Welcome to the central Design System for PlacementX. This document explains how to use the enterprise theme correctly to ensure a modern, minimal, and fast UI.

## Core Principles
- **No Glassmorphism/Neumorphism:** The UI must feel professional, resembling GitHub, Linear, or Stripe Dashboard. Use solid backgrounds with subtle shadows.
- **Semantic Tokens (shadcn/ui compatible):** Do not use raw colors (like `bg-red-500`). Use standard semantic Tailwind classes (e.g., `bg-primary`, `text-primary-foreground`, `bg-muted`).
- **Accessible Contrast:** Foreground tokens (e.g. `text-primary-foreground`) are explicitly mapped to ensure AAA contrast ratios against their background tokens (`bg-primary`).
- **Icons:** We exclusively use [Lucide Icons](https://lucide.dev/).

## Where to find things
- **CSS Variables & Tailwind v4 Theme:** All design tokens (colors, spacing, shadows, borders) are defined centrally using `@theme` inside `src/index.css`.
- **TypeScript Tokens:** For canvas, charting libraries, or React Native adaptation where you need JS/TS access to design tokens, import from `src/config/theme.ts`.
- **Component Variants:** For reusable UI components (Buttons, Badges, Cards), we use `class-variance-authority` (cva). These variants are defined in `src/styles/variants.ts`.

## Usage Guidelines

### 1. Colors
Use Tailwind utility classes mapped to our semantic tokens:
- **Backgrounds:** `bg-background`, `bg-surface`, `bg-card`
- **Text:** `text-foreground`, `text-muted-foreground`
- **Solid Accents:** `bg-primary text-primary-foreground`, `bg-secondary text-secondary-foreground`
- **Status/Feedback:** `bg-success text-success-foreground`, `bg-destructive text-destructive-foreground`, `bg-warning text-warning-foreground`

### 2. Typography
Our primary font is **Inter**. 
We have semantic font sizes configured:
- `text-display`, `text-heading`, `text-title`, `text-subtitle`
- `text-body`, `text-caption`, `text-label`, `text-button`

Example: `<h1 className="text-heading font-semibold text-primary">Dashboard</h1>`

### 3. Spacing & Borders
Use standard spacing from the token scale (1, 2, 3, 4, 5, 6, 8, 10, 12, 16):
- Margins: `m-4`, `mt-6`, `px-8`
- Radius: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`

*(Note: In Tailwind v4, custom spacing uses explicit rem values mapping to a standard 4px baseline, keeping layout predictable.)*

### 4. Component Variants (CVA)
When building a component, use the predefined CVA variants:
```tsx
import { buttonVariants } from '@/styles/variants'

// Usage inside a React Component
<button className={buttonVariants({ variant: 'outline', size: 'lg' })}>
  Submit
</button>
```

### 5. Status Colors
For specific badge or text statuses, use the dedicated semantic status tokens:
`approved`, `pending`, `rejected`, `active`, `inactive`, `draft`, `closed`.

*(Check `src/index.css` for the full mapping of all CSS variables.)*
