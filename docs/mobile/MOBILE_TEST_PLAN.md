# Mobile Test Plan

## Overview
This document outlines the testing strategy used to validate the PlacementX mobile application before declaring it production-ready.

## 1. Type Safety & Linting
- **TypeScript:** Strict compilation via `tsc --noEmit` validates all prop types, API payload structures, and navigation parameters.
- **ESLint:** Enforces code quality, preventing unused variables and missing React hook dependencies.

## 2. Critical End-to-End (E2E) Flows Tested
The following flows were verified via manual QA walkthroughs:
1. **Auth Flow:** Login -> JWT assigned -> Redirected to Dashboard -> Logout -> JWT cleared -> Redirected to Login.
2. **Drive Application Flow:** View Drive List -> Open Drive Details -> Tap Apply -> Confirm -> Success Toast -> Application Status updates to "APPLIED".
3. **Profile Edit Flow:** Navigate to Profile -> Modify fields (e.g., skills, GitHub URL) -> Save -> Validate changes persist across app restart.
4. **Notification Flow:** Background App -> Receive Push Notification -> Tap -> Deep links directly into the respective Drive/Application screen.

## 3. UI/UX States Validated
For all screens connected to the API, the following states were verified:
- **Loading State:** Skeleton loaders or activity indicators render while React Query `isLoading` is true.
- **Empty State:** Friendly fallback text renders if an array returns `0` length (e.g., no applications).
- **Error State:** Fallback text/toasts render if the API returns a 500 or network timeout.

## 4. Future Automation
- Consider integrating Detox or Maestro for automated UI testing of the critical E2E flows on real device farms during the final CI/CD pipeline integration.
