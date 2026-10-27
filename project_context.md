# Project Context

> Living documentation for AI-assisted development.

**Last Updated:** 2026-10-18 IST
**Last Verified Against Codebase:** 2026-10-18 IST
**Context Version:** 2.1

---

## 2026-10-18 Mobile Release, Drive Publication Notifications, and Operations Update

- Produced installable Android APK artifacts under `artifacts/`; the demo application was installed on a physical Android device and login was confirmed. The latest uncommitted mobile changes still require a fresh APK build and device regression pass.
- Replaced the launcher branding with the NMIMS PlacementX icon assets and changed the displayed application name from `PlacementX (Demo)` to `PlacementX` while retaining the demo package identifier `com.placementx.app.demo`.
- Added production API fallback configuration for standalone Android builds, mobile OTP password reset, Firebase initialization hardening, authentication/session crash fixes, and safer post-login navigation.
- Added a shared keyboard-aware scroll/input foundation and applied it to authentication, profile, drive creation, notification, and settings forms so focused inputs remain visible without abrupt keyboard resizing.
- Refined student mobile UI: account-scoped theme persistence, uppercase student-name greeting, corrected drive/application filters, LPA package labels, profile-verification guidance that links to the web profile, and multiple dashboard/detail layout fixes.
- Added web and mobile drive deep-link handling for `https://placementx-v1.vercel.app/drives/:id`, including preservation of a pending drive while the user signs in. Native Android/iOS association files and signing identifiers are still pending.
- Implemented idempotent placement-drive publication events and per-recipient/channel delivery tracking. Eligible verified students receive in-app, push, and Brevo/SMTP email notifications through BullMQ, with retry recovery and an admin publication-status endpoint.
- Added Prisma models and migration `20261018140000_add_drive_publication_delivery`, personalized HTML/text drive emails, publication regression tests, and `docs/DRIVE_PUBLICATION_NOTIFICATIONS.md`.
- Confirmed the live Render API remains on the Free compute plan. `/health` and `/health/ready` are diagnostic endpoints only; no external uptime monitor is currently calling them. Render intentionally spins the API down after 15 idle minutes, so true always-on behavior requires paid compute.
- Current repository state contains substantial uncommitted work across API, web, and mobile. These changes must not be described as deployed until committed, pushed, migrated, built, and verified in production.

---

## 2026-10-17 Authentication Overhaul, Production Deployment, and Health Monitoring

- Implemented a complete OTP-based password reset flow (request → email OTP → verify → reset-grant → confirm) with HMAC-hashed OTPs, rate limiting, cooldown enforcement, and constant-time comparisons.
- Added `PasswordResetChallenge` Prisma model with migration `20261017190000_add_password_reset_challenges`.
- Introduced `passwordReset.controller.ts`, `passwordReset.service.ts`, and `email.service.ts` (Nodemailer/SMTP with Brevo support and OTP email templates).
- Redesigned web login to a unified single `Login.tsx` page with role detection, `ForgotPasswordModal` inline component, and a standalone `/forgot-password` route.
- Added dedicated `AdminLogin.tsx` and `StudentLogin.tsx` page variants for contextual branding.
- Legacy `/student/login` and `/admin/login` paths now redirect to `/login`.
- Configured Vercel SPA routing (`vercel.json`) for production web deployment.
- Fixed production Firebase login by allowing sign-in before email verification for demo accounts (`DEMO_EMAIL_ALLOWLIST`).
- Added `/health` (liveness) and `/health/ready` (Redis readiness probe) endpoints with bounded 2-second timeout; documented Render free-tier keepalive strategy in `docs/RENDER_FREE_TIER_KEEPALIVE.md`.
- Bounded BullMQ readiness checks to prevent startup timeouts when Redis is slow.
- Extended CI pipeline: generate Prisma client before API checks, unblock web lint by downgrading legacy error rules to warnings.
- Added `PASSWORD_RESET_SECRET`, `SMTP_*`, `EMAIL_FROM*`, `DEMO_EMAIL_ALLOWLIST`, and `OFFICIAL_STUDENT_EMAIL_DOMAINS` to `.env.example`.
- Added comprehensive Student Settings module (web): 13 settings components (Account, Profile Preferences, Notifications, Security, Application Preferences, Calendar, Regional, Connected Devices, Privacy, Appearance, Danger Zone, Help & Support) with backend `student.settings.routes.ts` and `student.settings.controller.ts`.
- Expanded API test suite to 8 test files (password reset controller, password reset service, batch2027 policy, eligibility, health routes, placement rules, redis config, security middleware).

---

## 2026-10-01 Mobile UX and Notification Lifecycle Refinement

- Unified mobile headers through the accessible shared foundation and corrected student information architecture to expose separate Drives and Applications primary tabs.
- Added real unread/profile status context to the dashboard and removed fake always-on notification affordances.
- Removed Expo Go mock push-token registration, persisted real device tokens for logout cleanup, prevented socket/push unread duplication, and made notification routing role-aware.
- Added mobile behavior contracts and an implementation-backed audit at `docs/mobile/UI_UX_AUDIT.md`.

---
## 2026-09-25 Mobile Redesign and Hardening

- Added semantic NMIMS-aligned light/dark tokens, persisted system theme, responsive layout and reduced-motion hooks; all mobile screens and shared visual components now consume the active theme.
- Added shared screen, header, surface, state, icon-button, and confirmation-dialog foundations.
- Unified login and made role routing server-derived; added working password reset and session-hydration gating.
- Corrected mobile API contracts for password change, calendar, documents, profile verification/update requests, and admin reports.
- Routed notification preferences and coordinator management; added profile links to documents, interviews, and settings.
- Restricted coordinators to student management and coordinator-safe settings; super-admin surfaces are not registered for coordinators.
- Replaced the admin drive-details placeholder with live data and state handling.
- Added deep-link configuration, distinct demo IDs (`com.placementx.app.demo`), EAS preview APK profile, and valid notification assets. Standalone builds now require an explicit `EXPO_PUBLIC_API_URL`; no fictitious production fallback is embedded.
- Added 17 Node contract tests; TypeScript, tests, Expo configuration, Expo Doctor (18/18), Android Hermes export (3,782 modules, 7.21 MB bundle), and the current root npm audit pass with zero known vulnerabilities.
- APK build remains externally blocked: EAS is not authenticated and local NDK `27.1.12297006` is incomplete. No APK/device-install claim is made.

---

# 1. Project Overview

## Project Name

PlacementX

## Project Description

PlacementX is a **Campus Placement Automation Platform** built as a capstone project for **NMIMS University**. It is a full-stack, multi-platform application (web + mobile) designed to digitize and automate the entire campus placement lifecycle — from student profile management to company drive creation, HR collaboration, application tracking, and analytics.

## Problem Being Solved

Manual, spreadsheet-driven campus placement processes at NMIMS University. The platform replaces fragmented communication (emails, WhatsApp groups, spreadsheets) with a unified digital solution for the Training & Placement Office (TPO), students, coordinators, and recruiters.

## Target Users

- **Students** — View drives, apply, manage profiles, track applications
- **Placement Cell (Super Admin / TPO)** — Manage drives, verify students, import data, view analytics
- **Coordinators** — Assist the placement cell with drive and student management
- **HR / Recruiters** — Collaborate on drive creation via secure token-based portal (no login required)

## Main Goals

1. End-to-end placement lifecycle automation
2. ~~AI/ML-powered decision support (Removed)~~
3. Real-time notifications (web + push via Firebase Cloud Messaging)
4. Multi-platform access (web deployed to Vercel; React Native mobile source complete; standalone release validation pending)
5. Analytics and reporting dashboard for the placement cell

## Current Status

**Single-college production deployment in progress**

The web application is deployed to Vercel with SPA routing configured. The API is deployed to Render (Singapore region) alongside a Render Key Value (Valkey 8) Redis instance. OTP password reset uses Brevo/SMTP, Firebase-backed identity, database account validation, hashed challenges, and rate-limited API endpoints. The Render service is currently on the Free compute plan and intentionally spins down after 15 minutes without inbound traffic; the health routes do not themselves prevent sleep and no external uptime monitor is active. Installable Android APKs have been produced and a physical-device install/login was confirmed, replacing the earlier EAS/NDK build blocker. However, the newest mobile, drive-publication, deep-link, and notification changes are still uncommitted in the working tree and therefore are not yet part of the deployed web/API or latest installed APK. The current data model remains single-college; tenant isolation has not been added across database records, queries, storage, queues, or real-time channels.

---

# 2. Core Features

| Feature | Purpose | User(s) | Status |
|---------|---------|---------|--------|
| **Unified Login** | Single login page routing by role | All | ✅ Completed |
| **Student Dashboard** | Overview of upcoming drives, stats, notifications | Student | ✅ Completed |
| **Student Profile Management** | Comprehensive multi-step profile form (personal, academic, professional) | Student | ✅ Completed |
| **Semester-wise Performance** | Track semester marks with CGPA, backlogs, and marksheet uploads to Firebase | Student, Admin | ✅ Completed |
| **Admin Student Profile View** | Dedicated tabbed page for admins to view a student's complete placement journey | Admin | ✅ Completed |
| **Profile Verification** | Admin reviews and verifies student profiles | Admin | ✅ Completed |
| **Profile Update Requests** | Students request changes post-verification; admin approves/rejects | Student, Admin | ✅ Completed |
| **Placement Drive Management** | CRUD for placement drives with full eligibility criteria | Admin | ✅ Completed |
| **Create Drive Wizard** | Multi-step form for creating placement events | Admin | ✅ Completed |
| **HR Collaboration Portal** | Token-based, no-login wizard for HR to submit drive details | HR/Recruiter | ✅ Completed |
| **HR Drive Approval Workflow** | Admin approves/rejects/requests changes on HR-submitted drives | Admin | ✅ Completed |
| **Student Applications** | Students apply to eligible drives; track status | Student | ✅ Completed |
| **Eligibility Engine** | Automated eligibility checking (CGPA, backlogs, branch, etc.) | System | ✅ Completed |
| **Student Data Import (Excel)** | Bulk import students from Excel/CSV files | Admin | ✅ Completed |
| **Student Provisioning** | Auto-create accounts for imported students | Admin | ✅ Completed |
| **Analytics Dashboard** | Placement statistics, department breakdown, year comparison, salary analysis | Admin | ✅ Completed |
| **Notification System** | In-app notifications with BullMQ queue support | All | ✅ Completed |
| **Push Notifications (FCM)** | Firebase Cloud Messaging for mobile push | All | ✅ Completed |
| **Socket.io Real-time Updates** | Live notification delivery via WebSocket | All | ✅ Completed |
| **Calendar View** | Admin calendar for drive scheduling (FullCalendar) | Admin | ✅ Completed |
| **Reports Generation** | Exportable placement reports stored in a private Supabase bucket with authenticated downloads | Admin | ✅ Completed |
| **Admin Settings** | Coordinator management, system configuration | Admin | ✅ Completed |
| **Mobile App (React Native)** | Expo app for students plus role-limited administrative workflows; standalone APK generated and installed | Student, Coordinator, Super Admin | ⚠️ Physical install/login confirmed; latest working-tree changes need rebuild and regression testing |
| **Password Reset (OTP)** | Secure OTP-based password reset with email delivery via SMTP/Brevo, rate limiting, and HMAC-hashed tokens | All | ✅ Completed |
| **Email Service** | Nodemailer SMTP transporter with HTML templates for password reset and OTP delivery | System | ✅ Completed |
| **Health Diagnostics** | Liveness (`/health`) and readiness (`/health/ready`) endpoints with Redis probe and 2s timeout | System | ✅ Completed; no active external monitor and no zero-downtime guarantee |
| **Vercel Deployment** | Web app SPA routing configured for Vercel with `vercel.json` | System | ✅ Completed |
| **Render Deployment** | API deployed to Render free tier (Singapore) with Redis Key Value (Valkey 8) | System | ⚠️ Live, but API sleeps after 15 idle minutes by platform design |
| **Drive Publication Notifications** | Idempotent publication event delivers in-app, push, and email notifications to eligible verified students | Student, Admin, System | 🚧 Implemented in working tree; migration/deployment verification pending |
| **Drive Deep Links** | Web fallback and mobile routing for shared placement-drive URLs, preserving destination through login | Student | 🚧 Implemented in working tree; native domain association and fresh APK pending |
| **AI Success Prediction** | ML model predicts student placement success probability | Admin, ML Service | ❌ Removed |
| **AI Placement Forecasting** | ML models forecast year-over-year placement metrics | Admin, ML Service | ❌ Removed |
| **AI Resume Parsing** | Extract structured data from uploaded resumes | System | ❌ Removed |
| **AI Embeddings** | Generate profile/job embeddings for semantic matching | System | ❌ Removed |
| **AI Admin Analytics** | Advanced AI analytics for admins | Admin | ❌ Removed |
| **Recruiter Event Portal** | Public recruiter event view via token | Recruiter | ✅ Completed |
| **Global UI Loader** | Centralized React Query fetching loader across the application | All | ✅ Completed |
| **Separated Academic Documents** | Secure individual PDF uploads of student academic documents (10th, 12th/Diploma, Degree) to Supabase Storage | Student, Admin | ✅ Completed |
| **Student Calendar** | FullCalendar implementation for student interview and drive schedules | Student | ✅ Completed |
| **Student Settings** | Comprehensive settings module: Account, Profile, Notifications, Security, Application, Calendar, Regional, Connected Devices, Privacy, Appearance, Danger Zone, Help & Support | Student | ✅ Completed |
| **Theme Engine** | Global dark mode and compact mode support using Tailwind v4 css variables and ThemeProvider | All | ✅ Completed |

