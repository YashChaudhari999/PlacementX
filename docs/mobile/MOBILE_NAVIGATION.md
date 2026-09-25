# Mobile Navigation Architecture

Verified against `apps/mobile/src/navigation` on 2026-09-25.

## Root flow

`AppNavigator` waits for persisted auth hydration before selecting exactly one flow:

- unauthenticated → `Auth/Login`
- authenticated with mandatory password change → `FirstLoginPassword`
- `STUDENT` → `StudentApp`
- `COORDINATOR` or `SUPER_ADMIN` → `AdminApp`

The server-derived role is authoritative; login no longer accepts a client-selected role.

## Student flow

Bottom tabs:

- Home stack: dashboard, drive details
- Drives: browse drives and applications
- Calendar
- Notifications
- Profile stack: profile, documents, interviews, settings, notification preferences

The profile screen provides explicit links to all profile-stack destinations.

## Administrative flow

Super administrators receive dashboard, drives, students, calendar, reports, coordinators, notifications, and settings. Coordinators receive only students and their own settings/security screen. Super-admin routes are not registered in a coordinator drawer.

## Deep links

Supported prefixes are the Expo development URL and `placementx://`. Paths include login, password change, student dashboard/drives/calendar/notifications/profile/documents/interviews/settings, and the matching administrative destinations. Notification payload routing is normalized in `deepLink.service.ts`.

## Session failure

The API interceptor clears invalid sessions. The persisted auth store exposes `hasHydrated`, preventing a login-screen flash while secure state is restored.
