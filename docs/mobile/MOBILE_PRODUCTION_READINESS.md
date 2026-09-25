# Mobile Production Readiness Checklist

Verified on 2026-09-25. Checkmarks mean evidence was produced in this workspace; unchecked items are not claimed complete.

## Code and configuration

- [x] 22 screen files and all registered routes inventoried
- [x] unified login with server-derived role
- [x] auth hydration gate and forced-password route
- [x] student and administrative navigation mapped
- [x] coordinator drawer restricted to permitted mobile surfaces
- [x] calendar, password, documents, profile-status, and reports contracts corrected
- [x] formerly orphaned screens routed
- [x] placeholder admin drive detail replaced
- [x] working password reset, appearance, support, preferences, and logout actions
- [x] semantic light/dark theme foundation
- [x] shared loading, error, empty, dialog, header, screen, and surface primitives
- [x] baseline accessibility labels/states and 44 dp shared controls
- [x] responsive width hook and centered maximum-width container
- [x] Expo config resolves with distinct demo application ID
- [x] EAS preview profile specifies Android APK
- [x] no Google service credential was fabricated or committed

## Automated evidence

- [x] `npm --workspace mobile run type-check`
- [x] `npm audit --json` — zero known vulnerabilities
- [x] `npx expo-doctor` — 18/18 checks passed
- [x] `npm --workspace mobile test` — 17/17 contract tests
- [x] `npm --workspace mobile run export:android` — Hermes Android export, 3,782 modules, 7.21 MB bundle
- [ ] automated device UI/E2E suite
- [ ] physical Android install/smoke test
- [ ] VoiceOver/TalkBack validation
- [ ] rotation/tablet/text-scale matrix
- [ ] live push notification delivery (requires environment-specific Google services configuration)

## APK status

An installable APK was not produced in this environment. EAS CLI is installed but not authenticated. The local Android build reached Gradle configuration, then stopped because the installed NDK at `27.1.12297006` is incomplete (`source.properties` is missing) and the SDK has no `sdkmanager` executable. Temporary generated `android/` and `dist/` directories were removed after diagnosis.

To finish after toolchain repair:

```powershell
cd apps/mobile
npm run build:apk
```

Or install Android command-line tools plus NDK `27.1.12297006`, run `npx expo prebuild --platform android`, and build `android/gradlew.bat assembleDebug`.

## Decision

The mobile source is a validated demo/release candidate, not a production-certified store release. Distribution remains blocked by signing/toolchain credentials and physical-device QA.
