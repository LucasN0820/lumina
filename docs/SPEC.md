# Lumina - AI Wallpaper App MVP

## Context

Lumina is an Android-first AI wallpaper app for international users. Users choose a preset, add a few ideas, generate a 2K+ wallpaper that matches their device aspect ratio, preview it in a phone mockup, apply it to the Android home/lock screen, save it to photos, and share it.

| Decision     | New direction                        | Impact                                                                                                                                                |
| ------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Target stage | **Lean MVP**                         | Keep compliance, moderation, watermarking, store launch, and payments out of scope for the first build. Leave extension points only.                  |
| Platform     | **Android first**                    | Android can set wallpaper through `WallpaperManager`; iOS remains save/share only because apps cannot directly set system wallpaper.                  |
| Auth         | **Clerk + Google SSO**               | Remove custom SMS, WeChat OAuth, and app-issued JWT. The app uses Clerk sessions; the server verifies Clerk auth and stores `clerkUserId`.            |
| Storage      | **Cloudflare R2**                    | Replace Alibaba OSS with R2 through S3-compatible APIs and presigned URLs or public/custom-domain reads.                                              |
| AI images    | **OpenAI Codex SDK provider**        | Replace DashScope/Wanxiang/Qwen/VIAPI with a `CodexImageProvider` backed by `@openai/codex-sdk`, using the existing Codex Plus quota where supported. |
| Database     | **Neon Postgres or hosted Postgres** | Keep Prisma + PostgreSQL, but target international hosted Postgres instead of Alibaba RDS.                                                            |

Important boundary: the Codex SDK is server-side and controls local/trusted Codex agents. It is not a normal public multi-tenant image REST API. MVP should treat it as a trusted-owner backend path that can use the owner's ChatGPT/Codex entitlement. Before building the full image pipeline, implement a small spike that proves the SDK can programmatically return image artifacts for generation, editing, outpainting-style expansion, and style extraction workflows. If that is not reliable enough for production, keep the same `ImageProvider` interface and swap the backend to OpenAI's Image API later.

Implementation must still follow `AGENTS.md`: when writing Expo code, check the exact SDK 56 docs at https://docs.expo.dev/versions/v56.0.0/. For OpenAI/Codex, Clerk, and R2 APIs, verify current official docs before hardcoding model names, auth flows, SDK options, or storage behavior.

---

## Architecture Overview

```text
Expo App (Android-first, @expo/ui native-first)
  |- Create flow: preset + theme/tone/mood chips + short idea -> generate
  |- Preview: generated image inside phone mockup, lock/home preview toggle
  |- Apply: local Kotlin module expo-wallpaper (home/lock/both)
  |- Save/share: expo-media-library / expo-sharing
  |- Profile: Clerk Google SSO, user identity, library
  |
  | HTTPS (Clerk session token)
  v
server/ (Node + TypeScript + Hono)
  |- Clerk auth middleware: verify Clerk session/JWT, map to local User
  |- /generate -> create job, return jobId; /jobs/:id -> poll
  |- /presets, /wallpapers, /uploads/presign
  |- LangGraph.js: resolvePreset -> enrichPrompt -> route -> generate/edit -> persist
  |- Prisma -> PostgreSQL (local / Neon / hosted Postgres)
  |- ImageProvider: CodexImageProvider using @openai/codex-sdk
  |- Object storage: Cloudflare R2 through S3-compatible client
  v
OpenAI Codex / GPT Image tools + Cloudflare R2
```

**Async generation mode**: `POST /generate` returns a local `jobId` immediately. The server runs the generation in-process for MVP, updates `Wallpaper.status`, stores the final image in R2, and the app polls `GET /jobs/:jobId`. No Redis, queue, or Trigger.dev is required in MVP.

---

## Tech Stack And New Dependencies

**Frontend (existing Expo SDK 56 app)**

- `@clerk/expo` for Clerk sessions and Google SSO.
- `expo-secure-store` for Clerk token cache.
- `expo-image-picker` for existing-image flows.
- `expo-media-library`, `expo-sharing`, `expo-file-system` for save/share/local file handoff.
- `@tanstack/react-query` for polling and server state.
- Optional `zustand` for small local UI state.
- Local native module `modules/expo-wallpaper` built with Expo Modules API + Kotlin.
- UI remains **native-first**: `@expo/ui` + `expo-glass-effect` + `expo-symbols` + `StyleSheet`; do **not** add NativeWind.
- Reuse `example/` theme components/hooks as the UI blueprint.

**Backend `server/`**

- `hono` + `@hono/node-server`, `typescript`, `tsx`.
- `prisma` + `@prisma/client`.
- `@langchain/langgraph` + `@langchain/core`.
- `@clerk/backend` or Clerk JWT/JWKS verification.
- `@openai/codex-sdk` for the Codex-backed image provider.
- `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` for Cloudflare R2.
- `zod` for input/env validation.

