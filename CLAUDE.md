# Janora Web - Claude Code Instructions

## Repository reality

- This repository is the **Janora frontend only**. It is a single Vite application, not a monorepo.
- Do not create `apps/api`, NestJS, Prisma, PostgreSQL, Docker Compose, pnpm workspaces, or other backend/monorepo scaffolding unless the user explicitly requests a migration and approves its scope.
- `.claudecode/prompt_janoraApp_react_node*.md` records earlier generation prompts. Treat those files as historical context, not as authoritative instructions for the current repository.
- `BACKEND_INSTRUCTIONS.md` documents only one backend operation (`POST /api/v1/residents`). Do not infer the complete backend implementation from it.

## Product context

Janora is a residential-property access and administration web application. The current frontend contains flows for authentication, dashboard metrics, residents, residential units/blocks, visitors, visit authorizations, access entry/exit, vehicles, pets, users, reports, and settings.

Current user roles are `SUPER_ADMIN`, `PROPERTY_ADMIN`, `SECURITY_GUARD`, and `RESIDENT`. Frontend route visibility is defined in `src/shared/hooks/usePermissions.ts`; backend authorization remains an external responsibility and must never be replaced by client-side checks alone.

## Technology baseline

Use the technologies already declared in `package.json`:

- React 19 + TypeScript 6 + Vite 8.
- Tailwind CSS 4 through `@tailwindcss/vite`.
- TanStack Router for routing.
- TanStack Query for remote server state.
- React Hook Form + Zod for forms and input validation.
- Vitest + Testing Library for tests.
- ESLint + Prettier for static quality and formatting.

Do not add a framework, state manager, HTTP library, validation library, or testing framework when the existing stack can solve the task.

## Architecture

Preserve the repository's ports-and-adapters / clean-architecture direction:

1. `src/core/domain/` contains models, value objects, and repository ports.
2. `src/core/application/use-cases/` contains application/business orchestration and depends on ports, not concrete HTTP repositories.
3. `src/infrastructure/adapters/http/` implements repository ports over the centralized HTTP client.
4. `src/infrastructure/di/container.ts` is the composition root and the only intended place that wires ports to concrete HTTP repositories.
5. `src/shared/hooks/features/` adapts use cases/repositories to React data flows, predominantly through TanStack Query.
6. `src/ui/` contains Atomic-Design-style atoms, molecules, organisms, templates, and pages.
7. `src/app/` contains application providers and router composition.

Do not move business rules into pages, components, HTTP adapters, or the DI container. Do not import UI or infrastructure from `src/core`.

Known exceptions/debt exist in the current tree. Do not copy them into new code:

- `CreatePetUseCase` imports `classifyBreed` from `src/shared/constants/pet-breeds.ts`.
- `ResidentialUnitsPage` calls the DI container directly instead of going through the dominant feature-hook/use-case pattern.
- `useResidentialBlocks` and `useResidentialUnits` use manual `useEffect` fetching instead of TanStack Query.

## Data and API contracts

- The current HTTP client base URL is hardcoded as `http://localhost:3000/api/v1` in `src/infrastructure/adapters/http/base-http-client.ts`.
- Preserve endpoint paths and DTO shapes from the repository ports, domain models, adapters, and explicit backend documentation. Do not invent response fields or backend behaviors.
- API models currently type timestamps as `Date`, while JSON arrives as strings at runtime in multiple flows. When changing date-sensitive behavior, inspect the exact call path and normalize deliberately rather than assuming automatic deserialization.
- `VITE_DATA_MODE` and `VITE_APP_NAME` exist in `.env.example`, but the current `src` tree does not read `import.meta.env`. Do not claim environment-driven mock mode or branding works unless you implement and test it.
- `APP_CONFIG.DEFAULT_PROPERTY_ID = 'prop-001'` is a current development default, not proof of tenant isolation. Do not spread this hardcoded property ID into new domain logic.

## React and UI conventions

- Use functional components and hooks.
- Keep identifiers, file names, types, functions, and component names in English. Existing user-facing copy is Spanish; preserve Spanish UI copy and `es-CO` formatting unless requirements say otherwise.
- Reuse atoms, molecules, organisms, and templates before creating duplicate UI primitives.
- Keep pages focused on orchestration and presentation. Put reusable remote-data behavior in feature hooks and business decisions in use cases/value objects.
- Use React Hook Form with Zod for non-trivial forms, following existing form-modal patterns.
- Use TanStack Query for new remote server state unless there is a documented reason not to.
- Every asynchronous screen must have appropriate loading, error, and empty states when those states can occur.
- Preserve responsive Tailwind patterns and accessibility attributes already used by shared components.

## Authentication and security

- Session tokens are centralized through `AuthHttpRepository`/`HttpClient` and stored in `sessionStorage` under `auth_session`. Do not duplicate token storage in components or introduce `localStorage` for authentication without an explicit security decision.
- Never log access tokens, refresh tokens, passwords, personal data, or backend error payloads containing sensitive information.
- Preserve centralized `Authorization: Bearer` handling and the current 401 session-clear behavior unless a task explicitly redesigns authentication.
- Treat `usePermissions()` as UI authorization/visibility only. Security-sensitive authorization must be enforced by the backend contract.
- Keep `propertyId` boundaries visible in DTOs and queries; do not silently remove tenant filters.

## Testing and quality gates

For every executable behavior you add or modify:

- Add or update Vitest tests for expected behavior, validation/error paths, edge cases, and regressions.
- Prefer focused tests close to the changed layer; use Testing Library for React behavior and mocks/fakes of ports for use cases.
- Do not call work complete when applicable tests are missing.
- The project currently has only one test file and no repository-enforced coverage threshold. The `test:coverage` script exists, but no Vitest coverage provider is declared. Do not claim coverage is above 80% without a real measured report.
- For generated/changed executable code, the target coverage gate is **strictly greater than 80%**. If the repository cannot measure it because tooling is missing, report `BLOCKED` rather than installing a new coverage dependency without approval.

Validation commands from the repository root:

```bash
npm run format:check
npm run lint
npm run build
npm test -- --run
npm run test:coverage
```

`npm test` without `-- --run` starts Vitest in watch mode and is not the preferred validation command.

## Package-manager caution

Both `package-lock.json` and `pnpm-lock.yaml` are present and tracked, while `package.json` does not declare a canonical `packageManager`. Treat the canonical package manager as **Pending Validation**. Do not regenerate, delete, or reconcile either lockfile during unrelated work. The commands above use npm because the existing Claude local permissions explicitly allow `npm run *`.

## Git safety

- Inspect `git status` before edits and preserve unrelated or pre-existing changes.
- Never reset, checkout away, clean, stage, commit, push, merge, rebase, or delete branches unless the user explicitly requests that Git action.
- Use `/prepare-git-commit` to check branch/commit naming against the supplied IAS Git standard before a commit is created.

## Documentation

Update documentation in the same change when behavior, API contracts, configuration, architecture, security, test commands, or local setup changes. Keep `README.md` aligned with repository evidence and keep Claude-specific maintenance guidance in `docs/ai/claude-code-setup.md`.

## Pending Validation

Do not silently resolve these open points:

- Canonical package manager: npm vs pnpm.
- Whether TypeScript `strict` should be enabled; current tsconfigs do not explicitly enable it.
- Whether `VITE_DATA_MODE` and `VITE_APP_NAME` are intended to be wired into runtime configuration.
- Whether the API base URL should become environment-driven.
- Complete backend API/OpenAPI contract and tenant-isolation guarantees.
- Whether the pet-breed legal classification in the repository is current; preserve behavior unless the product owner supplies validated policy.
