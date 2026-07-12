You are a Principal Software Architect at Microsoft with expertise in React, React Native, Firebase, TypeScript, Monorepo Architecture, and Enterprise SaaS systems.

Your task is NOT to build features.

Your task is ONLY to design the complete production-ready folder structure for the PlacementX project.

=========================================================
PROJECT
=========================================================

Project Name:
PlacementX

Institution:
NMIMS University

Frontend:
1. React 19 + Vite + TypeScript (Web)
2. React Native + Expo + TypeScript (Android)

Backend:
Firebase

Authentication
Realtime Database
Storage
Cloud Functions (Future)

The React Web and React Native applications must share the SAME backend.

There must NEVER be duplicate business logic.

The architecture should support future AI microservices without refactoring.

=========================================================
ARCHITECTURE REQUIREMENTS
=========================================================

Follow Monorepo Architecture.

Create three applications.

apps/
    web/
    mobile/
    backend/

Also create shared packages.

packages/
    ui/
    types/
    utils/
    constants/
    firebase/
    validation/
    hooks/
    config/
    assets/

Everything reusable should live inside packages.

Web and Mobile must import from packages instead of duplicating code.

=========================================================
ROOT STRUCTURE
=========================================================

PlacementX/

apps/
packages/
docs/
scripts/
.github/

README.md

=========================================================
WEB APPLICATION STRUCTURE
=========================================================

apps/web/src/

app/
components/
features/
layouts/
pages/
routes/
services/
contexts/
hooks/
store/
assets/
styles/
lib/

=========================================================
MOBILE APPLICATION STRUCTURE
=========================================================

apps/mobile/src/

app/
screens/
navigation/
components/
features/
services/
contexts/
hooks/
store/
assets/
styles/

=========================================================
BACKEND STRUCTURE
=========================================================

apps/backend/

firebase/
database/
storage/
functions/
security-rules/
indexes/

=========================================================
FEATURE-BASED MODULES
=========================================================

Each application should contain feature folders.

features/

student/

components/
pages/
services/
hooks/
types/
constants/

placement/

components/
pages/
services/
hooks/

applications/

notifications/

companies/

settings/

recruiter/

dashboard/

reports/

=========================================================
SHARED UI LIBRARY
=========================================================

packages/ui/

buttons/
cards/
tables/
forms/
dialogs/
badges/
navigation/
feedback/
layout/
icons/

Every UI component must be reusable by the Web application.

Design components so they can later be adapted for React Native.

=========================================================
SHARED FIREBASE
=========================================================

packages/firebase/

config.ts

auth/

database/

storage/

notifications/

queries/

Both Web and Mobile must use the same Firebase package.

=========================================================
SHARED TYPES
=========================================================

packages/types/

student.ts
placement.ts
application.ts
notification.ts
company.ts
user.ts
api.ts
firebase.ts

=========================================================
SHARED VALIDATION
=========================================================

packages/validation/

student.schema.ts
placement.schema.ts
company.schema.ts
application.schema.ts
login.schema.ts

Use Zod.

=========================================================
SHARED UTILITIES
=========================================================

packages/utils/

date/
file/
string/
auth/
format/
permissions/
storage/

=========================================================
STATE MANAGEMENT
=========================================================

Use TanStack Query for server state.

Use Zustand for client state.

Do not use Redux.

=========================================================
DESIGN SYSTEM
=========================================================

packages/config/theme/

colors.ts
typography.ts
spacing.ts
radius.ts
shadows.ts
animations.ts

Use semantic design tokens only.

=========================================================
DOCUMENTATION
=========================================================

docs/

architecture/
database/
routing/
coding-standards/
deployment/
api/
firebase/
contributing/

=========================================================
NAMING CONVENTIONS
=========================================================

Generate standards for

Folders

Files

Components

Hooks

Contexts

Firebase Services

Database Nodes

Type Definitions

=========================================================
OUTPUT
=========================================================

Generate ONLY:

1. Complete folder tree.
2. Explain the responsibility of every folder.
3. Show how Web, Mobile, and Backend communicate.
4. Show import paths for shared packages.
5. Explain dependency rules.
6. Recommend package versions.
7. Keep the project lightweight.
8. Avoid duplicate code.
9. Follow enterprise-level best practices.
10. Ensure the architecture is ready for future AI modules.
