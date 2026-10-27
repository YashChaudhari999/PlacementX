# Placement drive publication notifications

When a drive first transitions to `PUBLISHED`, the API creates a unique `DrivePublicationEvent` in the same database transaction. The event is submitted to the existing BullMQ notification worker. Pending and interrupted events are recovered periodically, while per-recipient/channel delivery rows make retries idempotent.

For each currently eligible, active, verified student, the worker:

- creates an in-app notification with a `DriveDetails` destination;
- queues the existing push-notification flow when push is enabled;
- sends a personalized HTML and plain-text email through Brevo or the configured SMTP transport;
- records channel status, attempts, provider message ID, timestamps, and a sanitized failure reason.

The provider's successful API response is recorded as `ACCEPTED`, not as inbox delivery. Bounce/delivery webhooks are not configured yet, so `DELIVERED` is reserved for a future provider webhook integration.

## Required production configuration

- `FRONTEND_URL=https://placementx-v1.vercel.app` (must be HTTPS in production)
- `BREVO_API_KEY` and a verified `EMAIL_FROM`, or the existing `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD`
- `REDIS_URL` for BullMQ. Without Redis, the API uses its existing in-process fallback; this is suitable only for development and does not survive restarts.

Run `npm --workspace apps/api run db:migrate:deploy` before deploying the new API build. An authorized administrator can inspect aggregate results at `GET /api/drives/:id/publication-status`.

## Android App Links and iOS Universal Links

The Expo application accepts `https://placementx-v1.vercel.app/drives/:driveId` and preserves the drive while a logged-out user authenticates. A new native build is required after changing `app.json`.

Domain verification still requires deployment credentials that must not be guessed:

1. Obtain the Android SHA-256 signing-certificate fingerprint (`eas credentials -p android` or Play Console).
2. Publish Vercel `public/.well-known/assetlinks.json` with package `com.placementx.app.demo` and that fingerprint.
3. If iOS is shipped, obtain the Apple Team ID and publish `public/.well-known/apple-app-site-association` for the app identifier.
4. Confirm both files are served directly over HTTPS with the required JSON content type and no redirect.

Until those association files are configured, the link reliably opens the web fallback; the custom `placementx://` scheme remains available for internal testing.
