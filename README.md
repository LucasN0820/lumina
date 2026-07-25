# Lumina

Lumina is an Android-first AI wallpaper application. The repository is a Bun workspace:

```text
apps/mobile  Expo SDK 56 application
apps/server  Hono API application
```

Vite+ provides the shared formatting, linting, type-checking, test orchestration, task cache, and
staged-file workflow. Expo/Metro and EAS continue to own mobile development and Android release
builds.

## Setup

```powershell
irm https://viteplus.dev/install.ps1 | iex
vp install --frozen-lockfile
vp config --no-agent
```

## Commands

```powershell
vp check
vp run dev:all
vp run test:all
vp run build:all
vp run build:android
vp staged
```

The mobile workspace can also be run directly with `bun --filter=@lumina/mobile run android`. The
server health endpoint is available at `http://localhost:3000/health` when the server runs.
