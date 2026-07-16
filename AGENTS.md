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

## Cache Busting

- Every change to a browser-consumed local asset must also change that asset's public URL so previously cached copies cannot hide the update. This applies to CSS, JavaScript and its imported modules, JSON/data files, images, fonts, dialogs, and other static resources.
- Use or increment a version query parameter such as `?v=N` at every HTML, CSS, JavaScript import, or fetch reference to the changed asset. If the reference is part of a dependency chain, propagate the version bump through each importer up to `index.html` (for example: changed module -> importing module -> `js/app.js` -> its `<script>` tag).
- When a resource format or validator does not allow a query parameter, use a versioned filename and update every reference instead.
- Before finishing a change, search all references to each modified asset and verify that no unchanged URL can still serve the old cached content. Do not remove existing cache-busting parameters.

## Safety

- Do not run destructive Git or filesystem commands unless explicitly requested.
- Do not commit, push, or open pull requests unless explicitly asked.
