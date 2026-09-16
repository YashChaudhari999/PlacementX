# Mobile Navigation Architecture

The mobile application utilizes React Navigation v7 (`@react-navigation/native`) for robust screen management.

## Navigation Structure
The routing hierarchy is cleanly separated by authentication state using a Root Navigator.

### 1. Root Navigator
- **Auth Stack:** Accessible only if no valid token exists.
  - `LoginScreen`
- **App Stack:** Accessible only when the user is fully authenticated.
  - `StudentDrawer` (or `BottomTabs`)

### 2. Main App Flow (Tabs/Drawer)
- **Dashboard:** `student/dashboard`
- **Drives:** `student/drives` -> `student/drives/:id` (Details)
- **Applications:** `student/applications`
- **Calendar:** `student/calendar`
- **Profile:** `student/profile`
- **Settings:** `student/settings`

## Deep Linking
Deep linking is enabled through Expo's linking configuration. Push notifications (via FCM and Expo Notifications) pass routing payloads that the `usePushNotifications` hook intercepts.
- E.g., Tap notification -> Parsed Payload -> `navigation.navigate('DriveDetails', { id: 123 })`

## Route Guards & State
Zustand (`authStore.ts`) serves as the source of truth for the authentication state. If the token expires (handled via Axios interceptor), Zustand clears the token, and the Root Navigator instantly switches back to the Auth Stack, ensuring unauthorized access is impossible without forcing a manual refresh.
