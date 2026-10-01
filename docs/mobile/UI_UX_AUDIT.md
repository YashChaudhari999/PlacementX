# PlacementX Mobile UI/UX Audit

**Audited:** 2026-10-01  
**Scope:** `apps/mobile` student, administrator, shared UI, navigation, notification lifecycle, services, hooks, state, and theme.

## Product direction

PlacementX uses a restrained institutional design: NMIMS maroon, navy, gold, warm neutral surfaces, readable editorial headings, compact operational data, and minimal elevation. The mobile experience prioritizes placement decisions over decorative analytics.

## Screen inventory

### Authentication

- Login
- Required password change

### Student

- Dashboard
- Drives discovery
- Applications tracking
- Drive details and eligibility
- Calendar
- Notifications
- Profile and verified-profile update requests
- Documents
- Interviews
- Notification preferences
- Settings

### Administration

- Dashboard
- Placement drives, creation, and event details
- Students
- Calendar
- Reports
- Notifications and broadcast
- Settings

Coordinator access remains department-scoped through the existing role-derived navigation and backend authorization. The coordinator-management mobile page remains intentionally removed per current product direction.

## Findings and implemented changes

- Reused the established semantic theme, responsive layout, reduced-motion hook, TanStack Query hooks, services, Zustand auth/notification stores, and shared state components.
- Unified legacy `ScreenHeader` rendering through the accessible `PageHeader` foundation.
- Separated Drives and Applications into distinct primary tabs while retaining Notifications as a reachable routed screen for dashboard and push/deep-link entry.
- Added real profile-status context to the student dashboard using authenticated profile state.
- Replaced the permanently visible notification dot with the real unread count.
- Removed the Expo Go mock push token; unsupported runtimes now fail safely without registering fake production data.
- Persisted successfully registered push tokens so logout can unregister the device.
- Prevented duplicate unread increments when Socket.IO is already connected.
- Made notification fallback navigation role-aware instead of relying on navigation exceptions.
- Fixed calendar dark-mode surface usage and labeled month controls.
- Preserved real API-backed loading, empty, error, refresh, mutation, and eligibility behavior.

## Accessibility

Shared buttons, inputs, headers, state panels, dialogs, dashboard icon actions, profile status action, and calendar month controls expose roles, labels, state, and minimum touch targets. Status continues to include text rather than relying only on color.

## Performance

Long notification, drive, application, interview, document, and calendar datasets use virtualized lists. Dashboard rendering remains intentionally bounded. Existing React Query caching and Socket.IO invalidation are retained; foreground push no longer duplicates connected socket updates.

## Security

Firebase-to-API authentication, SecureStore persistence, server-derived roles, protected routing, and backend authorization remain unchanged. No client role selection, fake push registration, token logging, or backend bypass was introduced.

## Known limitations

- Physical-device Android/iOS QA, real push credentials, notification permission behavior, and background/cold-start delivery require device validation.
- EAS APK generation requires authenticated external build infrastructure; local Android builds still depend on a complete SDK/NDK installation.
- Upload replacement/progress UI can only expose capabilities present in the current mobile API contract; document listing/opening is fully connected, while new academic upload workflows remain primarily available in the web product.
- Offline detection is handled through request error/retry states; a dedicated connectivity package was not added.

## Validation

- `npm run type-check` — passed
- `npm run lint` — passed
- `npm test` — 20/20 passed
- `npx expo-doctor` — 18/18 passed
- `npm run export:android` — passed; Android Hermes bundle exported from 3,781 modules (7.2 MB)