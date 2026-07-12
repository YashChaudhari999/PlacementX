# PlacementX

**Intelligent Campus Placement Automation and Decision Support Platform**

> NMIMS University — Capstone Project

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 · TypeScript · Vite |
| **Styling** | Tailwind CSS v4 · shadcn/ui |
| **Backend** | Firebase (Auth · Realtime Database · Storage) |
| **Forms** | React Hook Form · Zod |
| **Data Fetching** | TanStack React Query |
| **Routing** | React Router DOM v7 |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **Date Utilities** | date-fns |
| **Mobile (Future)** | React Native (shared models & services) |

---

## 📋 Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x
- A **Firebase project** with Realtime Database, Authentication, and Storage enabled

---

## ⚡ Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd PlacementX
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Firebase project credentials:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```
PlacementX/
├── public/                     # Static public assets
├── src/
│   ├── app/                    # App-level setup (providers, router)
│   ├── assets/                 # Static assets (images, fonts)
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   ├── config/
│   │   └── firebase.ts         # Firebase initialization
│   ├── features/               # Feature-based modules
│   ├── hooks/                  # Shared custom React hooks
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn, etc.)
│   ├── providers/              # React context providers
│   ├── schemas/                # Zod validation schemas
│   ├── services/
│   │   └── firebase/           # Firebase service abstractions
│   ├── shared/
│   │   ├── models/             # Data models (cross-platform)
│   │   └── types/              # TypeScript type definitions
│   ├── styles/                 # Additional global styles
│   ├── App.tsx                 # Root component
│   ├── index.css               # Tailwind CSS v4 entry
│   └── main.tsx                # Application entry point
├── .editorconfig               # Editor formatting rules
├── .env.example                # Environment variable template
├── .eslintrc.js                # ESLint configuration
├── .gitignore                  # Git ignore rules
├── .prettierrc                 # Prettier configuration
├── index.html                  # HTML entry point
├── tsconfig.json               # TypeScript project references
├── tsconfig.app.json           # TypeScript app configuration
├── vite.config.ts              # Vite build configuration
└── package.json                # Dependencies and scripts
```

---

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on source files |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checker |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
│                                                          │
│   ┌──────────────┐              ┌──────────────────┐    │
│   │  React Web   │              │  React Native    │    │
│   │  (Vite)      │              │  (Future)        │    │
│   └──────┬───────┘              └────────┬─────────┘    │
│          │                               │              │
│          └───────────┬───────────────────┘              │
│                      │                                   │
│            ┌─────────▼─────────┐                        │
│            │  Shared Layer     │                        │
│            │  models / types   │                        │
│            │  services         │                        │
│            └─────────┬─────────┘                        │
└──────────────────────┼──────────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │      Firebase           │
          │                         │
          │  ┌─────────────────┐   │
          │  │ Authentication  │   │
          │  ├─────────────────┤   │
          │  │ Realtime DB     │   │
          │  ├─────────────────┤   │
          │  │ Cloud Storage   │   │
          │  └─────────────────┘   │
          │                         │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │   Future Services       │
          │                         │
          │  • AI Microservices     │
          │  • REST APIs            │
          │  • Analytics            │
          │  • Notifications        │
          └─────────────────────────┘
```

---

## 📐 Code Quality

- **TypeScript** — Strict mode enabled with no unused variables/parameters
- **ESLint** — Enforces consistent code patterns and catches errors
- **Prettier** — Automatic code formatting
- **EditorConfig** — Consistent editor settings across IDEs
- **Path Aliases** — `@/*` maps to `src/*` for clean imports

---

## 📝 Contributing

1. Create a feature branch from `main`
2. Follow the existing folder structure and naming conventions
3. Ensure `npm run lint` and `npm run type-check` pass before committing
4. Write meaningful commit messages

---

## 📄 License

This project is part of the NMIMS University Capstone Program.
