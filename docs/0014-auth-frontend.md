# 0014 - auth-frontend

> 模块：auth-frontend | 优先级：14 | 依赖：0007,0013 | 里程碑：M3 对应 SPEC：「我的/登录」「Clerk +
> Google SSO」
>
> 状态：本地 Provider、token 注入、界面和 mock 验证完成；真实 Google
> OAuth 与跨设备历史同步待 Clerk 配置/设备验收。

## 目标

在 Expo App 中接入 Clerk 和 Google SSO，完成登录 UI、会话恢复、token 缓存，并把 Clerk
token 注入后端 API 请求。MVP 允许匿名使用，仅在需要同步历史或跨设备时引导登录。

## 范围

- In：`ClerkProvider`、Google SSO 登录按钮、profile 页面、`expo-secure-store` token cache、auth
  hook、API token 注入、登录后同步 deviceId 历史。
- Out：后端鉴权逻辑（0013）、Clerk Dashboard/Google OAuth 后台配置。

## 涉及文件

- `apps/mobile/src/app/_layout.tsx`
- `apps/mobile/src/app/(tabs)/profile.tsx`
- `apps/mobile/src/features/auth/LoginSheet.tsx`、`GoogleSignInButton.tsx`
- `apps/mobile/src/features/auth/useAuth.ts`
- `apps/mobile/src/lib/api.ts`
- `apps/mobile/src/lib/clerkTokenCache.ts`

## 实现要点

- 依赖：`@clerk/expo`、`expo-secure-store`。
- 在 `_layout.tsx` 包裹 `ClerkProvider`，配置 publishable key 和 SecureStore token cache。
- Google SSO：使用 Clerk Expo 推荐流程；开发阶段确认 Expo Go 与 development
  build 的行为差异，生产以 development/native build 配置为准。
- `apiFetch` 调用 Clerk `getToken()`，有 token 时加 `Authorization: Bearer <token>`。
- 匿名优先：未登录也能生成（带 deviceId）；登录后调用 `/me/bind-device` 合并历史。
- profile 页显示 Google 账号、头像、登录/退出状态。

## 独立测试

- 未登录可正常出图（匿名）。
- Google 登录成功后 `profile` 显示已登录。
- 重启 App 后 Clerk 会话恢复。
- 登录后库 Tab 能看到原匿名生成的历史（绑定生效）。

## 完成标准 (DoD)

- [x] ClerkProvider + SecureStore token cache 已接入。
- [x] Google SSO 登录/退出界面与 session 激活流程已实现。
- [x] API 请求可自动注入 Clerk token。
- [x] 匿名 -> 登录的历史绑定请求已接入。

## 验证记录

- Root layout 使用 `ClerkProvider` 与官方 SecureStore token cache；`ApiTokenBridge` 将 Clerk
  `getToken` 注册给 API client，请求在 token 可用时自动附加 `Authorization: Bearer ...`。
- Profile 提供匿名说明、Google
  SSO 登录、头像/账号、历史同步状态、错误与退出；Google 流程使用 Clerk 的 browser-based
  `useSSO({ strategy: 'oauth_google' })`，兼容 Expo Go。登录完成后复用匿名 SecureStore deviceId 调用
  `/me/bind-device`。
- API token provider 与 Google 按钮的 Jest 测试已通过；后续移动端全量 12 个套件、29 项断言和
  `vp check` 均通过。
- 必须设置 `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`、Clerk Dashboard redirect URL 和 Google
  OAuth 后，才能在 Expo Go/ development build 真正验证登录、会话恢复和跨设备历史同步。
