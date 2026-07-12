# PlacementX Enterprise Architecture

This document outlines the folder architecture for PlacementX, designed following Feature-First Architecture principles to ensure scalability for the Student Portal, Placement Cell Portal, Recruiter Event Portal, Mobile App, Analytics, Notifications, and Settings.

## Top-Level Folders

- **app**: Contains core application bootstrap files (`App.tsx`, `main.tsx`, `providers.tsx`).
- **assets**: Static assets like images, fonts, and icons.
- **components**: Shared, reusable UI components that do not contain feature-specific business logic.
  - **common**: Generic UI elements (buttons, inputs, etc.).
  - **layout**: Layout wrappers (containers, sidebars, headers).
  - **navigation**: Navigational components (menus, breadcrumbs).
  - **forms**: Form-related wrappers and components.
  - **feedback**: Toast notifications, alerts, loaders.
  - **tables**: Reusable data tables.
  - **cards**: Reusable card layouts.
  - **charts**: Reusable charting components.
  - **dialogs**: Modal and dialog wrappers.
- **config**: Configuration files (`theme.ts`, `firebase.ts`, `env.ts`, `navigation.ts`).
- **constants**: Global constants, enums, and static maps.
- **contexts**: Global React contexts.
- **features**: Feature-based modules. Every feature is independent and contains its own:
  - **components**: Feature-specific UI components.
  - **hooks**: Feature-specific custom hooks.
  - **services**: API and external service calls for the feature.
  - **types**: TypeScript definitions specific to the feature.
  - **utils**: Helper functions used only within this feature.
- **hooks**: Global custom React hooks used across multiple features.
- **layouts**: Top-level layout definitions for different parts of the application (e.g., Dashboard Layout, Auth Layout).
- **lib**: Third-party library wrappers and initializations (e.g., Axios instance).
  - **firebase**: Shared Firebase configuration and utility wrappers (`auth`, `database`, `storage`).
- **providers**: React context providers wrapping the application.
- **routes**: Global routing configuration mapping paths to feature pages.
- **services**: Global API services and shared business logic.
- **store**: Global state management (e.g., Redux, Zustand).
- **styles**: Global CSS, SCSS, or Tailwind configurations and variables.
- **types**: Global TypeScript types and interfaces used across the app.
- **utils**: Shared utility and helper functions.

## Features List

- **auth**: Authentication and authorization flows.
- **dashboard**: Main overview and metrics.
- **student**: Student portal specific features.
- **placement**: Placement cell specific management and features.
- **applications**: Job/Event application flows and tracking.
- **profile**: User profile management.
- **notifications**: Notification center and preference management.
- **settings**: Application and user settings.
- **recruiter-event**: Features specifically for recruiters and managing their events.
- **ai**: Artificial intelligence features, chatbots, and advanced analytics.

This architecture is optimized for long-term maintainability, avoiding unnecessary nesting while keeping business domains strictly decoupled.