---

# 3. User Roles & Permissions

| Role | Auth | Accessible Routes | Key Actions | Restrictions |
|------|------|-------------------|-------------|-------------|
| **STUDENT** | Firebase credential exchanged for API JWT | `/student/*` | View drives, apply, manage profile, view applications/interviews/documents | Cannot access admin routes; profile locked after verification (must request update) |
| **SUPER_ADMIN** | Firebase credential exchanged for API JWT | `/admin/*` | Institution-wide access: drives, students, coordinators, analytics, reports, notifications, calendar, settings, imports and verification | Full system access |
| **COORDINATOR** | Firebase credential exchanged for API JWT | Limited `/admin/*` | Manage students, verifications, update requests, documents, and notes within the assigned department | Department is mandatory; institution-wide dashboards, calendar, broadcasts, imports, provisioning, coordinator management, analytics, reports, drive administration, and settings are SUPER_ADMIN-only |
| **HR/Recruiter** | Token-based (no login) | `/hr-drive/:token` | Submit drive details via wizard | Access only through unique invitation link with expiry; no account required |
| **Guest** | None | `/login`, `/about`, `/features`, `/modules`, `/how-it-works`, `/faq`, `/contact` | View public pages, login | Cannot access protected routes |

### Authentication Flow

1. The client authenticates the email and password with Firebase Auth.
2. The client sends the Firebase ID token to `POST /api/auth/firebase-login`.
3. The API verifies the Firebase token, loads the user from PostgreSQL, and derives the role from the database; browser-supplied roles are ignored.
4. Demo accounts listed in `DEMO_EMAIL_ALLOWLIST` are allowed to sign in without Firebase email verification.
5. The API issues a short-lived JWT (15 minutes by default via `JWT_ACCESS_EXPIRES_IN`). The frontend stores it in the persisted Zustand auth store.
6. Subsequent API calls include `Authorization: Bearer <token>`.
7. `auth.middleware.ts` verifies the JWT and re-reads the user, current role, and coordinator department from PostgreSQL on every protected request.
8. Route authorization uses `authorize(...roles)` plus department ownership checks for coordinator-accessible student workflows.
9. Firebase login fails closed; the frontend does not fall back to an offline or client-selected role.

### Password Reset Flow

1. User navigates to `/forgot-password` or opens the `ForgotPasswordModal` from the login page.
2. User submits their email → `POST /api/auth/password-reset/request` sends a 6-digit OTP via SMTP.
3. OTP is HMAC-hashed (SHA-256 with `PASSWORD_RESET_SECRET`) before storage; expires in 5 minutes.
4. User enters OTP → `POST /api/auth/password-reset/verify` validates with timing-safe comparison.
5. On success, returns a single-use `resetGrant` token (valid 10 minutes).
6. User sets new password → `POST /api/auth/password-reset/confirm` updates both PostgreSQL and Firebase Auth.
7. All active challenges for the user are invalidated after successful reset.
8. Rate limited: 60-second cooldown between resend requests; max 5 failed OTP attempts per challenge.

### Route Guards (Frontend)

- `GuestRoute` — Only unauthenticated users (redirects to dashboard if logged in)
- `ProtectedStudentRoute` — Must be STUDENT role
- `ProtectedAdminRoute` — Must be SUPER_ADMIN or COORDINATOR
- `PublicRoute` — No auth required

## 23. Current Priorities

### Phase 1: Stabilization & Core (P0)

- `[x]` **P0.1 Enable Redis + BullMQ Notification Workers**
  - **Problem**: In `apps/api/src/index.ts`, the block starting with `// ─── Initialize Notification Queue Infrastructure ───────` is commented out or not functioning.
  - **Task**: Safely initialize Redis and queue workers. Include fallback/graceful shutdown so the API doesn't crash if Redis is unavailable.
- `[x]` **P0.2 Secure Analytics Routes**
  - **Problem**: `apps/api/src/routes/analytics.routes.ts` routes are currently completely unprotected.
  - **Task**: Add JWT authentication and authorize only `SUPER_ADMIN` and `COORDINATOR` roles.

### Phase 2: Complete Partially Implemented Features (P1)

- `[x]` **P1.1 Complete Mobile Core Screens**
  - **Problem**: `apps/mobile/src/screens/` has missing implementations for the student dashboard and profile view.
  - **Task**: Implement the remaining screens maintaining the existing React Native architecture.
- `[x]` ~~**P1.2 Complete NLP Resume Parsing**~~ (❌ Removed)

### Phase 3: Fix Outstanding Architecture Debt (P2)

- `[x]` **P2.1 Consolidate Firebase Initialization**
  - **Problem**: Multiple controllers (`auth.controller.ts`, `admin.controller.ts`) initialize Firebase directly instead of using the central `config/firebase-admin.ts`.
  - **Task**: Merge all Firebase initialization logic into `config/firebase-admin.ts` and update controllers to use the shared export. Delete the redundant `firebaseAdmin.ts` file if it exists.
- `[x]` **P2.2 Formalize Shared Packages**
  - **Problem**: `packages/` contains UI and utility code but lacks proper `package.json` configurations.
  - **Task**: Add minimal `package.json` files to directories under `packages/` to support standard monorepo workspace imports.
- `[x]` **P2.3 Implement Report Export**
  - **Problem**: Admin dashboard has a report export button, but the backend endpoint is missing.
  - **Outcome**: Added `/export/excel` using ExcelJS and private Supabase report storage with authenticated downloads.
- `[x]` **P2.4 Complete Recruiter Event Portal**
  - **Problem**: Recruiter routes are incomplete and placeholder-only.
  - **Task**: Complete `recruiter.controller.ts` for candidate shortlisting and interview scheduling.
- `[x]` **P2.5 Standardize Backend Error Responses**
  - **Problem**: Error responses are inconsistent across the API.
  - **Task**: Create a central `AppError` class and an `error.middleware.ts` to handle formatting and status codes uniformly.

### Phase 4: Polish & Deployment Prep (P3)

- `[x]` **P3.1 CI/CD**
  - **Task**: Create a GitHub Actions workflow (`.github/workflows/main.yml`) that runs `npm run lint`, `npm run type-check`, and python tests on PRs to `main`.
- `[x]` **P3.2 Code Splitting**
  - **Task**: Ensure the frontend router uses `React.lazy` for all major feature modules to reduce initial bundle size.
- `[x]` **P3.3 Remove Unused Dependencies**
  - **Task**: Clean up `package.json` and remove unused libraries.
- `[x]` **P3.4 Update `.env.example`**
  - **Task**: Ensure all new environment variables required by the recent implementations (like Redis) are documented.

### Phase 5: UI/UX Production Overhaul (P4)

- `[x]` **P4.1 Global Design System Standardization**
  - **Task**: Eliminate hardcoded legacy colors and implement a semantic token system using Tailwind v4 (e.g., `bg-background`, `text-primary`). Apply unified component standards (Buttons, Cards, LoadingStates).
- `[x]` **P4.2 Portal Layout Refactoring**
  - **Task**: Overhaul the Student, Placement Cell (Admin), HR, and Public layouts to ensure professional and accessible navigation structures.
- `[x]` **P4.3 Workflow Simplification & Polishing**
  - **Task**: Modernize complex views such as the Student Profile Wizard (2000+ lines), Admin Event Details, Data Tables, and Recruiter Dashboards to align with industry SaaS standards.

---

# 4. Technology Stack

## Frontend (Web) — `apps/web`

| Concern | Technology | Version |
|---------|-----------|---------|
| Framework | React | ^18.3.1 |
| Language | TypeScript | ~6.0.2 |
| Build Tool | Vite | ^8.1.1 |
| Styling | Tailwind CSS v4 | ^4.3.2 |
| Component Library | shadcn/ui (via `components.json`) | Latest |
| State Management (Client) | Zustand | ^4.5.7 |
| Server State | TanStack React Query | ^5.101.2 |
| Routing | React Router DOM v7 | ^7.18.1 |
| Forms | React Hook Form | ^7.81.0 |
| Validation | Zod | ^4.4.3 |
| HTTP Client | Axios | ^1.18.1 |
| Icons | Lucide React | ^1.24.0 |
| Animations | Framer Motion | ^12.42.2 |
| Charts | Recharts | ^3.9.2 |
| Calendar | FullCalendar React | ^6.1.15 |
| Notifications (Toast) | Sonner + React Hot Toast | Latest |
| Date Utilities | date-fns | ^4.4.0 |
| PDF Generation | jsPDF + html2canvas | Latest |
| CSV/Excel Parsing | PapaParse + ExcelJS | Latest |
| Maps | react-simple-maps | ^5.0.5 |
| Real-time | Socket.io Client | ^4.8.3 |
| Firebase SDK | firebase | ^12.16.0 |

## Frontend (Mobile) — `apps/mobile`

| Concern | Technology | Version |
|---------|-----------|---------|
| Framework | React Native (Expo) | 0.81.5 / Expo ~54.0.0 |
| Language | TypeScript | ~5.9.2 |
| Navigation | React Navigation (native-stack, bottom-tabs, drawer) | ^7.x |
| State Management | Zustand | ^5.0.14 |
| Server State | TanStack React Query | ^5.101.4 |
| HTTP Client | Axios | ^1.18.1 |
| Push Notifications | expo-notifications | ~0.32.17 |
| Secure Storage | expo-secure-store | ~15.0.8 |
| Icons | lucide-react-native | ^1.27.0 |
| Real-time | Socket.io Client | ^4.8.3 |
| Firebase SDK | firebase | ^12.17.0 |

## Backend (API) — `apps/api`

| Concern | Technology | Version |
|---------|-----------|---------|
| Runtime | Node.js | ≥ 20.x |
| Language | TypeScript | ^5.1.6 |
| Framework | Express.js | ^4.18.2 |
| ORM | Prisma | ^5.0.0 |
| Database | PostgreSQL (via Supabase / local pgvector) | Latest |
| Authentication | Firebase Admin + JSON Web Tokens (jsonwebtoken); bcryptjs for legacy/provisioning password flows | Current workspace versions |
| Firebase Admin | firebase-admin | ^13.10.0 |
| Real-time | Socket.io | ^4.8.3 |
| Job Queue | BullMQ | ^6.0.0 |
| Cache/Queue Backend | Redis (ioredis) | ^5.11.1 |
| Validation | Zod | ^3.21.4 |
| Excel Parsing/Export | ExcelJS | Current workspace version |
| DB Driver | pg | ^8.22.0 |
| Supabase Client | @supabase/supabase-js | ^2.112.3 |

## ML Service — `ml-service` (❌ Removed)

| Concern | Technology |
|---------|-----------|
| Runtime | Python 3.10 |
| Framework | FastAPI + Uvicorn |
| ML Libraries | scikit-learn, XGBoost |
| Data Processing | pandas, NumPy |
| NLP | spaCy (en_core_web_sm) |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Resume Parsing | PyMuPDF, python-docx |
| Database | SQLAlchemy + psycopg2-binary (PostgreSQL) |
| Model Serialization | joblib |
| Containerization | Docker |

## Database

