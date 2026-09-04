---
paths:
  - "src/ui/**/*.tsx"
  - "src/app/**/*.tsx"
---

# React UI rules

- Use functional React components and hooks; keep components small and cohesive.
- Preserve the existing Atomic Design organization: reusable primitives in `atoms`, compositions in `molecules`/`organisms`, page shells in `templates`, route screens in `pages`.
- Search existing `src/ui/atoms`, `molecules`, and `organisms` before introducing a new UI primitive.
- Use React Hook Form + Zod for non-trivial forms. Keep create/edit DTO construction explicit and aligned with domain model types.
- Keep business validation out of JSX handlers when it belongs in a value object or use case.
- Use feature hooks for remote data rather than calling the DI container directly from new pages. `ResidentialUnitsPage` is an existing exception, not a template.
- Preserve Spanish user-facing messages and `es-CO` date/time formatting unless product requirements change.
- Include loading, error, and empty states for data-driven views and disable/indicate pending actions for mutations.
- Maintain responsive Tailwind behavior for desktop, tablet, and mobile; do not replace existing shared layout primitives without a requirement.
- Preserve accessibility basics: associated labels, semantic buttons, focus states, disabled states, and meaningful ARIA attributes where required.
- When adding a route, update router registration, navigation constants/items, and `usePermissions` together when applicable.
