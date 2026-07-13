# AGENTS.md

## Repository Expectations

- Read the existing project files before making changes; this repository is still minimal, so do not assume a framework until one is present.
- Keep edits scoped to the requested task and preserve unrelated user changes.
- Prefer existing project conventions once tooling, source directories, or package manager files are added.
- Use `rg` or `rg --files` for searching when available.

## Commands

- There are no project-specific build, lint, or test commands defined yet.
- When commands are added, derive verification steps from committed project files such as `package.json`, lockfiles, Makefiles, or framework config.
- If dependencies must be installed or network access is required, ask for approval first.

## Test Artifacts

- Save every screenshot and test report in the project-level `capturas/` directory.
- This rule applies to manual checks, browser tests, responsive reviews, and automatically generated test artifacts.
- Create `capturas/` if it does not exist; do not save screenshots or test reports in the repository root or in temporary directories.

## Frontend Work

- Build the actual usable experience first; avoid placeholder landing pages unless explicitly requested.
- Keep UI responsive across mobile and desktop.
- Match any established design system or component conventions before introducing new patterns.

## Safety

- Do not run destructive Git or filesystem commands unless explicitly requested.
- Do not commit, push, or open pull requests unless explicitly asked.
