# Repository Guidelines

## Project Structure & Module Organization

Lumina is a Bun workspace managed by Vite+. `apps/mobile` is the Expo Router application: routes
live in `src/app`, UI tests in `src/__tests__`, and static files in `assets`. `apps/server` is the
Hono/Prisma backend: HTTP setup is in `src/app.ts`, routes and infrastructure are grouped under
`src/lib`, `src/providers`, `src/graph`, and `src/config`. Put server tests beside their
implementation as `*.test.ts`; Prisma schema and seed data live in `apps/server/prisma`. Shared tool
configuration belongs in `vite.config.ts` and `config/`; product plans and progress records are in
`docs/`.

## Build, Test, and Development Commands

Use Bun 1.3.11 and install with `bun install --frozen-lockfile`.

- `bun run dev` starts the mobile and server development tasks.
- `bun run lint` runs Oxlint, including type-aware rules.
- `bun run check` formats, lints, and type-checks the workspace.
- `bun run test` runs mobile Jest tests and server Vitest tests; use `bun run test:server` for
  backend-only work.
- `bun run build` exports the Expo app for iOS, Android, and web, and compiles the server. Do not
  use bare `bun build`: it is Bun's low-level bundler and requires explicit entrypoints.

## Coding Style & Naming Conventions

Vite+ enforces semicolons, single quotes, and a 100-character print width. Run
`bun run check -- --fix <paths>` before committing. Keep TypeScript strict: use `import type`,
handle promises, avoid unnecessary assertions, and give Vitest mocks explicit function types. Use
kebab-case filenames, PascalCase React components, and descriptive camelCase variables. Add or amend
shared Oxlint rules in `config/oxlint-presets.ts`, not inline in `vite.config.ts`.

## Testing Guidelines

Cover server behavior with colocated Vitest files such as `src/providers/siliconflow.test.ts`; cover
mobile UI in `src/**/*.test.tsx`. Test success and failure paths, mock external providers and
storage, and do not require real API credentials in automated tests. Run the narrowest relevant test
during development, then `bun run test` before opening a pull request.

## Commit & Pull Request Guidelines

Use Conventional Commit-style subjects seen in history, for example
`feat(server): add generation pipeline` or `chore(lint): extract presets`. Keep commits focused.
Pull requests should describe scope and validation, reference related issues or docs, and include
screenshots for mobile UI changes. CI must pass `vp check`, all tests, and the production build.

## Expo Requirement

Before changing Expo or React Native code, read the exact SDK 56 documentation:
https://docs.expo.dev/versions/v56.0.0/.
