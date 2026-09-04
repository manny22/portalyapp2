---
name: prepare-git-commit
description: Review the current Janora Git branch and changed files, then draft a branch/commit recommendation that follows the supplied IAS Git naming and commit-message standard. Use only when the user explicitly invokes this Git preparation workflow. Do not stage, commit, push, merge, rebase, delete branches, or change Git identity.
disable-model-invocation: true
argument-hint: "[HU-or-BUG-id] [short change summary]"
---

# Prepare Git metadata

This skill is read-only. Never mutate Git state.

## Inspect

Run only read operations needed for the request, such as:

```bash
git status --short --branch
git diff --stat
git diff --name-only
git branch --show-current
```

## IAS branch standard

- Lowercase, English, no spaces/special characters other than `/` and `_` as required by the policy.
- `feature/<hu-id>` for a user story/feature.
- `bugfix/<bug-id>` for a bug.
- `lab/<short_english_description>` for an experiment.
- The supplied examples contain uppercase `HU` in one branch example while the policy also says branch names must be lowercase. Treat the lowercase rule as authoritative for drafting and flag this source inconsistency as `Pending Validation` when relevant.

## IAS commit standard

Format:

```text
[wip ]<type>(<scope>): <imperative subject>

<body>

<footer>
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci_cd`, `revert`, `merge`, `config`.

- Scope is the HU/story identifier.
- Commit content is English.
- Subject is imperative and present tense.
- Keep commits separated by functionality and include only files for that functionality.
- The policy says commit content must be lowercase, while its example contains uppercase words. Draft lowercase commit text and flag the example conflict as `Pending Validation` if it matters.
- `WIP` is optional for unfinished work; because the policy also requires lowercase commit content, draft it as `wip` unless the maintainer confirms literal uppercase `WIP` is mandatory.

## Output

Provide:
1. Current branch compliance.
2. Suggested branch name if needed.
3. Files that appear to belong to the requested change vs unrelated files.
4. A complete proposed commit message.
5. Any `Pending Validation` caused by contradictions in the supplied standard.

Do not execute the commit.
