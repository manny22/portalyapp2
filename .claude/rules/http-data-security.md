---
paths:
  - "src/infrastructure/**/*.ts"
  - "src/shared/hooks/features/**/*.ts"
  - "src/shared/lib/query-client.ts"
  - "src/app/router.tsx"
  - "src/app/providers/AuthProvider.tsx"
  - "src/shared/hooks/useAuth.ts"
  - "src/shared/hooks/usePermissions.ts"
---

# HTTP, remote data, authentication, and authorization

- Implement API access through repository ports and `src/infrastructure/adapters/http`; keep `fetch` centralized in `base-http-client.ts` unless an explicit refactor replaces it.
- Add concrete repository implementations to `src/infrastructure/di/container.ts`; do not instantiate HTTP repositories inside components.
- Use TanStack Query for new remote queries/mutations and define stable query keys in `src/shared/lib/query-client.ts` when the domain needs cache invalidation.
- Invalidate only affected query families after mutations; include dependent data such as dashboard/inside/parking data when repository behavior requires it.
- Preserve server-provided errors without exposing secrets. Map user-facing failures to clear Spanish messages at the presentation boundary where appropriate.
- Do not log or expose tokens, passwords, authorization headers, or sensitive personal data.
- Preserve `sessionStorage` key `auth_session` and centralized Bearer-token injection unless authentication is explicitly redesigned.
- On 401, current behavior clears the session and redirects to `/login`; account for that behavior when writing tests or retry logic.
- Keep UI route permissions synchronized with router/navigation changes. Inspect both `src/app/router.tsx` and `src/shared/hooks/usePermissions.ts` for every protected route change.
- Frontend permission checks are not security boundaries. Never describe a UI-only restriction as sufficient authorization.
- Do not assume `APP_CONFIG.DEFAULT_PROPERTY_ID` proves tenant isolation. Preserve/propagate `propertyId` only according to the authenticated/backend contract.
