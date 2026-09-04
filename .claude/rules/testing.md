---
paths:
  - "src/**/*.test.{ts,tsx}"
  - "src/**/*.spec.{ts,tsx}"
  - "src/test-setup.ts"
  - "vitest.config.ts"
---

# Testing rules

- Use Vitest. Use React Testing Library for user-observable React behavior.
- Test actual behavior of the unit under test; do not write tests that only re-implement JavaScript or browser APIs without exercising production code.
- For use cases, inject fake/mock repository ports and cover success plus rejected business conditions.
- For HTTP adapters/client behavior, mock `fetch` at the transport boundary and assert request URL, method, headers/body, error handling, and session behavior as applicable.
- For React components/pages, query by accessible role/label/text where practical and assert user-visible behavior rather than implementation details.
- Clear mocks and browser storage between tests that touch global state.
- New/changed executable behavior requires tests for expected paths, error paths, edge cases, and regressions.
- Coverage must be measured before claiming a percentage. The current repository has no declared coverage provider or threshold; report `BLOCKED` if coverage cannot run rather than inventing a result or installing tooling without approval.
