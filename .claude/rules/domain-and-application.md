---
paths:
  - "src/core/**/*.ts"
---

# Domain and application rules

- Keep `src/core/domain` independent from React, browser APIs, HTTP, TanStack Query, and infrastructure implementations.
- Repository ports are interfaces/contracts. Use cases depend on ports; concrete repositories belong in infrastructure.
- Put business invariants in value objects or use cases when the rule belongs to the frontend domain model. Keep adapters focused on translation/I/O.
- Preserve DTO and model property names used by existing backend contracts. Before changing a DTO, inspect the matching port, adapter, use case, UI caller, and explicit backend documentation.
- Throw meaningful domain/application errors from use cases when rejecting an operation; do not swallow failures.
- Prefer existing value objects (`Email`, `PhoneNumber`, `FullName`, `DocumentNumber`, `LicensePlate`, `DateRange`, `AuthorizationCode`) when their rule exactly matches the requirement. Do not duplicate their validation in a second source of truth.
- Do not add imports from `@/ui` or `@/infrastructure` into `src/core`.
- Existing import of `@/shared/constants/pet-breeds` from `CreatePetUseCase` is technical debt, not a pattern to repeat.
- Treat all pet-breed legal text as repository behavior, not as independently verified legal advice. Do not expand it without validated requirements.
