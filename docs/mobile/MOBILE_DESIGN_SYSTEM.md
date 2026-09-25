# PlacementX Mobile Design System

PlacementX uses an institutional editorial direction: NMIMS maroon and navy establish identity, restrained gold marks high-value actions, and warm neutral surfaces keep dense placement information calm and readable. The system avoids decorative gradients and heavy shadows.

## Source of truth

- Tokens: `apps/mobile/src/theme/theme.ts`
- Runtime theme and persistence: `apps/mobile/src/theme/ThemeProvider.tsx`
- Responsive classification: `apps/mobile/src/hooks/useResponsiveLayout.ts`
- Components: `apps/mobile/src/components/ui/`

## Color tokens

Both light and dark palettes expose `background`, `surface`, `surfaceSecondary`, `foreground`, `foregroundMuted`, `primary`, `primaryForeground`, `secondary`, `secondaryForeground`, `success`, `warning`, `destructive`, `info`, `border`, `divider`, `focus`, and `overlay`. Status must always pair color with text or an icon.

Brand anchors are maroon `#7A1027`, navy `#17324D`, gold `#C9972B`, and teal `#147D74`. Screens must use semantic tokens instead of embedding hex values.

## Typography

The scale contains Display, H1-H3, Body Large, Body, Body Small, Label, Caption, and Button. Display/H1 use the platform serif face for an academic editorial character; functional copy uses the native sans-serif face for clarity. Dynamic font scaling remains enabled.

## Spacing, radius, and elevation

- Spacing follows a 4px base: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Radius: none, 6, 10, 14, 18, 24, full.
- Elevation: none, subtle, raised, overlay. Shadows are support cues, not decoration.
- Minimum interactive target: 44x44px.

## Motion

Motion durations are instant, fast (140ms), standard (220ms), and deliberate (320ms). Motion communicates navigation, loading, or state change. Repeating and decorative animation must stop or simplify when reduced motion is enabled.

## Responsive rules

- Compact: below 360px. Reduce peripheral spacing, never text size below the token scale.
- Phone: 360-767px. One-column content.
- Tablet: 768-1023px. Two-column content or split views where the workflow benefits.
- Wide tablet/desktop web: 1024px+. Up to three columns with a centered 1120px maximum width.
- Use `useWindowDimensions`; never branch on device model names.

## Component rules

- Use shared Button, IconButton, Input, SearchBar, Card, StatusBadge, ScreenContainer, PageHeader, EmptyState, ErrorState, LoadingState, ConfirmationDialog, and domain cards.
- Every async surface needs initial/loading/loaded/empty/error handling and a real recovery action.
- Inputs require visible labels, accessibility labels, inline validation, and keyboard intent.
- Destructive actions require confirmation.
- Icon-only controls require an accessibility label and hint.

## Theme modes

Light, dark, and system modes are persisted through AsyncStorage. `ThemeProvider` resolves system changes at runtime. The Expo app configuration must keep `userInterfaceStyle` set to `automatic` so the native shell matches the React theme.
