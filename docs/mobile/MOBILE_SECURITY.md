# Mobile Security Audit

## Threat Model Assessment
The PlacementX mobile application handles sensitive student academic and placement records. Security is prioritized across data-in-transit, data-at-rest, and session management.

## Security Implementations
1. **Authentication & Session:**
   - JWT tokens are NOT stored in standard `AsyncStorage`.
   - `expo-secure-store` is used as a wrapper over the native iOS Keychain and Android Keystore, ensuring the JWT is heavily encrypted at rest.
2. **Authorization Guards:**
   - The UI enforces strict role-based rendering. However, the mobile app never trusts the client-side role.
   - All critical operations (e.g., applying to a drive, updating profile) route through the `auth.middleware.ts` on the API which mathematically validates the JWT signature and role before execution.
3. **Data Logging:**
   - No sensitive data (passwords, JWTs, personal PII) is emitted to `console.log` in production builds.
4. **Network Security:**
   - The application relies purely on HTTPS endpoints for API communication (once deployed), preventing MITM attacks. Socket.io connections are initiated securely.

## Conclusion
The application adheres to industry best practices for React Native security, properly sandboxing credentials and delegating authorization authority to the backend API.
