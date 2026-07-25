# 0001 - backend-foundation

> 模块：backend-foundation | 优先级：1 | 依赖：无 | 里程碑：M0 | 状态：完成（2026-07-25）
>
> 对应 SPEC：「后端设计」「技术栈与新增依赖」

## 目标

搭好独立后端工程 `apps/server/`（Node + TypeScript +
Hono），提供统一配置、日志、错误处理、CORS 与健康检查，成为后续所有后端模块的承载骨架。

## 范围

- In：`apps/server/` 工程初始化、依赖、`tsconfig`、脚本（dev/build/start）、`.env` 加载与校验、Hono
  app、`GET /health`、统一错误中间件、CORS。
- Out：业务路由（0006/0013）、Prisma（0002）、Provider（0003）、R2 存储（0004）。

## 涉及文件

- `apps/server/package.json`、`apps/server/tsconfig.json`、`apps/server/.env.example`、`apps/server/.gitignore`
- `apps/server/src/index.ts`（启动 `@hono/node-server`）
- `apps/server/src/app.ts`（Hono 实例 + 中间件挂载）
- `apps/server/src/config/env.ts`（用 `zod` 校验环境变量并导出类型化 config）
- `apps/server/src/lib/logger.ts`、`apps/server/src/middleware/error.ts`

## 实现要点

- 依赖：`hono`、`@hono/node-server`、`zod`、`tsx`、`typescript`、`@types/node`。
- `env.ts` 校验：
  - 基础：`PORT`、`DATABASE_URL`
  - Clerk：`CLERK_SECRET_KEY`、`CLERK_PUBLISHABLE_KEY`、`CLERK_JWT_ISSUER`（或 JWKS 配置）
  - R2：`R2_ACCOUNT_ID`、`R2_BUCKET`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_ENDPOINT`、`R2_PUBLIC_BASE_URL`（可选）
  - Codex：`CODEX_PROVIDER_ENABLED`、`CODEX_MODEL`、`CODEX_WORKDIR`、`CODEX_IMAGE_TIMEOUT_MS`
- `.env.example` 列全所有 key（值留空），`.env` 加入 `.gitignore`。
- 统一响应/错误结构：`{ ok: boolean, data?, error? }`；错误中间件捕获并转 JSON。
- 脚本：`dev`=`tsx watch src/index.ts`，`build`=`tsc`，`start`=`node dist/src/index.js`。

## 独立测试

- `bun --filter=@lumina/server run dev` 启动后：`curl http://localhost:3000/health` 返回
  `{ ok: true }`。
- 故意删掉一个必填 env，启动应给出明确校验错误并退出。

## 完成标准 (DoD)

- [x] `apps/server/` 可独立 `bun --filter=@lumina/server run dev` 启动且无报错。
- [x] `/health` 返回 200 + `{ ok: true }`。
- [x] env 校验覆盖 Clerk、R2、Postgres、Codex provider 配置。
- [x] 统一错误中间件对未捕获异常返回结构化 JSON。

## 验证记录

- 使用临时完整环境变量启动 `bun --filter=@lumina/server run dev`，`GET /health` 返回
  `{ "ok": true }`；验证进程随后已停止。
- `bun run lint`、`bun --filter=@lumina/server run build`、`bun run test` 通过。
- `env.test.ts` 覆盖默认配置、必填环境变量缺失和 Codex 启用时的依赖字段；`app.test.ts`
  覆盖健康检查及未处理异常的结构化 500 响应。