**Removed from the plan**

- Alibaba DashScope / Tongyi Wanxiang / Tongyi Qianwen / qwen-vl / VIAPI.
- Alibaba OSS.
- Alibaba SMS.
- WeChat OAuth.
- Custom app-issued JWT for primary auth.

---

## Data Model (Prisma `server/prisma/schema.prisma`)

Naming convention remains mandatory: Prisma model and field names use camelCase; database tables and columns use snake_case. Every scalar field gets `@map("...")`; every model gets `@@map("...")`; every model has `createdAt` and `updatedAt`.

```prisma
model User {
  id            String      @id @default(cuid()) @map("id")
  clerkUserId   String      @unique @map("clerk_user_id")
  googleSubject String?     @unique @map("google_subject")
  email         String?     @unique @map("email")
  nickname      String?     @map("nickname")
  avatarUrl     String?     @map("avatar_url")
  wallpapers    Wallpaper[]
  presets       Preset[]
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")

  @@map("user")
}

model Preset {
  id             String   @id @default(cuid()) @map("id")
  name           String   @map("name")
  category       String   @map("category")
  coverImageUrl  String?  @map("cover_image_url")
  promptTemplate String   @map("prompt_template")
  negativePrompt String?  @map("negative_prompt")
  styleRefUrl    String?  @map("style_ref_url")
  params         Json?    @map("params")
  isBuiltIn      Boolean  @default(false) @map("is_built_in")
  ownerUserId    String?  @map("owner_user_id")
  owner          User?    @relation(fields: [ownerUserId], references: [id])
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("preset")
}

model Wallpaper {
  id             String   @id @default(cuid()) @map("id")
  userId         String?  @map("user_id")
  user           User?    @relation(fields: [userId], references: [id])
  presetId       String?  @map("preset_id")
  mode           String   @map("mode") // text2img | outpaint | edit | style | upscale
  prompt         String   @map("prompt")
  sourceImageUrl String?  @map("source_image_url")
  resultImageUrl String?  @map("result_image_url")
  width          Int?     @map("width")
  height         Int?     @map("height")
  status         String   @default("pending") @map("status")
  providerTask   String?  @map("provider_task") // Codex thread/run id or image call id
  error          String?  @map("error")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("wallpaper")
}
```

MVP can continue using `Wallpaper.status` as the job table. If Clerk anonymous sessions are not enabled, keep a local `deviceId` only for anonymous history and bind it after sign-in.

---

## Backend Design `server/src/`

- **Auth** `middleware/auth.ts`: verify Clerk auth on incoming requests. Expose `optionalAuth` for anonymous generation and `requireAuth` for profile/library actions. The backend does not mint primary auth JWTs; it trusts Clerk and maps Clerk users into local `User`.
- **Provider abstraction** `providers/types.ts`: `interface ImageProvider { textToImage(spec); editImage(spec); outpaint(spec); upscale(spec); extractStyle(spec); }`.
- **Codex provider** `providers/codex.ts`: uses `@openai/codex-sdk` server-side. It should:
  - start or resume a Codex thread per job;
  - give Codex a structured instruction to generate/edit/expand/extract style;
  - require a machine-readable final result containing image artifact path/base64/url plus metadata;
  - write the returned image bytes to R2;
  - store the Codex thread/run id in `providerTask`.
- **Provider fallback boundary**: keep `OpenAIImageApiProvider` as an optional future implementation only if the Codex SDK cannot reliably expose image artifacts or the app needs production multi-user scaling.
- **LangGraph graph** `graph/wallpaper.graph.ts`:
  1. `resolvePreset` - combine preset template, chips, idea, and target W x H.
  2. `enrichPrompt` - use Codex/OpenAI text reasoning to rewrite a short idea into a professional image prompt. This is optional via env.
  3. `route` - branch by `mode`: `text2img`, `outpaint`, `edit`, `style`, `upscale`.
  4. `generate/edit` - call `ImageProvider`.
  5. `persist` - upload final bytes to R2 and update `Wallpaper`.
  6. Leave TODO slots for moderation, watermarking, and policy checks.
- **Routes**:
  - `POST /generate`
  - `GET /jobs/:id`
  - `GET /presets`
  - `GET /wallpapers`
  - `POST /uploads/presign`
  - `GET /me`
  - `POST /me/bind-device`
- **Seed** `prisma/seed.ts`: create 6-8 built-in international wallpaper presets.

---

## Frontend Design `src/`

- **Routes**: `(tabs)/index` for create, `(tabs)/library` for wallpaper library, `(tabs)/profile` for Clerk profile/sign-in.
- **Root layout** `src/app/_layout.tsx`: wrap the app in `ClerkProvider` and React Query `QueryClientProvider`.
- **Auth UI**:
  - Prefer Clerk's Expo native Google SSO path in development builds.
  - For Expo Go/prototyping, use Clerk browser-based OAuth where appropriate.
  - Use `useAuth()` to obtain a token for backend calls and inject it into `src/lib/api.ts`.
