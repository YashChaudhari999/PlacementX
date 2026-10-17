# Password reset and password change

PlacementX uses Firebase Authentication as the active password authority. The legacy `User.password` column is not used for login and is intentionally not synchronized. PostgreSQL stores only password-reset challenge state; it never stores plaintext OTPs, grants, or recovered passwords.

## Public recovery flow

1. `POST /api/auth/password-reset/request` with `{ "email": "user@example.com" }` returns the same public response for existing and unknown accounts.
2. The API emails a six-digit OTP. Its keyed HMAC is stored for five minutes. A challenge permits five failed attempts and a new code cannot be sent for 60 seconds.
3. `POST /api/auth/password-reset/verify` with `{ "email", "otp" }` returns a random reset grant valid for ten minutes. Only the grant HMAC is stored.
4. `POST /api/auth/password-reset/confirm` with `{ "resetGrant", "newPassword" }` consumes the grant once, changes the Firebase password, revokes Firebase refresh tokens, and invalidates remaining active challenges.
5. `POST /api/auth/password-reset/resend` replaces the previous challenge after the cooldown.

The minimum password length is 12 characters and the maximum is 128. Long passphrases are allowed without arbitrary composition rules. Web and mobile retain the reset grant only in component memory and clear it when the flow completes or is abandoned.

## Authenticated change

`PUT /api/auth/password` requires the PlacementX JWT plus `{ "currentPassword", "newPassword" }`. The API verifies the current password using Firebase Identity Toolkit, updates Firebase through Admin SDK, and revokes Firebase refresh tokens. Existing PlacementX JWT access tokens are stateless and can remain usable until their configured short expiry (15 minutes by default).

## Required server configuration

- `PASSWORD_RESET_SECRET`: a random secret of at least 32 characters, distinct from other keys.
- `FIREBASE_WEB_API_KEY`: Firebase web API key restricted to the Identity Toolkit API and approved app identifiers.
- Firebase Admin credentials using workload identity, `FIREBASE_SERVICE_ACCOUNT_KEY`, or the existing supported configuration.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`, and `EMAIL_FROM_NAME` for server-controlled OTP delivery.

Apply `20261017190000_add_password_reset_challenges` with `npm run db:migrate:deploy --workspace=@placementx/api`. Expired rows contain only HMACs; retain them briefly for abuse investigation and delete challenges older than 30 days using a scheduled database maintenance job.

## Failure recovery

- SMTP failures mark the new challenge `EMAIL_FAILED`; no OTP is logged or returned.
- A Firebase update failure releases the reserved grant back to `VERIFIED` so the user can retry before expiry.
- Grant reservation uses a conditional update, preventing concurrent consumption.
- OTP and grant values must never be added to logs, analytics, Firestore, AsyncStorage, localStorage, or support tickets.
