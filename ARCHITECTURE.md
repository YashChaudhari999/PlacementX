# PlacementX — Architecture Document

## 1. System Overview

PlacementX is an intelligent campus placement automation and decision support platform designed for NMIMS University. The system is architected as a modular, multi-platform application with Firebase as the backend-as-a-service.

### High-Level Architecture

```
                        ┌──────────────────────────┐
                        │     NMIMS Users           │
                        │  Students · TPO · Admin   │
                        │  Recruiters · Faculty     │
                        └──────────┬───────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
              ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
              │ React Web │ │React Native│ │  Future   │
              │   (Vite)  │ │  Mobile    │ │  Clients  │
              └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                    │             │              │
                    └──────┬──────┘              │
                           │                     │
               ┌───────────▼─────────────────────▼───┐
               │        Shared Layer                  │
               │  ┌──────────┐ ┌──────────────────┐  │
               │  │  Models  │ │  Type Definitions │  │
               │  └──────────┘ └──────────────────┘  │
               │  ┌──────────────────────────────┐   │
               │  │  Firebase Service Abstractions│  │
               │  └──────────────────────────────┘   │
               └───────────────┬─────────────────────┘
                               │
               ┌───────────────▼─────────────────────┐
               │          Firebase Platform           │
               │                                      │
               │  ┌────────────┐ ┌─────────────────┐ │
               │  │    Auth    │ │  Realtime DB     │ │
               │  └────────────┘ └─────────────────┘ │
               │  ┌────────────┐ ┌─────────────────┐ │
               │  │  Storage   │ │  Cloud Functions │ │
               │  └────────────┘ │    (Future)      │ │
               │                  └─────────────────┘ │
               └───────────────┬─────────────────────┘
                               │
               ┌───────────────▼─────────────────────┐
               │     Future Microservices             │
               │                                      │
               │  ┌─────────────────────────────────┐│
               │  │  AI/ML Decision Support Engine  ││
               │  ├─────────────────────────────────┤│
               │  │  REST API Gateway               ││
               │  ├─────────────────────────────────┤│
               │  │  Analytics & Reporting Engine   ││
               │  ├─────────────────────────────────┤│
               │  │  Notification Service           ││
               │  │  (Email · SMS · Push)           ││
               │  └─────────────────────────────────┘│
               └─────────────────────────────────────┘
```

---

## 2. Module Structure

The application follows a **feature-based architecture** within a modular monolith. Each feature is self-contained with its own components, hooks, services, and schemas.

### Directory Philosophy

```
src/
├── app/           → App shell: providers, router, global layout wrappers
├── components/    → Shared, reusable UI components
│   └── ui/        → shadcn/ui primitives (Button, Input, Dialog, etc.)
├── config/        → Configuration modules (Firebase, constants, feature flags)
├── features/      → Domain features (each is a self-contained module)
│   └── <feature>/
│       ├── components/    → Feature-specific components
│       ├── hooks/         → Feature-specific hooks
│       ├── services/      → Feature-specific API/service calls
│       ├── schemas/       → Feature-specific Zod schemas
│       └── index.ts       → Public API (barrel export)
├── hooks/         → Shared custom React hooks
├── lib/           → General-purpose utilities (cn, formatters, validators)
├── providers/     → React context providers (auth, theme, query client)
├── schemas/       → Shared Zod validation schemas
├── services/      → Firebase service abstractions
│   └── firebase/  → Auth, database, storage service modules
├── shared/        → Cross-platform code (reusable by React Native)
│   ├── models/    → Data model interfaces and classes
│   └── types/     → TypeScript type definitions
└── styles/        → Additional global/utility CSS
```

### Key Principles

1. **Feature Isolation** — Each feature folder is a self-contained module. Features import from `shared/`, `lib/`, `components/`, and `services/`, but never from other features directly.

2. **Shared Layer** — The `shared/` directory contains models and types that can be extracted into a separate package for React Native consumption.

3. **Service Abstraction** — Firebase services are wrapped in abstraction layers under `services/firebase/`. This decouples business logic from Firebase specifics and makes testing/migration easier.

4. **Schema-Driven Validation** — Zod schemas define the contract for all data. Forms use `@hookform/resolvers` to connect schemas to React Hook Form.

---

## 3. Data Flow

```
User Interaction
       │
       ▼
React Component (UI Layer)
       │
       ├── Form: React Hook Form + Zod Schema
       │
       ▼
Custom Hook (useFeatureX)
       │
       ├── TanStack Query (cache, loading, error states)
       │
       ▼
Service Layer (services/firebase/*)
       │
       ├── Firebase SDK calls
       │
       ▼
Firebase Backend
       │
       ├── Auth / Realtime DB / Storage
       │
       ▼
Real-time Updates → TanStack Query invalidation → UI re-render
```

---

## 4. State Management Strategy

| State Type | Solution |
|-----------|---------|
| **Server State** | TanStack React Query (caching, sync, refetching) |
| **Form State** | React Hook Form (field tracking, validation) |
| **UI State** | React useState / useReducer |
| **Auth State** | Firebase Auth + React Context |
| **Global App State** | React Context (minimal, for theme/auth only) |
| **URL State** | React Router DOM |

> **No Redux** — Server state is handled by React Query, which eliminates the need for a global store for most use cases.

---

## 5. Firebase Service Architecture

```
services/firebase/
├── auth.service.ts      → Sign in, sign up, password reset, session management
├── database.service.ts  → CRUD operations on Realtime Database
└── storage.service.ts   → File upload, download, delete operations
```

Each service module:
- Imports Firebase instances from `config/firebase.ts`
- Exposes typed async functions
- Handles errors consistently
- Is mockable for testing

---

## 6. Cross-Platform Strategy

The `shared/` directory is designed to be extractable as a standalone package:

```
shared/
├── models/     → Platform-agnostic data models
│   ├── user.model.ts
│   ├── company.model.ts
│   └── placement.model.ts
└── types/      → Shared TypeScript interfaces
    ├── api.types.ts
    └── common.types.ts
```

**Future:** When React Native development begins, `shared/` can be moved to a monorepo workspace package (e.g., `packages/shared`) and imported by both web and mobile apps.

---

## 7. Future Expansion Points

| Module | Purpose | Integration Point |
|--------|---------|------------------|
| **AI Microservices** | Resume parsing, job matching, prediction models | REST API → `services/ai/` |
| **REST API Gateway** | Unified API for third-party integrations | `services/api/` |
| **Analytics Engine** | Placement statistics, trend analysis, reports | `features/analytics/` |
| **Notification Service** | Email, SMS, push notifications | `services/notifications/` |
| **Cloud Functions** | Server-side logic, triggers, scheduled tasks | Firebase Cloud Functions |

---

## 8. Security Considerations

- All Firebase config keys are stored as environment variables (`VITE_FIREBASE_*`)
- `.env.local` is gitignored — never committed to version control
- Firebase Security Rules will enforce data access control at the database level
- Authentication is handled entirely by Firebase Auth
- Client-side validation (Zod) is supplemented by server-side rules

---

## 9. Performance Strategy

- **Code Splitting** — React.lazy + Suspense for route-based splitting (future)
- **Query Caching** — TanStack Query provides automatic caching and deduplication
- **Optimistic Updates** — TanStack Query mutations for instant UI feedback
- **Bundle Optimization** — Vite's tree-shaking and chunk splitting
- **Asset Optimization** — Image compression, lazy loading (future)
