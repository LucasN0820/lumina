# 0013 - auth-backend

> 模块：auth-backend | 优先级：13 | 依赖：0001,0002 | 里程碑：M3
> 对应 SPEC：「认证」「Clerk + Google SSO」

## 目标
后端接入 Clerk：验证来自 Expo App 的 Clerk session token，把 Clerk 用户映射到本地 `User`，并支持匿名 deviceId 历史绑定到登录用户。

## 范围
- In：Clerk auth middleware、`GET /me`、`POST /me/bind-device`、`optionalAuth`/`requireAuth` 两档中间件、Clerk user -> local User upsert。
- Out：登录 UI（0014）、Clerk Dashboard 配置、Google Cloud OAuth 配置。

## 涉及文件
- `server/src/middleware/auth.ts`
- `server/src/routes/me.ts`
- `server/src/lib/clerk.ts`
- `server/src/config/env.ts`

## 实现要点
- 依赖：`@clerk/backend`，或使用 Clerk JWKS/JWT issuer 手动校验。
- 后端不再签发主 JWT；主会话由 Clerk 管理。
- `requireAuth`：缺 token 或 token 无效则 401。
- `optionalAuth`：有 token 则解析并挂载 `ctx.user`，无 token 则放行匿名。
- `GET /me`：读取 Clerk 用户标识，upsert 本地 `User(clerkUserId)`，同步 email、nickname、avatarUrl、Google subject（如果 token claims 可得）。
- `POST /me/bind-device`：登录后把匿名 `deviceId` 生成的 `Wallpaper` 归并到该 user。
- 本地 `User` schema 应移除 `phone/wechatOpenId`，改为 `clerkUserId/email/googleSubject`。

## 独立测试
- 无 token 访问 `requireAuth` 路由返回 401。
- 用 Clerk token 调 `GET /me`，返回本地 user 并写入数据库。
- 同一个 Clerk 用户重复请求不会创建重复 User。
- 登录后调用 `bind-device`，匿名历史归并到该 user。

## 完成标准 (DoD)
- [ ] Clerk token 校验可用。
- [ ] `optionalAuth`/`requireAuth` 两档正确。
- [ ] Clerk 用户可 upsert 到本地 User。
- [ ] deviceId 历史可绑定到登录用户。