- **Create** `src/features/create/`: preset grid, chips, one-line idea, generate button, progress state, result state.
- **Preview** `src/components/WallpaperPreview.tsx`: phone mockup with lock/home preview toggle.
- **Apply/share/save** `src/features/apply/`: download R2 result locally with `expo-file-system`, call `modules/expo-wallpaper`, save to media library, share with system share sheet.
- **Library** `src/features/library/`: generated wallpaper grid and custom preset management.
- **Edit existing image** `src/features/edit/`: pick image, upload to R2 through presigned URL, then run edit/outpaint/upscale/style extraction jobs.
- **Native wallpaper module** `modules/expo-wallpaper/`: Kotlin Expo module with `setWallpaper(uri, target)` using Android `WallpaperManager`.

---

## Milestones

- **M0 Foundation**: install dependencies; create `server/`; Prisma schema and local migration; env validation for Clerk, R2, Postgres, and Codex; provider interface; R2 client.
- **M0.5 Codex image spike**: write `server/scripts/try-codex-image.ts` to prove `@openai/codex-sdk` can return a programmatically usable image artifact for text-to-image and one edit flow using the existing Codex Plus entitlement. This milestone gates M1.
- **M1 Generate -> preview loop**: `CodexImageProvider.textToImage`, minimal graph, R2 upload, `/generate`, `/jobs/:id`, seed presets, app create page, polling, phone preview. Demo: preset -> 2K+ image -> preview.
- **M2 Apply/share/library**: Kotlin wallpaper module, Android dev build, set home/lock/both, share, save, library grid.
- **M3 Auth**: Clerk Google SSO, backend Clerk verification, secure token cache, local user mapping, anonymous history binding.
- **M4 Existing-image tools**: upload source image to R2, edit/outpaint/upscale/style extraction branches, custom preset creation.
- **M5 Polish**: draft/high-quality modes, filters, favorites, empty/error states, rate limits, retries, cost/credit guardrails.

---

## Key Files

- New: `server/` (`src/index.ts`, `src/app.ts`, `src/config/env.ts`, `src/middleware/auth.ts`, `src/providers/{types,codex,index}.ts`, `src/lib/r2.ts`, `src/graph/*`, `src/routes/*`, `prisma/schema.prisma`, `prisma/seed.ts`).
- New: `server/scripts/try-codex-image.ts`, `server/scripts/try-r2.ts`.
- New: `modules/expo-wallpaper/`.
- New: `src/features/{auth,create,apply,library,edit}/`, `src/components/WallpaperPreview.tsx`, `src/lib/api.ts`.
- Modify: `src/app/_layout.tsx`, `src/app/(tabs)/*`, `app.json`, `package.json`.
- Reuse: `example/src/components`, `example/src/hooks`, `example/src/constants/theme.ts`.

---

## Verification

1. **Codex provider spike**: run `server/scripts/try-codex-image.ts`; verify it generates or edits an image and returns a file/blob/base64 value that the server can upload to R2.
2. **Backend**: start local Postgres, run Prisma migration/seed, start server, call `POST /generate`, poll `GET /jobs/:id` until `succeeded`, verify `resultImageUrl` points to R2 and the image meets the requested size.
3. **Storage**: run `server/scripts/try-r2.ts`; verify upload, signed GET URL, and optional public/custom-domain URL.
4. **Auth**: sign in with Google through Clerk, call `/me`, verify the server maps the Clerk user into local `User`, and verify protected requests reject missing/invalid auth.
5. **Frontend + native module**: run a development build; complete preset -> generation -> preview -> apply to Android home/lock screen; verify save/share.
6. **Existing-image flows**: pick a photo, upload to R2, run edit/outpaint/upscale/style extraction, then reuse the custom preset.
7. **Failure paths**: invalid auth, R2 failure, Codex usage limit, image blocked/failed, network failure -> task becomes `failed` and app shows an actionable error state.

---

## Explicitly Not In MVP

- App Store / Play Store launch.
- Payments or membership tiers.
- Production-grade multi-tenant image generation using the owner's personal Codex entitlement.
- iOS one-tap wallpaper setting.
- Full moderation pipeline, watermarking, or policy enforcement beyond provider-level safeguards and TODO slots.

## Risks / Needs Confirmation

- Codex SDK image artifact extraction must be proven before committing to the full provider implementation.
- Using a personal Codex Plus quota from a backend is suitable for owner-operated MVPs, not public multi-user production unless OpenAI's terms and the technical entitlement model support that usage.
- R2 public access strategy must be chosen: public bucket/custom domain for simple display, or private bucket plus signed GET URLs for tighter control.
- Clerk Google SSO requires correct Google OAuth credentials and native app configuration for Android/iOS development builds.
