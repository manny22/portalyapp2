---
name: implement-janora-frontend-change
description: Implement or modify a Janora frontend feature, bugfix, or refactor across the existing React/TypeScript ports-and-adapters layers. Use for changes under src that may touch domain models, use cases, repository ports, HTTP adapters, TanStack Query hooks, routing, or UI. Do not use for backend/NestJS implementation, documentation-only work, or Git-only tasks.
---

# Implement a Janora frontend change

## Scope

Repository root: the directory containing `package.json` and `src/`.

Positive examples:
- "Add a resident search/filter flow."
- "Fix access-control entry validation."
- "Add a field to vehicles from API through UI."

Negative examples:
- "Create the NestJS backend."
- "Only rewrite the README."
- "Prepare my commit message."

## Workflow

1. Read `CLAUDE.md` and the path-scoped rules for files you will touch.
2. Run `git status --short` and preserve unrelated/pre-existing changes.
3. Trace the existing flow before editing: domain model/value object -> port -> use case -> adapter -> feature hook/query -> UI/router.
4. Confirm the backend contract from existing models/ports/adapters and explicit docs. If a required field/endpoint is unsupported, mark it `Pending Validation` instead of inventing it.
5. Make the smallest cohesive change that preserves dependency direction. Do not broaden into a monorepo/backend migration.
6. Add or update tests for every changed executable behavior: success, validation/error paths, edge cases, and regression coverage.
7. Update user/project documentation when behavior, API contracts, configuration, architecture, security, or setup changes.
8. Run `/verify-janora-change` or execute its repository-native checks.
9. Report each validation as `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`, or `NOT APPLICABLE`.

## Stop conditions

Do not call the change complete or ready when applicable tests are missing, required validation fails, coverage for changed code is not proven strictly above 80%, or required documentation is stale. If coverage tooling is missing, report `BLOCKED`; do not install a new provider without approval.