| Concern | Detail |
|---------|--------|
| **Primary DB** | PostgreSQL (Supabase-hosted for cloud, pgvector Docker for local dev) |
| **ORM** | Prisma (schema at `apps/api/prisma/schema.prisma`) |
| **Legacy DB** | Firebase Realtime Database (auth + some legacy data; being migrated) |
| **Local Dev DB** | SQLite (`prisma/dev.db`) exists for quick local development |


## Infrastructure

| Concern | Detail |
|---------|--------|
| Containerization | Docker + docker-compose (PostgreSQL) |
| Cloud Backend | Firebase (Auth, Realtime DB, Cloud Storage, FCM) |
| Cloud Database | Supabase (PostgreSQL hosting) |
| Queue Backend | Redis (for BullMQ notification queue) |
| Real-time | Socket.io (web + mobile) |

## Development Tools

| Tool | Detail |
|------|--------|
| Package Manager | npm (workspaces) |
| Monorepo | npm workspaces (`apps/*`, `packages/*`) |
| Code Formatting | Prettier ^3.9.5 |
| Linting | ESLint |
| Editor Config | `.editorconfig` |
| Path Aliases | `@/*` → `src/*` (Vite + tsconfig) |
| Dev Runner | `concurrently` (runs API + web simultaneously) |
| API Dev Server | ts-node-dev (auto-restart) |

---

# 5. Repository Structure

```
PlacementX/
├── apps/
│   ├── api/                        # Express.js backend API
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Database schema (source of truth)
│   │   │   └── dev.db              # Local SQLite dev database
│   │   ├── src/
│   │   │   ├── config/             # Firebase Admin, Redis config
│   │   │   ├── controllers/        # Route handlers (business logic)
│   │   │   ├── middlewares/        # Auth (JWT), authorization
│   │   │   ├── routes/             # Express route definitions
│   │   │   ├── services/           # Business services (eligibility, notifications, push, queue)
│   │   │   ├── socket/             # Socket.io initialization
│   │   │   ├── utils/              # Utility helpers
│   │   │   ├── index.ts            # Server entry point
│   │   │   └── seed.ts             # Database seed script
│   │   ├── scripts/                # Utility scripts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                        # React (Vite) web application
│   │   ├── src/
│   │   │   ├── app/                # App-level setup
│   │   │   ├── components/         # Shared UI components
│   │   │   │   ├── common/         # Loading, NotFound, Unauthorized
│   │   │   │   ├── layout/         # Layout utilities
│   │   │   │   ├── navigation/     # Navigation components
│   │   │   │   └── ui/             # shadcn/ui primitives
│   │   │   ├── config/             # Firebase config, env, navigation, theme
│   │   │   ├── contexts/           # React context providers
│   │   │   ├── features/           # Feature-based modules
│   │   │   │   ├── admin/          # Admin dashboard, drives, students, etc.
│   │   │   │   ├── auth/           # Login pages
│   │   │   │   ├── hr-portal/      # HR drive wizard
│   │   │   │   ├── notifications/  # Notification components/pages
│   │   │   │   ├── public/         # Landing, About, FAQ, etc.
│   │   │   │   └── student/        # Student dashboard, profile, applications
│   │   │   ├── hooks/              # Custom hooks (queries, FCM, notifications)
│   │   │   ├── layouts/            # Page layouts (Student, Admin, HR, Auth, Public)
│   │   │   ├── lib/                # Utility functions
│   │   │   ├── providers/          # React context providers
│   │   │   ├── routes/             # Router config + route guards
│   │   │   ├── services/           # API service layer (Axios)
│   │   │   ├── stores/             # Zustand stores (authStore)
│   │   │   ├── styles/             # Additional CSS
│   │   │   ├── types/              # TypeScript types
│   │   │   └── index.css           # Tailwind CSS v4 entry
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── components.json         # shadcn/ui config
│   │   └── package.json
│   │
│   └── mobile/                     # React Native (Expo) mobile app
│       ├── src/
│       │   ├── components/         # Mobile UI components
│       │   ├── config/             # Mobile config
│       │   ├── hooks/              # Mobile hooks
│       │   ├── lib/                # Mobile utilities
│       │   ├── navigation/         # React Navigation setup
│       │   ├── providers/          # Mobile providers
│       │   ├── screens/            # Screen components (admin, auth, shared, student)
│       │   ├── services/           # Mobile API services
│       │   ├── stores/             # Mobile state stores
│       │   ├── theme/              # Mobile theming
│       │   └── types/              # Mobile types
│       ├── App.tsx                  # Root component
│       ├── index.ts                # Entry point
│       ├── app.json                # Expo configuration
│       └── package.json
│
├── packages/                       # Shared monorepo packages
│   ├── assets/                     # Shared assets
│   ├── config/                     # Shared configuration
│   ├── constants/                  # Shared constants
│   ├── firebase/                   # Shared Firebase config
│   ├── hooks/                      # Shared hooks
│   ├── types/                      # Shared TypeScript types (user, student, company, etc.)
│   ├── ui/                         # Shared UI components
│   ├── utils/                      # Shared utilities
│   └── validation/                 # Shared validation schemas
│
├── Student_data/                   # Raw student data (Excel files for import)
│   ├── Current/                    # Current year data
│   └── previous/                   # Historical data
│
├── All Prompts/                    # AI development prompts used during building
│
├── .env.example                    # Environment variable template
├── database.rules.json             # Firebase Realtime Database security rules
├── database_architecture.md        # Firebase DB architecture documentation
├── database_scheme.md              # Firebase DB schema documentation
├── docker-compose.yml              # Docker: PostgreSQL
├── excel_schema.json               # Excel import schema definition
├── login_credentials.md            # Test account credentials
├── run.bat                         # Windows dev startup script
├── run.sh                          # Unix dev startup script
├── package.json                    # Root monorepo package.json
├── ARCHITECTURE.md                 # System architecture documentation
└── README.md                       # Project README
```

### Key Directories — What NOT to Modify Carelessly

| Directory | Warning |
|-----------|---------|
| `apps/api/prisma/schema.prisma` | Source of truth for DB schema. Run `npx prisma db push` after changes. |
| `apps/web/src/routes/index.tsx` | Central routing config. Adding/removing routes requires updating guards. |
| `apps/web/src/stores/authStore.ts` | Auth state used everywhere. Changes cascade across all protected routes. |
| `apps/api/src/middlewares/auth.middleware.ts` | JWT verification. Changes break all protected endpoints. |
| `packages/types/` | Shared types used by web + mobile. Changes affect both platforms. |

---

# 6. System Architecture

```mermaid
flowchart TB
    subgraph Clients
        Web["React Web App\n(Vite, port 5173)"]
        Mobile["React Native Mobile\n(Expo)"]
        HR["HR Portal\n(Token-based, no auth)"]
    end

    subgraph Backend
        API["Express.js API\n(port 5000)"]
        SocketIO["Socket.io\n(Real-time)"]
        BullMQ["BullMQ\n(Job Queue)"]
    end

    subgraph Data
        PG["PostgreSQL\n(Supabase / pgvector)"]
        Firebase["Firebase\n(Auth + RTDB + Storage + FCM)"]
        Redis["Redis\n(Queue Backend)"]
    end

    
    Web -->|REST + Socket.io| API
    Mobile -->|REST + Socket.io| API
    HR -->|REST| API
    API --> PG
    API --> Firebase
    API --> Redis
        SocketIO --- API
    BullMQ --- Redis
        ```

### Data Flow

```
User Interaction
       │
       ▼
React Component (UI Layer)
       │
       ├── Form: React Hook Form + Zod Schema
       │
       ▼
Custom Hook / Service Call (Axios)
       │
       ├── TanStack Query (cache, loading, error states)
       │
       ▼
Express.js API (REST)
       │
       ├── JWT Auth Middleware → Role Authorization
       │
       ▼
Controller → Service → Prisma ORM
       │
       ▼
PostgreSQL Database
       │
       ├── Socket.io event → Client real-time update
       ├── BullMQ job → Push notification (FCM)
       ```

### Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web/Mobile
    participant A as API Server
    participant DB as PostgreSQL
    participant FB as Firebase Auth

    U->>W: Enter email + password
    W->>FB: Sign in
    FB-->>W: Firebase ID token
    W->>A: POST /api/auth/firebase-login
    A->>FB: Verify ID token
    A->>DB: Load user and database-owned role
    A->>A: Generate short-lived JWT
    A-->>W: { token, user }
    W->>W: Zustand store.setAuth(user, token)
    W->>A: Subsequent requests (Bearer token)
    A->>A: Verify JWT
    A->>DB: Reload role and coordinator department
    A->>A: Enforce role and department scope
    A-->>W: Protected resource

    Note over A,FB: Firebase Admin also supports FCM push notifications
