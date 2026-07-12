# PlacementX Enterprise Monorepo Architecture

I have successfully restructured the entire project into a robust, enterprise-grade Monorepo using npm workspaces. This architecture guarantees zero duplication between the React Web app and the future React Native app.

## 1. Complete Folder Tree

```text
PlacementX/
├── apps/
│   ├── web/               # React 19 + Vite (Web Application)
│   │   ├── src/
│   │   │   ├── app/       # Global Providers & AppShell
│   │   │   ├── features/  # Business logic (student, admin, recruiter)
│   │   │   └── routes/    # React Router setup
│   ├── mobile/            # React Native + Expo (Mobile Application)
│   │   └── src/           # Screens, Navigation, Mobile Features
│   └── backend/           # Firebase Infrastructure
│       ├── database/
│       ├── functions/
│       └── security-rules/
├── packages/              # Shared Code (No Business Logic here)
│   ├── ui/                # Cross-platform capable UI components
│   ├── types/             # Shared TypeScript definitions
│   ├── utils/             # Shared helper functions
│   ├── firebase/          # Shared Firebase SDK abstractions
│   ├── validation/        # Zod schemas for forms/API validation
│   └── config/            # Shared theme and Tailwind configs
├── docs/                  # Project documentation
├── scripts/               # CI/CD and automation scripts
└── package.json           # Root workspace configuration
```

## 2. Folder Responsibilities

| Folder | Responsibility |
|--------|----------------|
| **`apps/web`** | The front-facing React application. It handles routing, layouts, and feature-specific business logic for browsers. |
| **`apps/mobile`** | The native Android/iOS application built with Expo. It will consume the same `packages/` as the web app. |
| **`apps/backend`** | Infrastructure-as-code for Firebase. Contains Security Rules, Indexes, and future Cloud Functions. |
| **`packages/ui`** | Headless or highly isolated UI components (Buttons, Cards, Inputs). Strict rule: No Firebase or routing logic here. |
| **`packages/types`** | The single source of truth for all data structures (e.g., `User`, `PlacementEvent`). Prevents Web and Mobile from falling out of sync. |
| **`packages/firebase`** | Isolated Firebase SDK initialization and generic repository patterns. |

## 3. Communication Flow

1. **Web / Mobile (Consumers)**: These applications handle *Presentation* and *Routing*. They import UI components from `packages/ui` and data schemas from `packages/types`.
2. **Backend (Provider)**: Firebase Realtime Database holds the state.
3. **The Bridge**: When Web or Mobile needs data, they use `packages/firebase` to read/write. If the data is complex, they use `packages/validation` to ensure integrity before sending it to the backend.

## 4. Import Paths (Shared Packages)

Inside `apps/web/src/...` or `apps/mobile/src/...`, imports will look like this:

```typescript
// Importing a shared UI component
import { Button } from '@placementx/ui/button';

// Importing a shared type
import { StudentProfile } from '@placementx/types';

// Importing a shared validation schema
import { loginSchema } from '@placementx/validation';
```
*(Note: To fully activate these absolute paths across the IDE, TSConfig path mapping and package builds will be configured dynamically).*

## 5. Dependency Rules

> [!WARNING]  
> **Strict Monorepo Rules**
> 1. **Packages cannot import from Apps**: `packages/ui` can NEVER import from `apps/web`.
> 2. **Packages must remain agnostic**: `packages/firebase` must not care if it is being run on the Web or Mobile. It just returns data.
> 3. **Apps can import from Packages**: `apps/web` and `apps/mobile` can import from any `packages/*`.

## 6. Recommended Package Versions

- **State Management (Server)**: `@tanstack/react-query` (v5+)
- **State Management (Client)**: `zustand` (v4+)
- **Validation**: `zod` (v3+)
- **Forms**: `react-hook-form` (v7+)
- **Styling**: `tailwindcss` (v4+) + `class-variance-authority`

## 7. Future AI Microservices Integration

Because the architecture is strictly modular, introducing AI (e.g., a Resume Parsing Engine) requires zero refactoring:
1. Create `apps/ai-service/` (e.g., a Python FastAPI or Node microservice).
2. Create `packages/types/ai.ts` so the Web/Mobile apps know what the AI returns.
3. The Web app simply calls the new service and displays it using the existing `packages/ui`.
