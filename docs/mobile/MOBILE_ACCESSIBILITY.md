# Mobile Accessibility Audit

## Implemented baseline

- Shared `Button`, `IconButton`, search clear, password visibility, tabs, document actions, menu buttons, appearance choices, and logout controls expose roles/labels/states.
- Shared controls meet a 44 dp minimum target.
- Errors use alert semantics; loading uses progress semantics; page titles use header semantics.
- Semantic light/dark palettes preserve strong text/surface separation and visible focus/status colors.
- Inputs expose labels, invalid state, and live error text.
- Reduced-motion preference is available through `useReducedMotion` for animated components.

## Evidence and limits

The source has been inspected and TypeScript/bundle checks pass. VoiceOver, TalkBack, switch control, dynamic-type clipping, and contrast measurement have not been executed on physical devices in this environment. Accessibility is improved, not certified. Release QA must complete those checks and file screen-specific defects.