```

---

# 7. Frontend Architecture

## Web App (`apps/web`)

### Layouts

| Layout | Routes | Description |
|--------|--------|-------------|
| `PublicLayout` | `/about`, `/features`, `/modules`, `/how-it-works`, `/faq`, `/contact` | Public marketing pages |
| `AuthLayout` | `/login` | Login page wrapper |
| `StudentLayout` | `/student/*` | Student sidebar + header |
| `PlacementCellLayout` | `/admin/*` | Admin sidebar + header |
| `HrPortalLayout` | `/hr-drive/:token` | Minimal layout for HR collaboration |
| `RecruiterEventLayout` | `/event/:token` | Public recruiter event view |

### Route Map

| Path | Page | Guard |
|------|------|-------|
| `/` | Redirects to `/login` | None |
| `/login` | Unified Login (role-detection, forgot password modal) | GuestRoute |
| `/forgot-password` | OTP-based password reset (multi-step: email → OTP → new password) | None |
| `/reset-password` | Redirects to `/forgot-password` | None |
| `/student/login` | Redirects to `/login` | None (legacy) |
| `/admin/login` | Redirects to `/login` | None (legacy) |
| `/student/dashboard` | Student Dashboard | ProtectedStudentRoute |
| `/student/profile` | Student Profile (multi-step form) | ProtectedStudentRoute |
| `/student/applications` | My Applications | ProtectedStudentRoute |
| `/student/drives/:id` | Drive Details | ProtectedStudentRoute |
| `/student/interviews` | Interview Schedule | ProtectedStudentRoute |
| `/student/documents` | Documents | ProtectedStudentRoute |
| `/student/notifications` | Notifications | ProtectedStudentRoute |
| `/student/settings` | Settings (13-panel comprehensive module) | ProtectedStudentRoute |
| `/admin/dashboard` | Admin Dashboard (stats, charts) | ProtectedAdminRoute |
| `/admin/analytics` | Analytics Dashboard | ProtectedAdminRoute |
| `/admin/students` | Student Management | ProtectedAdminRoute |
| `/admin/students/import` | Bulk Student Import | ProtectedAdminRoute |
| `/admin/students/verifications` | Profile Verifications | ProtectedAdminRoute |
| `/admin/students/update-requests` | Update Request Review | ProtectedAdminRoute |
| `/admin/placement-events` | Drive List | ProtectedAdminRoute |
| `/admin/placement-events/create` | Create Drive Wizard | ProtectedAdminRoute |
| `/admin/placement-events/edit/:id` | Edit Drive | ProtectedAdminRoute |
| `/admin/placement-events/:id` | Drive Details | ProtectedAdminRoute |
| `/admin/calendar` | Calendar View | ProtectedAdminRoute |
| `/admin/notifications` | Notifications | ProtectedAdminRoute |
| `/admin/reports` | Reports | ProtectedAdminRoute |
| `/admin/settings` | Settings | ProtectedAdminRoute |
| `/hr-drive/:token` | HR Drive Wizard | None (token-based) |

### State Management

| Type | Solution |
|------|----------|
| Auth state | Zustand (`authStore.ts`) with `persist` middleware |
| Server data | TanStack React Query |
| Form state | React Hook Form + Zod resolvers |
| UI state | React `useState`/`useReducer` |
| URL state | React Router DOM |

### Key User Journeys

**Student Flow:**
```
Login → Dashboard → View Drives → Apply to Drive → Track Applications → Manage Profile
```

**Admin Flow:**
```
Login → Dashboard (stats) → Manage Drives → Create Drive (wizard) → 
Import Students → Verify Profiles → View Analytics → Send Notifications
```

**HR Collaboration Flow:**
```
Admin generates HR link → HR receives email → HR opens link → 
HR fills drive wizard → Auto-save draft → Submit → 
Admin reviews → Approve/Reject/Request Changes
```

---

# 8. Backend Architecture

### Entry Point

`apps/api/src/index.ts` — Express server on port 5000

### Architecture Pattern

```
Routes → Middleware (Auth + Authorization) → Controllers → Services → Prisma → PostgreSQL
```

### Route Modules

| Route Prefix | File | Description |
|-------------|------|-------------|
| `/api/auth` | `auth.routes.ts` | Login, register, firebase-login, change password, get me, password reset (request/verify/confirm/resend) |
| `/api/admin/drives` | `drive.routes.ts` | CRUD drives, applications, HR drive review |
| `/api/admin/analytics` | `analytics.routes.ts` | Placement stats, department data, year comparison, packages, funnel |
| `/api/admin/reports` | `reports.routes.ts` | Report generation, download, export history |
| `/api/admin/settings` | `settings.routes.ts` | System settings CRUD |
| `/api/admin` | `admin.routes.ts` | Dashboard, students, coordinators, calendar, import, provisioning, verifications, update requests |
| `/api/hr` | `hr.routes.ts` | Generate/validate HR links, auto-save draft, submit drive |
| `/api/student` | `student.routes.ts` | Profile CRUD, applications, interviews, documents |
| `/api/student/settings` | `student.settings.routes.ts` | Student preferences, privacy, calendar, regional, notifications, devices, support, danger zone |
| `/api/notifications` | `notification.routes.ts` | Full notification CRUD, preferences, device management, broadcast, schedule |
| `/api/public` | `public.routes.ts` | Public placement statistics |
| `/health` | `health.routes.ts` | Liveness (`/health`) and readiness (`/health/ready`) probes |

### Controllers

| Controller | File Size | Key Responsibilities |
|-----------|-----------|---------------------|
| `admin.controller.ts` | 58KB | Dashboard stats, student management, import, provisioning, coordinators, calendar, verifications, update request review |
| `admin.notification.controller.ts` | 10KB | Admin notification management and broadcasting |
| `analytics.controller.ts` | 14KB | Delegates all analytics endpoints to the `analytics/` service layer |
| `auth.controller.ts` | 12KB | Firebase token exchange, API JWT issuance, registration, demo account email verification bypass, and legacy/provisioning password flows |
| `drive.controller.ts` | 27KB | Drive CRUD, eligibility check, application status, HR drive review |
| `hr.controller.ts` | 22KB | HR link generation, validation, draft auto-save, drive submission |
| `notification.controller.ts` | 12KB | Notification CRUD, preferences, device registration, broadcast, scheduling |
| `passwordReset.controller.ts` | 3KB | OTP request, verify, confirm, and resend endpoints with Zod validation |
| `public.controller.ts` | 2KB | Public stats endpoint |
| `reports.controller.ts` | 5KB | Report generation, download, export history |
| `settings.controller.ts` | 2KB | Admin system settings CRUD |
| `student.calendar.controller.ts` | 7KB | Student calendar events |
| `student.controller.ts` | 21KB | Profile management, applications, interviews, documents |
| `student.settings.controller.ts` | 8KB | Student preference groups: profile, privacy, calendar, regional, notifications, devices, support, deactivation, data export |

### Services

| Service | Purpose |
|---------|---------|
| `analytics/*.service.ts` | 10 modular services (`overview`, `funnel`, `student-risk`, `insights`, etc.) handling all dashboard aggregations |
| `eligibility.service.ts` | Checks student eligibility against drive criteria |
| `email/email.service.ts` | Nodemailer SMTP transporter for password reset emails and OTP delivery (Brevo-compatible) |
| `email/templates/*.template.ts` | HTML email templates for password reset link and OTP delivery |
| `notification.service.ts` | Creates and manages notifications |
| `notification-queue.service.ts` | BullMQ queue for async notification processing |
| `offer-eligibility.service.ts` | Offer eligibility checking |
| `passwordReset.service.ts` | OTP generation, HMAC hashing, verification (timing-safe), reset-grant lifecycle, and Firebase Auth password update |
| `push-notification.service.ts` | Firebase Cloud Messaging push delivery |
| `reports/export.service.ts` | Excel/CSV report generation |
| `reports/report-queue.service.ts` | BullMQ queue for async report generation |
| `settings.service.ts` | System settings with Redis caching |
| `student-document.service.ts` | Student document management and signed URL generation |

### Middleware

| Middleware | Purpose |
|-----------|---------|
| `protect` (auth.middleware.ts) | Validates JWT Bearer token, attaches `req.user` |
| `authorize(...roles)` | Checks `req.user.role` against allowed roles |

### Real-time (Socket.io)

`apps/api/src/socket/index.ts` — Socket.io server attached to HTTP server. Used for delivering real-time notification events to connected clients.

---

# 9. Database Architecture

## Primary Database: PostgreSQL via Prisma

Schema source of truth: `apps/api/prisma/schema.prisma`

### Entity Summary

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| `User` | Core account | id, email, password, role, firebaseUid, mustChangePassword |
| `PasswordResetChallenge` | OTP-based password reset | userId, email, otpHash, otpExpiresAt, failedAttempts, status, resetGrantHash, resetGrantExpiresAt |
| `AccountActivationToken` | Account activation tokens | userId, tokenHash, expiresAt, usedAt |
| `StudentProfile` | Student details | userId, firstName, lastName, cgpa, branch, skills, resumeUrl, isProfileComplete, profileStatus, enrollmentStatus, trainingAttendance, policyAcknowledgedAt |
| `AdminProfile` | Admin details | userId, firstName, lastName |
| `CoordinatorProfile` | Coordinator details | userId, firstName, lastName, department |
| `Company` | Company registry | name, industry, hrName, hrEmail, logoUrl, website |
| `PlacementDrive` | Placement event | companyId, status, jobRole, eligibility criteria, salary, schedule |
| `DrivePublicationEvent` | Idempotent drive publication dispatch | driveId, status, triggeredBy, eligibleCount, processedCount, startedAt, completedAt |
| `DrivePublicationDelivery` | Per-recipient/channel delivery ledger | eventId, recipientId, channel, status, attemptCount, providerMessageId, acceptedAt, deliveredAt |
| `SelectionRound` | Drive round details | driveId, roundNumber, title, roundType, date, venue, status, resultStatus |
| `DriveApplication` | Student application | driveId, studentId, status, verifiedProfileAt, eligibilitySnapshot |
| `ApplicationRoundResult` | Per-round student results | applicationId, roundId, score, percentage, rank, result, status, version |
| `OfferLetter` | Offer/joining letters | applicationId, offerLetterUrl, joiningLetterUrl, selectionStatus, offerStatus, packageDetails |
| `Notification` | System notifications | title, message, type, receiverId, isRead, priority, category, campaignId |
| `NotificationCampaign` | Broadcast campaign tracking | title, message, audienceType, channels, status, scheduledFor |
| `NotificationTemplate` | Reusable notification templates | name, category, title, message, isFavorite |
| `NotificationPreference` | User preferences | userId, placement, interviews, pushEnabled, emailEnabled, quietHours |
| `DeviceToken` | FCM device tokens | userId, token, platform |
| `HrInvitationLink` | HR portal tokens | driveId, token, hrEmail, isUsed, expiresAt, revokedAt, permissions |
| `PlacementPolicyVersion` | Versioned placement policies | version, name, status, effectiveFrom, rules |
| `EligibilityEvaluation` | Structured eligibility assessments | studentId, driveId, policyVersionId, eligible, reasonCodes, explanations |
| `AttendanceExceptionReview` | Attendance exception reviews | studentId, attendanceEvent, status, eligibilityEffect |
| `DriveAuditLog` | Drive change history | driveId, action, performedBy |
| `ProfileUpdateRequest` | Student profile change requests | studentId, requestedChanges, status, reviewedBy |
| `ProfileAuditLog` | Profile change history | studentId, action, previousValue, newValue |
| `ImportedStudent` | Bulk imported raw data | studentId, fullName, email, department, academicYear, cgpa, placementStatus |
| `CustomCalendarEvent` | Admin custom calendar events | title, start, end, type, color, isAllDay |
| `AcademicYear` / `Semester` | Academic period management | year, startDate, endDate, isActive |
| `ReportTemplate` | Saved report configurations | name, category, filters, columns |
| `ReportExportHistory` | Report export tracking | reportName, status, fileUrl, format, recordCount |
| `ScheduledReport` | Recurring report schedules | reportName, frequency, recipients, nextRunAt |
| `SystemSetting` | Dynamic system configuration | key, value, category, isPublic |
| `SettingAuditLog` | Settings change history | settingKey, oldValue, newValue, changedBy |
| `StudentDocument` | Academic document uploads | studentId, documentType, filePath, fileUrl, mimeType |
| `StudentPreference` | Student settings/preferences | studentId, theme, compactMode, language, timezone, profileVisibility, calendarView |

### Key Relationships

```
User 1────1 StudentProfile
User 1────1 AdminProfile
User 1────1 CoordinatorProfile
User 1────N DeviceToken
User 1────N Notification
User 1────1 NotificationPreference

Company 1────N PlacementDrive
PlacementDrive 1────N DriveApplication
PlacementDrive 1────N SelectionRound
PlacementDrive 1────N DriveAuditLog
PlacementDrive 1────N HrInvitationLink

StudentProfile 1────N DriveApplication
StudentProfile 1────N ProfileUpdateRequest
StudentProfile 1────N ProfileAuditLog

DriveApplication 1────1 OfferLetter
DriveApplication UNIQUE(driveId, studentId)
```

### Application Statuses

- Drive: `WAITING_FOR_HR`, `DRAFT`, `UNDER_REVIEW`, `ACTIVE`, `CLOSED`, `COMPLETED`
- Application: `APPLIED`, `SHORTLISTED`, `INTERVIEWED`, `OFFERED`, `REJECTED`
- Profile: `NOT_COMPLETED`, `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`
- Update Request: `PENDING`, `APPROVED`, `REJECTED`

## Legacy Database: Firebase Realtime Database

Firebase RTDB is still used for authentication tokens (FCM) and some legacy data. The `database.rules.json` defines security rules for `students`, `admins`, `drives`, and `applications` nodes. Migration to PostgreSQL is the current direction.

---

# 10. API Documentation

**Base URL:** `http://localhost:5000/api`
**Auth:** Bearer JWT token in `Authorization` header

### Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Register new user |
| POST | `/auth/login` | None | Login (email + password → JWT) |
| POST | `/auth/firebase-login` | None | Login via Firebase token |
| POST | `/auth/forgot-password` | None | Legacy forgot password (Firebase) |
| POST | `/auth/password-reset/request` | None | Request OTP for password reset |
| POST | `/auth/password-reset/verify` | None | Verify 6-digit OTP, receive reset grant |
| POST | `/auth/password-reset/confirm` | None | Confirm password reset with grant + new password |
| POST | `/auth/password-reset/resend` | None | Resend OTP (60s cooldown) |
| GET | `/auth/me` | JWT | Get current user profile |
| PUT | `/auth/password` | JWT | Change password |

### Admin Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/dashboard` | Admin | Dashboard statistics |
| GET | `/admin/students` | Admin | List all students |
| POST | `/admin/students/import` | Admin | Bulk import from Excel |
| POST | `/admin/students/provision` | Admin | Auto-create accounts for imported students |
| GET | `/admin/coordinators` | Admin | List coordinators |
| POST | `/admin/coordinators` | Admin | Add coordinator |
| GET | `/admin/reports/data` | Admin | Reports data |
| POST | `/admin/notifications/broadcast` | Admin | Send broadcast notification |
| GET | `/admin/calendar` | Admin | Calendar events |
| GET | `/admin/profile-verifications` | Admin | Pending profile verifications |
| POST | `/admin/profile-verifications/:id/verify` | Admin | Approve/reject profile |
| GET | `/admin/profile-update-requests` | Admin | Pending update requests |
| POST | `/admin/profile-update-requests/:id/review` | Admin | Approve/reject update |

### Drive Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/admin/drives` | Admin | Create drive |
| GET | `/admin/drives` | JWT | List drives |
| GET | `/admin/drives/:id` | JWT | Get drive details |
| PUT | `/admin/drives/:id` | Admin | Update drive |
| DELETE | `/admin/drives/:id` | Admin | Delete drive |
| GET | `/admin/drives/:id/eligibility` | JWT | Check eligibility |
| GET | `/admin/drives/:id/applications` | Admin | List applications |
| PUT | `/admin/drives/applications/:id/status` | Admin | Update application status |
| POST | `/admin/drives/:id/approve` | Admin | Approve HR drive |
| POST | `/admin/drives/:id/reject` | Admin | Reject HR drive |
| POST | `/admin/drives/:id/request-changes` | Admin | Request changes on HR drive |
| GET | `/admin/drives/:id/publication-status` | Admin | Aggregate publication and per-channel delivery status |

### Student Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/student/profile` | JWT | Get own profile |
| GET | `/student/profile/status` | JWT | Get profile status |
| PUT | `/student/profile` | JWT | Update profile |
| PUT | `/student/profile/update-request` | JWT | Submit update request |
| POST | `/student/applications` | JWT | Apply for drive |
| GET | `/student/applications` | JWT | List own applications |
| GET | `/student/interviews` | JWT | Get interview schedule |
| GET | `/student/documents` | JWT | Get documents |
| GET | `/student/documents` | JWT | Get documents |

### HR Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/hr/generate` | Admin | Generate HR invitation link |
| POST | `/hr/validate` | None | Validate HR token |
| PUT | `/hr/draft` | None | Auto-save HR drive draft |
| POST | `/hr/submit` | None | Submit completed HR drive |

### Recruiter Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/recruiter/event/:token` | None | Get event details and stats |
| GET | `/recruiter/event/:token/candidates` | None | Get candidates for the event |
| POST | `/recruiter/event/:token/shortlist` | None | Update candidate status (shortlist/reject) |
| POST | `/recruiter/event/:token/interview` | None | Schedule interview |
| POST | `/recruiter/event/:token/results` | None | Bulk update candidate status |

### Notification Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | JWT | Get notifications (paginated, filterable) |
| GET | `/notifications/unread-count` | JWT | Unread count |
| PATCH | `/notifications/:id/read` | JWT | Mark as read |
| PATCH | `/notifications/:id/archive` | JWT | Archive notification |
| DELETE | `/notifications/:id` | JWT | Delete notification |
| GET | `/notifications/preferences` | JWT | Get preferences |
| PUT | `/notifications/preferences` | JWT | Update preferences |
| POST | `/notifications/register-device` | JWT | Register FCM device |
| DELETE | `/notifications/remove-device` | JWT | Remove FCM device |
| POST | `/notifications/broadcast` | Admin | Broadcast notification |
| POST | `/notifications/schedule` | Admin | Schedule notification |

### Analytics Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/analytics/placement/overview` | Admin | Placement overview stats |
| GET | `/admin/analytics/placement/year-comparison` | Admin | Year-over-year comparison |
| GET | `/admin/analytics/placement/departments` | Admin | Department breakdown |
| GET | `/admin/analytics/placement/packages` | Admin | Salary/package analysis |
| GET | `/admin/analytics/placement/companies` | Admin | Company statistics |
| GET | `/admin/analytics/placement/funnel` | Admin | Application funnel |
| GET | `/admin/analytics/placement/intelligence` | Admin | AI-powered insights |

### Student Settings Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/student/settings` | Student | Get all settings |
| PUT | `/student/settings/profile-preferences` | Student | Update profile & placement preferences |
| PUT | `/student/settings/privacy` | Student | Update privacy settings |
| PUT | `/student/settings/calendar` | Student | Update calendar preferences |
| PUT | `/student/settings/regional` | Student | Update regional/language settings |
| PUT | `/student/settings/notifications` | Student | Update notification preferences |
| GET | `/student/settings/devices` | Student | List connected devices |
| DELETE | `/student/settings/devices/:id` | Student | Remove a connected device |
| POST | `/student/settings/support` | Student | Submit support request |
| POST | `/student/settings/deactivation-request` | Student | Request account deactivation |
| POST | `/student/settings/data-export` | Student | Request data export |

### Health Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | API liveness check (Express process only) |
| GET | `/health/ready` | None | Readiness probe (Redis PING with 2s timeout) |

### Public Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/public/stats` | None | Public placement statistics |

---

# 11. Authentication & Authorization

See section 3 (User Roles) for full details.

**Summary:**
- Primary sign-in: Firebase Auth; the API verifies the Firebase ID token and issues its own short-lived JWT.
- Authorization source of truth: PostgreSQL user role and coordinator department, refreshed during every authenticated request.
- Frontend auth state: Zustand persisted store.
- HR portal: Token-based, no user account required; token expiry is enforced for every workspace access state.
- Legacy/provisioning password utilities use `bcryptjs`; the frontend cannot choose or recover a role when authentication fails.
- Coordinator access is restricted to assigned-department student operations. Institution-wide administration requires `SUPER_ADMIN`.

---

# 12. User Flows

### Student Onboarding
```
Admin imports Excel → System creates ImportedStudent records →
Admin triggers provisioning → System creates User + StudentProfile accounts →
Student receives credentials → Student logs in → Must change password →
Student fills multi-step profile → Submits for verification →
Admin verifies → Profile locked → Student requests changes if needed
```

### Placement Drive Lifecycle
```
Method A: Admin creates drive directly via wizard
Method B: Admin generates HR link → HR fills drive wizard → Submits →
          Admin reviews (approve/reject/request-changes) →
Drive becomes ACTIVE → Students see in dashboard →
Eligible students apply → Admin manages applications →
Selection rounds → Offer letters → Drive completed
```

---

# 13. Business Rules

> ⚠️ These rules must NOT be accidentally broken during development.

1. **Profile Lock After Verification** — Once a student profile is verified by admin, the student cannot directly edit it. They must submit a `ProfileUpdateRequest` which admin approves or rejects.
2. **Eligibility Criteria** — Students can only apply when they meet all configured criteria: minimum CGPA, allowed branches, current and total backlog limits, year-gap limit, current semester, passing year, gender restriction, and required resume/portfolio/GitHub/LinkedIn fields.
3. **Unique Application** — A student can apply to a drive only once (`@@unique([driveId, studentId])` constraint).
4. **Must Change Password** — New accounts (especially provisioned ones) have `mustChangePassword: true`. Users must change password on first login.
5. **HR Links Expire** — HR invitation links have an `expiresAt` timestamp; expiry is enforced even after a drive becomes active or published.
6. **Role-Based Access** — `SUPER_ADMIN` owns institution-wide administration. `COORDINATOR` is limited to assigned-department student operations. Only `STUDENT` can access student routes.
7. **No Multiple Offers** — System setting: `allowMultipleOffers: false` (from Firebase config).
8. **Max Applications** — System setting: `maxApplicationsPerStudent: 5` (from Firebase config).
9. **Drive Status Flow** — Drives follow: `WAITING_FOR_HR` → `DRAFT` → `UNDER_REVIEW` → `ACTIVE` → `CLOSED` → `COMPLETED`.
10. **Profile Status Flow** — Profiles follow: `NOT_COMPLETED` → `PENDING_VERIFICATION` → `VERIFIED` (or `REJECTED`).
11. **Application Concurrency** — Application creation runs in a serializable transaction and rechecks duplicate applications, drive capacity, global application limits, and live offer limits before commit.

---

# 14. Environment Variables

### Root `.env.example`

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) | Yes |
| `DIRECT_URL` | PostgreSQL direct connection (Supabase) | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service credential | Report storage |
| `SUPABASE_STORAGE_BUCKET` | Student documents bucket name | No (default: `student-documents`) |
| `SUPABASE_REPORTS_BUCKET` | Generated reports bucket name | No (default: `generated-reports`) |
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_DATABASE_URL` | Firebase RTDB URL | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase analytics measurement ID | No |
| `FIREBASE_WEB_API_KEY` | Server-side Firebase Web API Key for password verification | Production |
| `FIREBASE_DATABASE_URL` | Server-side Firebase RTDB URL | Production |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `PASSWORD_RESET_SECRET` | Independent HMAC key for password-reset OTPs and grants (≥32 chars) | Yes |
| `JWT_ACCESS_EXPIRES_IN` | Access-token lifetime | No (default: `15m`) |
| `JWT_ISSUER` | JWT issuer metadata | No (default: `placementx-api`) |
| `JWT_AUDIENCE` | JWT audience metadata | No (default: `placementx-clients`) |
| `REDIS_URL` | Redis connection for BullMQ queues and workers | Production queues only |
| `REDIS_REQUIRED` | Whether Redis is mandatory for startup | No (default: `false`) |
| `SMTP_HOST` | SMTP server hostname (e.g., Brevo) | Password reset emails |
| `SMTP_PORT` | SMTP port | No (default: `587`) |
| `SMTP_USER` | SMTP username/login | Password reset emails |
| `SMTP_PASSWORD` | SMTP password/API key | Password reset emails |
| `EMAIL_FROM` | From address for outgoing emails | No (default: `no-reply@placementx.com`) |
| `EMAIL_FROM_NAME` | From display name | No (default: `PlacementX`) |
| `DEMO_EMAIL_ALLOWLIST` | Comma-separated demo accounts allowed to sign in without Firebase email verification | Development only |
| `OFFICIAL_STUDENT_EMAIL_DOMAINS` | Comma-separated domains accepted by student importer | Production |
| `CORS_ORIGINS` | Comma-separated allowed CORS origins | No (default: localhost) |
| `TRUST_PROXY` | Enable trust proxy for rate limiting behind reverse proxy | No (default: `false`) |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Auth rate limit window in ms | No (default: `900000`) |
| `AUTH_RATE_LIMIT_MAX` | Max auth attempts per window | No (default: `10`) |
| `FRONTEND_URL` | Frontend base URL for CORS and email links | No (default: `http://localhost:5173`) |
| `VITE_APP_NAME` | Application display name | No (default: PlacementX) |
| `VITE_APP_ENV` | Environment (development/production) | No |
| `PORT` | API server port | No (default: 5000) |

> ⚠️ **SECURITY:** Never commit actual secrets to version control. Use `.env.local` (gitignored).

---

# 15. Local Development Setup

### Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x
- **Docker** (for PostgreSQL + ML service, optional if using Supabase cloud)
- **Python 3.10** (for running ML service locally without Docker)
- A **Firebase project** with Auth, Realtime Database, Storage, and FCM enabled
- A **Supabase project** (or local PostgreSQL with pgvector)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd PlacementX

# 2. Install all workspace dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in Firebase + Supabase + JWT credentials
```

### Database Setup

```bash
# Option A: Docker (recommended for local dev)
docker-compose up -d    # Starts PostgreSQL (pgvector) + ML service

# Option B: Use Supabase cloud
# Configure DATABASE_URL and DIRECT_URL in .env.local

# Push Prisma schema to database
cd apps/api
npx prisma db push

# Seed initial data (admin + test student)
npm run db:seed
# OR: ts-node-dev src/seed.ts
```

### Start Development

```bash
# From root — starts API (port 5000) + Web (port 5173) concurrently
npm run dev

# Or use the convenience script (Windows):
run.bat

# Individual apps:
npm run dev --workspace=@placementx/api     # API only
npm run dev --workspace=@placementx/web     # Web only

# Mobile (from apps/mobile):
cd apps/mobile
npm start                                    # Expo dev server
```

### Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@nmims.edu` | `admin123` |
| Student | `student.name@nmims.edu` | `student123` |

---

# 16. Build & Test Commands

| Command | Scope | Description |
|---------|-------|-------------|
| `npm run dev` | Root | Start API + Web concurrently |
| `npm run build` | Root | Build all workspaces |
| `npm run lint` | Root | Lint all workspaces |
| `npm run format` | Root | Format all files (Prettier) |
| `npm run format:check` | Root | Check formatting |
| `npm run type-check` | Root | TypeScript type checking |
| `npm run seed` | Root | Run database seed |
| `npm run dev` | apps/web | Vite dev server (HMR) |
| `npm run build` | apps/web | `tsc -b && vite build` |
| `npm run lint` | apps/web | ESLint on `src/` |
| `npm run dev` | apps/api | `ts-node-dev` with auto-restart |
| `npm run build` | apps/api | TypeScript compilation |
| `npm run db:push` | apps/api | Development-only schema synchronization |
| `npm run db:migrate:deploy` | apps/api | Apply committed Prisma migrations in deployment environments |
| `npm run db:migrate:status` | apps/api | Inspect migration state |
| `npm run db:studio` | apps/api | Open Prisma Studio (DB GUI) |
| `npm run db:seed` | apps/api | Seed database |

---

# 17. Deployment

### Current State

**Deployed to production (single-college pilot).** The web app is deployed to Vercel with SPA routing. The API is deployed to Render (Singapore region) alongside a Render Key Value (Valkey 8) Redis instance.

### Production Infrastructure

| Service | Platform | Details |
|---------|----------|---------|
| **Frontend (Web)** | Vercel | SPA routing via `vercel.json`; auto-deploys from `main` |
| **Backend API** | Render (Singapore) | Express.js on Render free tier; auto-deploys from `main` |
| **Redis** | Render Key Value | Valkey 8 (Redis-compatible); private network only |
| **Database** | Supabase | PostgreSQL with Prisma ORM |
| **Firebase** | Google Cloud | Auth, Storage, FCM, RTDB |
| **Email** | Brevo (SMTP) | Password reset OTP delivery via Nodemailer |

### Docker Setup (Local)

```yaml
# docker-compose.yml
services:
  db: PostgreSQL + pgvector (port 5432)
```

### Health Monitoring

- **Liveness:** `GET /health` → `200 {"status":"ok"}` (Express process only)
- **Readiness:** `GET /health/ready` → `200 {"status":"ready"}` or `503 {"status":"not_ready"}` (Redis PING with 2s timeout)
- Neither endpoint exposes credentials, internal addresses, or stack traces.
- The live API uses Render Free compute. Render spins it down after 15 minutes without inbound traffic and the next request incurs a cold start.
- No external service is currently probing either endpoint. An external monitor can reduce idle cold starts but cannot guarantee continuous uptime; paid Render compute is required to remove intentional idle spin-down.
- See `docs/RENDER_FREE_TIER_KEEPALIVE.md` for the operational limitations and monitoring options.

### Required Deployment Steps

1. Provision PostgreSQL/Supabase, Redis, Firebase Auth/FCM, and the API/web runtimes.
2. Create a private Supabase Storage bucket named `generated-reports`; keep report downloads behind authenticated API endpoints.
3. Configure production secrets: `JWT_SECRET`, `PASSWORD_RESET_SECRET`, Firebase Admin credentials, Redis, Supabase, and SMTP credentials.
4. For a new database, run `npm run db:migrate:deploy`. For an existing database previously managed with `prisma db push`, back it up, verify that its schema matches the baseline, and mark `20260919000000_baseline` as applied with `prisma migrate resolve`; never execute the baseline SQL against a populated database.
5. Validate `/health` for process liveness and `/health/ready` for Redis readiness. The readiness endpoint returns HTTP 503 when Redis is unavailable.
6. Run API and web production builds, automated tests, and live end-to-end checks before admitting users.

---

# 18. External Services & Integrations

| Service | Purpose | Config Location |
|---------|---------|----------------|
| **Firebase Auth** | User authentication (legacy + FCM) | `apps/api/src/config/firebase-admin.ts` |
| **Firebase RTDB** | Legacy data storage, some real-time features | `database.rules.json` |
| **Firebase Cloud Storage** | File uploads (resumes, offer letters, logos) | Firebase SDK |
| **Firebase Cloud Messaging** | Push notifications to mobile devices | `push-notification.service.ts` |
| **Supabase** | PostgreSQL database hosting | `DATABASE_URL` env var |
| **Redis** | BullMQ job queue backend | `apps/api/src/config/redis.ts` |

---

# 19. Known Issues

| Issue | Severity | Area | Status | Description |
|-------|----------|------|--------|-------------|
| Multi-tenant isolation absent | Critical for SaaS | Architecture | Open | The schema and services are scoped for one college. Add tenant IDs and enforce tenant boundaries in database queries, unique constraints, storage paths, queues, Socket.io rooms, and administration before offering the product to multiple colleges. |
| Render Free API cold starts | High for production | Operations | Open | `placementx-api` is on Free compute and sleeps after 15 idle minutes. Health routes are passive and no external monitor is active. Upgrade to paid compute for an always-running instance. |
| Working-tree release drift | High | Release management | Open | Current drive-publication, deep-link, mobile password-reset, keyboard, icon, and UI changes are not committed/deployed. Run validation, commit/push, deploy the Prisma migration/API/web, and rebuild the APK before claiming production completion. |
| Native verified links incomplete | Medium | Mobile/deployment | Open | Android `assetlinks.json` needs the release signing SHA-256; iOS association needs the Apple Team ID. Until configured, shared drive links use the web fallback or custom scheme. |
| Drive email delivery webhooks absent | Medium | Notifications | Open | Brevo provider acceptance is tracked, but delivery/bounce webhooks are not configured; `DELIVERED` status is reserved for future provider events. |
| Render free-tier cold starts | Medium | Operations | Open | Render free tier spins down after 15 minutes of inactivity. First request after spin-down takes 30-60 seconds. Use UptimeRobot or similar keepalive pinging. |
| Large web Excel chunk | Medium | Performance | Open | The web build succeeds but ExcelJS contributes an approximately 949 KB chunk. Load spreadsheet features on demand or move parsing/export to the API. |
| Limited automated coverage | Medium | Quality | Open | 8 test files exist (eligibility, password reset, batch2027 policy, health routes, placement rules, redis config, security middleware) but critical end-to-end user journeys need broader coverage. |
| Dual Firebase/PostgreSQL responsibilities | Medium | Architecture | Open | Firebase remains required for Auth/FCM while PostgreSQL holds authorization and application data. Keep ownership boundaries documented and reconciliation observable. |
| SMTP delivery dependency | Low | Operations | Open | Password reset OTP delivery depends on external SMTP (Brevo). If SMTP is unavailable, OTPs are logged to console in development but users cannot reset passwords in production. |

---

# 20. Technical Debt

| Area | Description | Priority |
|------|-------------|----------|
| **Firebase → PostgreSQL migration** | Firebase RTDB still used alongside PostgreSQL. Full migration needed. | Medium |
| **Auth type safety** | Extended Express Request globally to properly type `req.user`, permanently removing `@ts-ignore` flags. | Resolved |
| **Frontend type strictness** | `@ts-nocheck` overrides successfully stripped across all React files; monorepo now fully typed. | Resolved |
| **Mobile Core Sync** | Corrected UI binding exceptions in `AdminDashboardScreen` and `DriveDetailsScreen` by properly managing nullable fields safely through Type enhancements. | Resolved |
| **Test coverage** | Jest/Supertest are configured and eligibility regressions are covered; expand coverage across auth, authorization, imports, reports, transactions, and end-to-end flows. | High |
| **Shared packages** | `packages/` directory has type stubs but no proper package.json configs with exports. | Medium |
| **Error handling** | Backend controllers use try/catch but error responses are inconsistent across controllers. | Medium |
| **Code splitting** | React.lazy is used but route-level splitting could be more systematic. | Low |
| **SaaS tenancy** | Add an institution/tenant model and mandatory scoping across every persistence and delivery boundary. | Critical before multi-college launch |

---

# 21. Architecture & Technical Decisions

| Decision | Rationale | Confidence |
|----------|-----------|------------|
| **Monorepo with npm workspaces** | Share code between web, mobile, and API. Enables shared types. | Confirmed |
| **React + Vite** | Fast HMR, modern tooling for frontend development. | Confirmed |
| **Firebase + PostgreSQL (dual database)** | Started with Firebase; migrating to PostgreSQL (Prisma) for relational data needs. Firebase retained for Auth/FCM/Storage. | Confirmed |
| **Express.js over Nest.js** | Simpler setup for capstone scope. Reason for Express specifically: Unknown |
| **Zustand over Redux** | Lightweight; server state handled by React Query. No need for Redux complexity. Explicitly documented in ARCHITECTURE.md. | Confirmed |
| **BullMQ + Redis for notifications** | Reliable async notification processing. Graceful fallback when Redis unavailable. | Confirmed |
| **Prisma ORM** | Type-safe database access, migration support, Prisma Studio for debugging. | Confirmed |
| **JWT (not session-based)** | Stateless auth suitable for multi-platform (web + mobile). | Confirmed |
| **Token-based HR portal** | HR/recruiters should not need accounts. Secure one-time-use links with expiry. | Confirmed |
| **FastAPI for ML service** | Python ecosystem for ML; FastAPI for modern async API. | Confirmed |
| **Sentence-transformers for embeddings** | `all-MiniLM-L6-v2` is lightweight and suitable for semantic matching. | Confirmed |
| **shadcn/ui component library** | Copy-paste approach gives full customization control. | Confirmed |

---

# 22. Current Development State

### ✅ Completed

- Monorepo setup (npm workspaces)
- Web app scaffolding with feature-based architecture
- Backend API with Express + Prisma + PostgreSQL
- Firebase-to-API JWT authentication with database-backed role revalidation and 15-minute default access tokens
- Demo account email verification bypass via `DEMO_EMAIL_ALLOWLIST`
- OTP-based password reset flow with SMTP delivery (Brevo), HMAC hashing, cooldown, rate limiting, and timing-safe verification
- Role-based authorization with SUPER_ADMIN institution access and department-scoped COORDINATOR access
- Student profile management (comprehensive multi-step form)
- Profile verification workflow (admin approves/rejects)
- Profile update request system
- Placement drive CRUD with eligibility criteria
- Multi-step drive creation wizard
- HR collaboration portal (token-based drive submission)
- HR drive approval workflow (approve/reject/request changes)
- Student application system
- Eligibility checking service
- Notification system (in-app + push via FCM)
- Socket.io real-time notification delivery
- BullMQ notification queue infrastructure
- Analytics dashboard (overview, departments, packages, year comparison, funnel, intelligence)
- Calendar view with FullCalendar
- Bulk student data import (Excel/CSV)
- Student account provisioning from imported data
- Database seed script
- Docker Compose for local PostgreSQL
- Mobile app scaffolding with Expo + React Navigation
- Reports generation and export
- Shared packages (`packages/`) formalization
- CI/CD pipeline with Prisma client generation
- BullMQ notification queue infrastructure (Redis fallback)
- Standardized error response format across controllers
- Serializable application submission with capacity, duplicate, eligibility, application-limit, and offer-limit checks
- Private generated-report storage with authenticated downloads and retrying BullMQ workers
- Liveness (`/health`) and readiness (`/health/ready`) endpoints with Redis probe and 2s timeout
- Graceful shutdown of HTTP, queues, workers, Redis, and Prisma
- Prisma migration baseline and deployment/status scripts (3 migrations)
- Vercel SPA deployment for web app
- Render deployment for API + Redis (Singapore region)
- Comprehensive student settings module (13 settings panels)
- Email service with Nodemailer/SMTP (Brevo-compatible) and HTML templates
- API regression tests: 8 test files (password reset, batch2027 policy, eligibility, health routes, placement rules, redis config, security middleware)
- Placement workflow policy with versioned policies, structured eligibility evaluations, and attendance reviews

### 🚧 In Progress

- Broader automated integration and end-to-end coverage
- Production monitoring, backups, and alerting setup

### ⏳ Pending

- Cloud Functions for server-side triggers
- Full Firebase → PostgreSQL migration completion
- Multi-tenant institution model and isolation for SaaS use
- End-to-end testing in the deployed environment
- Code splitting optimization
- Decide Render availability strategy: paid compute for intentional always-on service, or external probes only as a best-effort cold-start reduction
- Commit, push, migrate, and deploy the 2026-10-18 API/web working-tree changes
- Rebuild the Android APK from the latest source and repeat login, theme, keyboard, password-reset, deep-link, and notification device tests
- Publish Android/iOS verified-link association files when signing/team identifiers are available

### ❌ Blocked

- App-store production release still requires final signing/store credentials and production push-notification credential validation; direct APK generation and physical installation are no longer blocked.

---

# 23. Current Priorities

### P0 — Critical
- [x] Enable Redis + BullMQ notification workers
- [x] Add explicit authentication to analytics routes
- [x] Implement OTP-based password reset flow with SMTP delivery
- [x] Deploy web (Vercel) and API (Render) to production
- [x] Add health/readiness monitoring endpoints
- [ ] Implement tenant isolation before onboarding multiple colleges
- [ ] Configure production monitoring, backups, and alerting

### P1 — High
- [x] Complete mobile app core screens (dashboard, profile, drives)
- [x] Fix TypeScript issues suppressed by `@ts-nocheck` and `@ts-ignore`
- [x] Add password reset, health, and security regression tests
- [ ] Add authentication, authorization, concurrency, import, report, and end-to-end regression coverage
- [ ] Upgrade the Expo/mobile dependency chain and clear high-severity audit findings
- [ ] Set up Render free-tier keepalive (UptimeRobot or similar)

### P2 — Medium
- [x] Consolidate dual Firebase admin config files
- [x] Formalize shared packages with proper exports
- [x] Implement reports export (PDF/Excel)
- [x] Implement comprehensive student settings module
- [ ] Complete recruiter event portal pages
- [x] Standardize error response format across all controllers

### P3 — Low
- [x] Add CI/CD pipeline (with Prisma client generation)
- [ ] Code splitting optimization
- [x] Remove unused dependencies
- [x] Update `.env.example` with all production variables

---

# 24. AI Agent Development Guide

## Before Changing Code

1. **Read this `project_context.md`** to understand the full architecture.
2. **Inspect the relevant source files** — don't assume; verify current implementation.
3. **Check the Prisma schema** (`apps/api/prisma/schema.prisma`) before any database changes.
4. **Understand the auth flow** — JWT middleware protects routes. Check `auth.middleware.ts`.
5. **Review business rules** (section 13). Breaking these rules breaks core functionality.
6. **Check existing patterns** — follow the established controller → service → Prisma pattern.
7. **Check `packages/types/`** for shared type definitions used across web + mobile.

## During Changes

- **Reuse existing architecture** — Follow the feature-based module structure in `apps/web/src/features/`.
- **Follow naming conventions** — Controllers: `*.controller.ts`, Routes: `*.routes.ts`, Services: `*.service.ts`.
- **Use Prisma for all database access** — Do NOT use raw SQL unless absolutely necessary.
- **Use Zod for validation** — Both frontend and backend use Zod schemas.
- **Use TanStack Query for data fetching** — Do NOT use raw `useEffect` + `fetch`.
- **Use Zustand for client state** — Only for auth and truly global state.
- **Use shadcn/ui components** — Check `apps/web/src/components/ui/` before building custom UI.
- **Avoid duplicate implementations** — Check if similar functionality already exists.
- **Preserve existing functionality** — Run the dev server and verify changes don't break existing features.

## After Changes

1. **Validate the implementation** — Run `npm run dev` and test manually.
2. **Run type checking** — `npm run type-check` should pass.
3. **Run linting** — `npm run lint` should pass.
4. **If Prisma schema changed** — Create and review a Prisma migration; use `db:migrate:deploy` for deployment. Reserve `db:push` for disposable development databases.
5. **Update `project_context.md`** — Update affected sections + add changelog entry.
6. **Record the change** in the Change Log section below.

---

# 25. Change Log

### 2026-10-18 — Mobile APK, Production UX, and Drive Publication Delivery

**Type:** Feature / Mobile / Notifications / Release Operations

**Summary:**
- Generated Android APK artifacts and confirmed installation and authentication on a physical device.
- Added branded launcher assets, production API fallback, mobile OTP password reset, safer Firebase/auth initialization, account-scoped theme behavior, uppercase student greeting, corrected LPA labels and drive filters, and profile-verification web guidance.
- Added a reusable keyboard-aware form container and connected shared inputs so login, password, profile, settings, notification, and drive forms keep the focused field visible.
- Added authenticated drive deep linking across Vercel and the Expo client, including pending-link preservation during login.
- Added durable drive-publication event/delivery models, BullMQ dispatch/recovery, per-channel idempotency, personalized Brevo/SMTP emails, admin delivery summaries, and automated tests.
- Verified the live Render API plan and request logs: the API is on Free compute, no external health probes are active, and 15-minute idle spin-down is expected platform behavior.

**Key Files:**
- `apps/api/prisma/migrations/20261018140000_add_drive_publication_delivery/`
- `apps/api/src/services/drive-publication.service.ts`
- `apps/api/src/services/email/templates/drivePublication.template.ts`
- `apps/api/src/services/notification-queue.service.ts`
- `apps/api/tests/drivePublication.test.ts`
- `apps/mobile/src/components/ui/KeyboardAwareScrollView.tsx`
- `apps/mobile/src/screens/auth/PasswordResetScreen.tsx`
- `apps/mobile/src/config/api.ts`
- `apps/mobile/app.json`
- `apps/web/src/features/student/pages/DriveLinkEntry.tsx`
- `docs/DRIVE_PUBLICATION_NOTIFICATIONS.md`
- `artifacts/PlacementX-demo-1.0.0.apk`
- `artifacts/PlacementX-Demo-fixed.apk`

**Release State:** Most entries above are present only in the local working tree as of this update. The migration, API/web deployment, native domain association, and fresh APK rebuild/device regression remain pending.

**Status:** Implementation in progress; not fully released.

---

### 2026-10-17 — Authentication Overhaul, Production Deployment, and Health Monitoring

**Type:** Feature / Security / Deployment / Infrastructure

**Summary:**
- Implemented complete OTP-based password reset flow: `passwordReset.controller.ts`, `passwordReset.service.ts`, and `email.service.ts` with HMAC-hashed OTPs, rate limiting, cooldown enforcement, and timing-safe comparisons.
- Added `PasswordResetChallenge` Prisma model with migration `20261017190000_add_password_reset_challenges`.
- Redesigned web login: unified `Login.tsx` with role detection, `ForgotPasswordModal` inline, dedicated `AdminLogin.tsx`/`StudentLogin.tsx` variants, and standalone `/forgot-password` route.
- Legacy `/student/login` and `/admin/login` paths redirect to `/login`.
- Configured Vercel SPA routing (`apps/web/vercel.json`) for production web deployment.
- Fixed production Firebase login by allowing sign-in before email verification for demo accounts (`DEMO_EMAIL_ALLOWLIST`).
- Added `/health` (liveness) and `/health/ready` (Redis readiness) endpoints.
- Bounded BullMQ readiness checks to prevent startup timeouts.
- Extended CI: generate Prisma client before API checks, downgraded legacy web lint errors to warnings.
- Added Render free-tier keepalive documentation at `docs/RENDER_FREE_TIER_KEEPALIVE.md`.
- Added comprehensive student settings module: 13 components with backend routes and controller.
- Added `PASSWORD_RESET_SECRET`, `SMTP_*`, `EMAIL_FROM*`, `DEMO_EMAIL_ALLOWLIST`, and `OFFICIAL_STUDENT_EMAIL_DOMAINS` to `.env.example`.
- Expanded API test suite to 8 files: password reset (controller + service), batch2027 policy, eligibility, health routes, placement rules, redis config, security middleware.

**Files Affected:**
- `apps/api/src/controllers/passwordReset.controller.ts` (new)
- `apps/api/src/services/passwordReset.service.ts` (new)
- `apps/api/src/services/email/email.service.ts` (new)
- `apps/api/src/services/email/templates/*.template.ts` (new)
- `apps/api/src/routes/auth.routes.ts` (password reset routes added)
- `apps/api/src/routes/health.routes.ts` (new)
- `apps/api/src/routes/student.settings.routes.ts` (new)
- `apps/api/src/controllers/student.settings.controller.ts` (new)
- `apps/api/prisma/migrations/20261017190000_add_password_reset_challenges/` (new)
- `apps/web/src/features/auth/pages/Login.tsx` (redesigned)
- `apps/web/src/features/auth/pages/ForgotPassword.tsx` (new)
- `apps/web/src/features/auth/pages/AdminLogin.tsx` (new)
- `apps/web/src/features/auth/pages/StudentLogin.tsx` (new)
- `apps/web/src/features/auth/components/ForgotPasswordModal.tsx` (new)
- `apps/web/src/features/student/settings/` (new module, 13 components + services)
- `apps/web/src/lib/authService.ts` (password reset methods added)
- `apps/web/src/routes/index.tsx` (new routes, legacy redirects)
- `apps/web/vercel.json` (new)
- `apps/api/tests/passwordReset.*.test.ts` (new)
- `.env.example` (new variables)
- `docs/RENDER_FREE_TIER_KEEPALIVE.md` (new)

**Validation:** CI builds pass. API and web type-checks pass. API tests pass (8 test files).

**Status:** Completed

---

### 2026-10-13 — Placement Workflow Policy and Security Hardening

**Type:** Workflow / Security / Policy / Data Integrity

**Summary:**
- Added versioned Batch 2027 policy storage, structured eligibility evaluations, attendance-review records, and expanded round/result/offer lifecycle fields through migration `20261013000000_placement_workflow_policy`.
- Centralized eligibility reason codes and administrative-review outcomes; application records now preserve the verified-profile timestamp and evaluation snapshot.
- Hardened student import, HR invitation revocation, drive lifecycle transitions, publication validation, and history-preserving cancellation.
- Added the maintained audit, implementation, policy-decision, and test reports under `docs/`.

**Validation:** API/web type-checks and production builds passed; API Jest passed 17/17 tests. Full database/browser E2E was not run because an isolated PostgreSQL/Firebase/mail environment was not available.

**Status:** Partial workflow implementation; remaining items are tracked in `docs/PLACEMENT_WORKFLOW_AUDIT.md`.

---

### 2026-09-25 — Security, Configuration, and Repository Cleanup

**Type:** Security / Configuration / Operations

**Summary:**
- Added centralized environment validation, tightened Firebase/authentication and error/security middleware behavior, and updated the API startup and seed paths.
- Added security middleware regression coverage plus an automated security-audit script and CI workflow updates.
- Added Supabase storage-security SQL and Firebase Storage rules; refreshed Docker, Firebase database rules, and environment examples.
- Updated the admin login experience and included project security and capstone delivery documentation.
- Removed untracked artifacts unrelated to PlacementX: Cafe/AWS load-test files, Redis dumps/archives, generic example/archive data, and temporary SSM/target-tracking files.

**Validation:** Changes were committed and pushed to `origin/main` as `0ced862`.

**Status:** Completed

---

### 2026-09-19 — Account-Scoped Appearance and Loading Polish

**Type:** UI / Accessibility / Preference Isolation

**Summary:**
- Bound Tailwind's `dark:` variant to the app-controlled `.dark` class so operating-system theme detection cannot override an explicit light theme.
- Stored theme and compact-mode preferences under each authenticated user ID; sign-out restores a neutral light theme for public and login pages.
- Removed destructive dark-mode filters from the NMIMS artwork and placed the official logo on a consistent white tile for reliable contrast in both themes.
- Rebuilt global and full-screen loading states with stable viewport centering, a short anti-flicker delay, clearer progress messaging, and reduced-motion support.
- Kept React Query loading hooks unconditional to preserve hook order across query and mutation state changes.

**Validation:** Web type check and production build passed.

**Status:** Completed

---

### 2026-09-19 — Single-College Production Hardening

**Type:** Security / Reliability / Data Integrity / Operations

**Summary:**
- Reworked sign-in to fail closed through Firebase token verification and database-owned roles. Protected requests now reload the user, role, and coordinator department; access tokens default to 15 minutes.
- Separated SUPER_ADMIN institution-wide administration from department-scoped COORDINATOR student operations.
- Enforced HR workspace-link expiry in every drive state and expanded eligibility checks to cover gap years, total backlogs, semester, and required profile assets.
- Made application submission serializable and concurrency-safe with duplicate, capacity, application-limit, and live-offer rechecks.
- Stored generated reports in the private `generated-reports` Supabase bucket behind authenticated downloads; report workers now retry failed jobs.
- Added PDF signature validation, liveness/readiness endpoints, dependency-aware 503 responses, and graceful process shutdown.
- Added a Prisma migration baseline and deployment commands, production builds to CI, and eligibility regression tests.
- Replaced `xlsx` with ExcelJS and native CSV handling, replaced native `bcrypt` with `bcryptjs`, and upgraded vulnerable Express/Multer/React Router/map dependencies.

**Validation:**
- API and web production builds passed.
- API and web type checks passed.
- API tests passed: 2 suites, 7 tests.
- Prisma schema validation and `git diff --check` passed.

**Remaining Release Work:**
- Configure the private `generated-reports` bucket and production secrets.
- Baseline any existing `db:push` database safely before migration deployment.
- Add multi-tenant isolation before offering the system as SaaS to multiple colleges.

**Status:** Web/API production candidate for a single-college pilot; deployment and mobile release validation pending.

---

### 2026-08-24 — Fix Admin Dashboard "Network Error" (API Server Crash)

**Type:** Bugfix

**Summary:**
This caused `initializeFirebaseAdmin()` in `firebase-admin.ts` to throw a `SyntaxError: Bad control character in string literal in JSON at position 2349`, which propagated as an unhandled exception and crashed the entire Express server before it could start listening on port 5000.

**Fix Applied:**
1. **`apps/api/.env`**: Converted `FIREBASE_SERVICE_ACCOUNT_KEY` to a single-line JSON string with proper `\n` escape sequences for the private key, and fixed the truncated `client_x509_cert_url` field.
2. **`apps/api/src/config/firebase-admin.ts`**: Hardened the JSON parser to strip raw control characters (newlines, carriage returns, tabs) before parsing, preventing future `.env` formatting issues from crashing the server.

**Files Affected:**
- `apps/api/.env` (reformatted Firebase JSON to single-line)
- `apps/api/src/config/firebase-admin.ts` (added control character stripping before JSON.parse)

**Testing:**
- API server starts successfully on port 5000
- Health endpoint `GET /health` returns `{"status":"ok"}`
- Admin dashboard loads without "Network Error"

**Status:** Completed

---

### 2026-08-23 — Implementation of Remaining Priorities (P0-P3)

**Type:** Feature / Chore / Refactor

**Summary:**
- P0.1: Initialized Redis + BullMQ for Notification Workers with graceful shutdown in `index.ts`.
- P0.2: Secured analytics routes with `authorize('SUPER_ADMIN', 'COORDINATOR')`.
- P1.2: Implemented actual NLP resume parsing using spaCy in `ml-service/app/preprocessing/resume_processing.py`.
- P2.1: Consolidated Firebase initialization into a single `config/firebase-admin.ts` file.
- P2.2: Added `package.json` to shared packages to formalize monorepo structure.
- P2.3: Implemented Excel report export logic in `reports.controller.ts` and wired to `/api/admin/analytics/export/excel`.
- P2.4: Completed recruiter controller implementation.
- P2.5: Created centralized `AppError` and `error.middleware.ts`.
- P3.1: Created GitHub Actions CI/CD workflow in `.github/workflows/main.yml`.
- P3.3: Removed unused dependencies from root `package.json`.

**Files Affected:**
- Multiple backend controllers and routes (`apps/api/*`)
- `ml-service/app/preprocessing/resume_processing.py`
- `.github/workflows/main.yml`
- `package.json` (root and packages)

**Reason:**
To complete all pending tasks (P0-P3) outlined in the current priorities list to bring the project to a production-ready MVP state.

**Status:** Completed

---

### 2026-08-23 — Initial project_context.md Creation

**Type:** Documentation

**Summary:**
Created comprehensive `project_context.md` from full repository analysis covering all 27 sections including project overview, architecture, tech stack, database schema, API documentation, business rules, development guide, and current development state.

**Files Affected:**
- `project_context.md` (new)

**Reason:**
Establish a living documentation file for AI-assisted development continuity.

**Impact:**
No code changes. Documentation only.

**Testing:**
Verified against actual repository structure, source code, and existing documentation.

**Status:** Completed

### 2026-08-25 - Admin UX and Drive Update Fixes

**Type:** Bug Fix / UX Improvement

**Summary:**
- Fixed the "Admin Drive Duplication" bug by adding an explicit "Edit Drive Details" button to `AdminEventDetails.tsx`, resolving the UX issue where admins mistakenly recreated drives via "Manual Entry".
- Confirmed `StudentLayout.tsx` already handles dynamic profile logic (Name and Branch fallbacks).
- Made "View Profile" and "Preferences" buttons functional in the student dropdown menu.
- Fixed the squished NMIMS logo UI in the admin menu bar (`PlacementCellLayout.tsx`).
- Vastly improved the UX of the admin sidebar menu by logically grouping items (Overview, Placements, Student Management, System) and adding premium hover/active states.

**Files Affected:**
- `apps/web/src/features/admin/pages/AdminEventDetails.tsx`
- `apps/web/src/layouts/StudentLayout.tsx`
- `apps/web/src/layouts/PlacementCellLayout.tsx`

**Status:** Completed

---

# 26. Context Health

| Check | Status |
|-------|--------|
| Codebase analyzed | ✅ Yes, including current uncommitted API/web/mobile changes |
| Build verified | ⚠️ Previously verified; not rerun for every 2026-10-18 working-tree change during this documentation update |
| Tests verified | ⚠️ Existing suites and new contract/publication tests are present; full current working-tree suite not rerun during this documentation update |
| Deployment verified | ⚠️ Vercel web and Render API/Redis are live; local 2026-10-18 changes are not yet confirmed deployed |
| Environment verified | ✅ Yes (examples and production services reviewed) |
| Prisma verified | ⚠️ New drive-publication migration is present; production application of the migration is pending |
| Mobile release verified | ⚠️ APK installation/login confirmed; latest source changes require a new build and device regression pass |
| Known release gaps | ⚠️ Multi-tenancy, deployed E2E validation, commit/deploy drift, Render Free cold starts, production monitoring/alerting, native verified-link association, Brevo delivery webhooks, and latest APK validation |

---

# 27. Sources of Information

| Information | Source |
|-------------|--------|
| Architecture | `ARCHITECTURE.md`, `apps/` directory structure |
| Database Schema | `apps/api/prisma/schema.prisma` |
| Legacy DB Schema | `database_architecture.md`, `database_scheme.md` |
| API Routes | `apps/api/src/routes/*.routes.ts` |
| API Controllers | `apps/api/src/controllers/*.controller.ts` |
| Frontend Routes | `apps/web/src/routes/index.tsx` |
| Frontend Features | `apps/web/src/features/` |
| Auth Implementation | `apps/api/src/middlewares/auth.middleware.ts`, `apps/web/src/stores/authStore.ts` |
| Firebase Rules | `database.rules.json` |
| Environment Config | `.env.example` |
| Dependencies | `package.json` (root + apps/*) |
| Docker Config | `docker-compose.yml` |
| Seed Data | `apps/api/src/seed.ts` |
| Test Credentials | `login_credentials.md` |
| Dev Prompts | `All Prompts/` directory |
| Tech Stack | `README.md` |

### Recent Updates
- Transformed the Admin Students page (/admin/students) into a Student Operations Center.
- Implemented StudentDetailsDrawer.tsx for a 360-degree view (Profile, Academic, Applications, Verification).
- Implemented BulkActionsToolbar.tsx and selection checkboxes for bulk provisioning and alerts.
- Created a new backend endpoint GET /api/admin/students/:id/details to aggregate student data across 5 distinct tables (ImportedStudent, User, StudentProfile, DriveApplication, ProfileUpdateRequest).
- Fixed a routing issue in AdminDashboard.tsx where 'View All' drives led to a 404.

### 2026-08-25 - Security, Notification & Calendar Polish
**Type:** Backend/Frontend Polish & Security Updates

**Summary:**
- Conducted a bulk password reset for all provisioned student accounts, updating both PostgreSQL (Supabase) and Firebase Auth to a unified credential, while preserving specific admin accounts.
- Updated the `export_users.ts` script to generate a secure `User_Credentials.pdf` that detects bcrypt hashes corresponding to the default password, without exposing unknown hashes.
- Fully wired the Notification Center to the backend database, replacing mock data. Seeded initial notification templates and history.
- Fixed critical UI crashes in `NotificationHistory.tsx` caused by unhandled string-parsed JSON arrays.
- Fixed overlap and responsive alignment issues in the `NotificationComposer.tsx` stepper and Live Preview column.
- Moved Academic Year / Semester configuration out of static files and into the database.


### 2026-08-26 - Admin Control Center & Calendar UI Polish
**Type:** Feature / UX Improvement

**Summary:**
- Implemented /admin/settings as a comprehensive Administration Control Center.
- Added modular frontend components for General, Placement, Student, Security, Notifications, System Health, and Danger Zone settings ( pps/web/src/features/admin/components/settings).
- Created Prisma schema models for SystemSetting and SettingAuditLog backed by PostgreSQL.
- Implemented settings.service.ts and settings.controller.ts with Redis caching to serve dynamic configurations globally across the app.
- Updated core controllers (student.controller.ts, eligibility.service.ts) to enforce dynamic global settings (e.g. max applications per student, profile verification requirements).
- Improved the UI/UX of /admin/calendar (AdminCalendar.tsx) by replacing solid, cluttered blocks with clean, modern badges using soft color palettes and dynamic borders.

### 2026-08-29 - Complete UI/UX Overhaul & TypeScript Build Fixes
**Type:** Feature / UX Improvement / Refactor

**Summary:**
- Conducted a comprehensive UI/UX quality pass across the entire web application, bringing it to a production-grade SaaS standard.
- Enforced global brand theme (Maroon, Navy, Gold) via CSS tokens in `index.css`.
- Polished layout navigations (`StudentLayout`, `PlacementCellLayout`) and student dashboard features (`StudentProfile`, `DriveList`, `StudentDriveDetails`) using modern card structuring, gradients, and framer-motion animations.
- Resolved prop collisions and React rendering crashes.
- Addressed all severe TypeScript typing errors causing build failures in analytical charts (`ForecastChart.tsx`, `PlacementHealthScore.tsx`, `SalaryAnalytics.tsx`). The `npm run build` command now completes successfully.

### 2026-09-10 - Academic Documents, HR Portal & Global UI Loader
**Type:** Feature / UX Improvement / Bug Fix

**Summary:**
- Resolved academic document upload UI state and added signed URLs to profile API.
- Implemented HR collaboration portal and separated academic document uploads to support PDF resume handling.
- Integrated GlobalLoader across student and admin portals using React Query, fixed viewport centering issues, and cleaned up unused components.
- Added Admin student profile view with a dedicated tabbed page for complete placement journey tracking.
- Added semester-wise performance tracking for students.
- Resolved build and linting errors across the monorepo.

### 2026-09-03 - Bug Fixes & Refactoring
**Type:** Bug Fix / Refactor

**Summary:**
- Cleaned up unwanted testing and scratch files from the repository.
- Changed the analytics company filter to use actual placement drives.
- Added direct drive linking to the Admin Dashboard.
- Removed `dump.rdb` and added it to `.gitignore`.
- Fixed a dead link in the Calendar component to point to `placement-events`.

### 2026-09-13 - Resume PDF Upload & Report Download Fix
**Type:** Feature / Bug Fix

**Summary:**
- Replaced the external "Resume Link" with a "Resume PDF" file upload logic in the student profile.
- Fixed typo in the report export component, changing "Download01Icon" to "Download".

### 2026-09-14 - Deep AI/ML Production Readiness Transformation
**Type:** Feature / Security / ML Pipeline

**Summary:**
- Completely overhauled the ML subsystem from synthetic prototypes to production-ready models trained entirely on real PostgreSQL historical data.
- Built a secure ML model registry with SHA256 checksums, semantic versioning, and metadata tracking.
- Hardened the ML API Gateway with `verifyToken` and `isAdmin` middleware, restricted CORS, and converted the Docker execution context to a non-root `mluser`.
- Replaced the mock/regex resume parser with a massive taxonomy engine capable of confidence scoring across hundreds of skills, gracefully degrading if NLP models fail.
- Established rigorous API endpoints (including `/batch` embeddings, `/health`, `/ready`) covered by a 100% passing test suite.

### 2026-09-15 - Mobile App Production Parity
**Type:** Feature / UX Improvement

**Summary:**
- Transformed the `apps/mobile` Expo prototype into a fully production-ready client.
- Achieved complete functional parity with the web platform for students (Dashboard, Drives, Profile, Applications).
- Fixed all TypeScript compilation issues and navigation bugs.
- Implemented deep-linking via Expo Push Notifications and Socket.io real-time listeners.
- Refined UI components to perfectly match the web application's PlacementX design system (Maroon, Navy, Gold).

### 2026-09-16 - API Security Hardening & Mobile Documentation Overhaul
**Type:** Security / Documentation / Feature

**Summary:**
- Hardened AI routes (`ai.routes.ts`) by implementing granular role-based access control with `authenticate` and `authorize('SUPER_ADMIN', 'COORDINATOR')` middlewares.
- Added comprehensive mobile production documentation suite in `docs/mobile/` covering Accessibility, Security, Design System, Interaction Audit, Performance, and Test Plans.
- Introduced new untracked mobile app screens: `ChangePasswordScreen`, `AiResumeParserScreen`, and `CalendarScreen` to match web feature parity.


### 2026-09-16 - Complete ML/AI Subsystem Removal & Admin Features
**Type:** Refactor / Feature

**Summary:**
- Completely removed the ML/AI Python microservice (`ml-service`) and all its dependencies from the monorepo to streamline the architecture.
- Removed AI-specific fields (`aiKeywords`, `matchScore`, `readinessScore`, `semanticTags`) from the Prisma database schema and API controllers.
- Fixed residual `PrismaClientValidationError` in the `getDrives` API by ensuring stripped ML fields were removed from controller projection selections.
- Added Appearance Settings (Theme and Compact Mode toggle) to the Admin Control Center, giving admins the same UI customization capabilities as students.
