---
name: verify-janora-change
description: Verify Janora frontend changes with the repository's existing non-mutating quality commands. Use after source/config changes or when asked to validate, test, lint, build, or assess readiness. Do not install dependencies, modify source files, or repair failures unless the user separately asks for fixes.
---

# Verify a Janora change

Run from the repository root.

Positive examples:
- "Validate this change."
- "Run lint/build/tests after the fix."
- "Is this ready to merge?"

Negative examples:
- "Implement the feature."
- "Deploy Janora."
- "Install a coverage plugin."

## Preflight

1. Run `git status --short` and identify the files in scope.
2. Confirm `node --version` and `npm --version` are available.
3. If `node_modules` is missing, report the application checks that require dependencies as `BLOCKED`. Do not run `npm install`, `npm ci`, or `pnpm install` without explicit approval.

## Checks

Run in this order and record exit status/results:

```bash
npm run format:check
npm run lint
npm run build
npm test -- --run
npm run test:coverage
```

Notes:
- `npm test` without `-- --run` is watch mode.
- `test:coverage` may be `BLOCKED` because the current manifest does not declare a Vitest coverage provider. Never invent coverage metrics.
- For executable code changes, a ready result requires measured changed-code coverage strictly greater than 80% and any stricter repository threshold.

## Output

Return a compact table with `Gate`, `Status`, `Command`, `Evidence`, and `Notes`. Use only `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`, or `NOT APPLICABLE`.
