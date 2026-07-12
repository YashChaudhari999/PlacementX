# Firebase Enterprise Architecture

This module encapsulates all Firebase operations to ensure strict separation of concerns.

## Architecture Flow
React Component -> Custom Hook -> Service -> Repository -> Firebase SDK -> Realtime Database

- **Models**: TypeScript definitions mapping to DB entities.
- **Repositories**: Pure Firebase SDK wrappers. No business logic.
- **Services**: Business logic validators and workflow orchestrators.
- **Utils**: Error mapping, Result types, and standardized DB access patterns.
