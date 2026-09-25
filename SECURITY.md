# PlacementX security operations

The API enforces authentication and authorization server-side. Student queries derive identity from the verified access token; admin routers enforce current database roles, and coordinator queries are restricted to their assigned department. Prisma parameterizes database operations, while request middleware rejects operator/prototype-pollution keys.

## Required deployment controls

1. Store `JWT_SECRET`, database credentials, Firebase service credentials, and `SUPABASE_SERVICE_ROLE_KEY` in the deployment platform's secret manager. Never use `VITE_` for server secrets.
2. Set `NODE_ENV=production`, a non-placeholder `JWT_SECRET` of at least 32 characters, exact HTTPS `CORS_ORIGINS`, and the required database/storage variables. Startup fails closed when production configuration is unsafe.
3. Keep Supabase buckets private and apply `supabase/storage-security.sql`. The API validates PDF MIME type, signature, size, document type, and filename before storage and returns 15-minute signed URLs.
4. Deploy `database.rules.json` and `storage.rules` with the Firebase CLI. The default rule is deny; application data is scoped by Firebase UID.
5. Use a least-privilege PostgreSQL runtime role, require TLS in `DATABASE_URL`, restrict network access to the API environment, and keep the migration/owner role separate from the runtime role.
6. Set `TRUST_PROXY=true` only behind a trusted single reverse proxy. Authentication endpoints are rate-limited by IP, account identifier, and route.
7. Run `npm run security:scan` before release. If it reports history findings, revoke/rotate the credential first, then rewrite history with an approved repository procedure.
8. Recruiter invitation tokens are stored as SHA-256 digests. Links issued before this hardening change must be regenerated.

## Verification

Run `npm test --workspace=@placementx/api`, `npm run type-check`, and `npm run security:scan`. Test with an ordinary student token against admin routes, another student's resources, modified user IDs, malicious object keys, oversized/non-PDF uploads, and disallowed origins. Expected results are 401/403/400 without stack traces or database details.

## Admin provisioning

The login form authenticates against Firebase, not the legacy `User.password` database column. Configure Firebase client and Admin SDK variables, then set `SEED_ADMIN_PASSWORD` only in your local untracked environment and run `npm run seed`. This creates or binds the Firebase user to the server-owned `SUPER_ADMIN` database role. The frontend intentionally does not contain a default administrator password.

Firebase email verification remains required. For a pre-approved trusted administrator only, a deployment operator can additionally set `SEED_VERIFY_ADMIN_EMAIL=true` while seeding; this is intentionally opt-in because it bypasses the normal Firebase verification-link flow.

For local development only, accounts in `DEMO_EMAIL_ALLOWLIST` may sign in without an inbox verification claim. They still must authenticate with Firebase and map to a server-owned database role. This exception is disabled automatically when `NODE_ENV=production`.
