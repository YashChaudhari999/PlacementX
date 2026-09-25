# Mobile Test Plan

## Automated checks

Run from the repository root:

```powershell
npm --workspace mobile run type-check
npm --workspace mobile test
npm --workspace mobile run export:android
```

The contract suite contains 17 checks across these critical areas:

1. Firebase login token exchange and student routing
2. drive browse → details → eligibility-gated apply
3. verified profile → approval-request mutation
4. settings → notification preferences navigation
5. coordinator versus super-admin route registration
6. distinct demo identity and APK build profile
7. invalid-auth, session restoration/expiration, password change, and confirmed logout
8. complete route/deep-link contract
9. dashboard loading/error/empty/retry states
10. drive search/filter/sort and recovery states
11. application, interview, profile, document, notification, and settings state contracts
12. responsive breakpoint/safe-area/touch-target foundations

These are fast source/contract regressions, not device E2E tests.

## Required manual release matrix

- login, forced password change, reset email, logout/session restore
- dashboard refresh and backend outage retry
- browse/search drive, details, eligible/ineligible apply, duplicate apply response
- incomplete profile edit, pending verification lock, verified update request
- academic documents and offer links
- interviews/calendar time-zone presentation
- notification list/preferences and foreground/background/deep-link behavior
- super-admin and coordinator drawer permissions
- light/dark/system theme after restart
- offline, slow network, expired token, and server 4xx/5xx
- rotation, tablet, keyboard, text scale, VoiceOver/TalkBack

Record device model, OS version, API environment, build hash, result, and evidence. A signed cloud/store build additionally requires EAS authentication and release credentials.
