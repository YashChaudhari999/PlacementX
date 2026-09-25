# PlacementX Mobile Change Log

## 2026-09-25 — UI/UX redesign and production hardening

- Replaced the legacy visual layer with a semantic institutional light/dark theme, persisted system appearance, responsive containers, reduced-motion support, and reusable loading/error/empty/dialog foundations.
- Redesigned and normalized all 22 student, authentication, shared, coordinator, and super-admin screen surfaces without changing placement eligibility or authorization rules.
- Unified Firebase sign-in, restored-session handling, password reset/change, server-derived role routing, and coordinator-safe navigation.
- Corrected mobile contracts for calendar events, documents, verified-profile update requests, and admin KPI reports.
- Completed drive search, work-mode filtering, sorting, eligibility-gated application, notification preferences, document links, interview routes, settings, and live admin drive details.
- Added the `placementx://` deep-link scheme, distinct demo app identifiers, a preview APK profile, explicit standalone API configuration, and verified notification assets.
- Added 17 source/contract regression tests and documented the screen inventory, design system, navigation, accessibility, responsive behavior, performance, test matrix, and release gate.

## Verification

- TypeScript/lint: pass
- Contract tests: 17/17 pass
- Expo public configuration: pass
- Expo Doctor: 18/18 checks passed
- Android Hermes export: pass (3,782 modules; 7.21 MB bundle)
- Installable APK/device QA: blocked by unauthenticated EAS and incomplete local NDK `27.1.12297006`; not claimed complete
