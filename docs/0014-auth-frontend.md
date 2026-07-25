# 0014 - auth-frontend

> 模块：auth-frontend | 优先级：14 | 依赖：0007,0013 | 里程碑：M3 对应 SPEC：「我的/登录」「Clerk +
> Google SSO」

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

- [ ] ClerkProvider + SecureStore token cache 生效。
- [ ] Google SSO 登录/退出闭环可用。
- [ ] API 请求自动注入 Clerk token。
- [ ] 匿名 -> 登录的历史绑定生效。
