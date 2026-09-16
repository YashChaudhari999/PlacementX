# Mobile Design System

The mobile application implements a centralized design system located at `apps/mobile/src/theme/theme.ts`.

## Core Philosophy
The mobile app mirrors the web application's modern SaaS aesthetics by heavily restricting ad-hoc styling. Developers must import the central `theme` object rather than hard-coding hex values or spacing units.

## Color Palette
- **Primary:** `#800000` (NMIMS Maroon) - used for primary CTAs and active states.
- **Secondary:** `#002D62` (Navy Blue) - used for headers and secondary actions.
- **Background:** `#FFFFFF` (Light) / `#121212` (Dark)
- **Text:** `#1A1A1A` (Light) / `#F5F5F5` (Dark)
- **Muted/Border:** `#E5E5E5`

## Typography
- **Headings:** Bold weight, strong hierarchy (`h1`, `h2`, `h3`).
- **Body:** Standard readable sizing (`base` = 16px).
- **Muted/Small:** Smaller sizes (`sm` = 14px) for tertiary info (e.g., timestamps).

## Components (UI Primitives)
Reusable components reside in `apps/mobile/src/components/ui/` and must be used for all interfaces:
- `Button`: Supports `default`, `secondary`, `outline`, `ghost`, and `destructive` variants. Incorporates loading and disabled states automatically.
- `Card`: Provides consistent border radius and shadow/elevation.
- `Input`: Standardized form fields with consistent padding, borders, and error state rendering.
- `Badge`: Used for status indicators (e.g., 'Applied', 'Verified').

## Responsive Architecture
The layout uses Flexbox rigorously, avoiding absolute positioning. Component dimensions scale predictably. `SafeAreaView` wrapping ensures the design is not occluded by hardware notches or navigation bars on iPhone and Android devices.
