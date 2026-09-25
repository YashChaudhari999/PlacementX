# Mobile Responsive Layout Guide

## Breakpoints

`useResponsiveLayout` derives layout from `useWindowDimensions` rather than a module-level `Dimensions.get` snapshot:

- compact: below 600 dp
- tablet: 600–899 dp
- wide/tablet landscape: 900 dp and above
- content maximum: 1,120 dp
- recommended grid: one, two, or three columns by available width

## Rules

- Use `ScreenContainer` for centered maximum-width content and safe areas.
- Keep primary actions at least 44×44 dp.
- Let long labels wrap; reserve `numberOfLines` for genuinely bounded metadata.
- Use `FlatList` for unbounded collections and `ScrollView` for short forms/details.
- Use `KeyboardAvoidingView` through `ScreenContainer keyboardAware` or explicitly for forms.
- Do not cache screen width at module load for new work; respond to rotation/fold/tablet resizing.
- Prefer two-column fact grids only when each column remains at least 280 dp.

## QA matrix still required on release candidates

- Android small phone (~360×640 dp)
- modern Android phone (~412×915 dp)
- Android tablet portrait and landscape
- iPhone compact and large sizes
- iPad portrait, landscape, and split view
- text scaling at 100%, 130%, and 200%
