# 0006 — generation-api

> 模块：generation-api ｜ 优先级：6 ｜ 依赖：0005,0002 ｜ 里程碑：M1 对应 SPEC：「路由」「异步出图模式」
>
> 状态：本地实现与 mock 验证完成；真实 SiliconFlow/R2 验收待 0003/0004 凭据。

## 目标

对外暴露出图相关 HTTP 接口：异步建任务 + 轮询，外加预设与壁纸列表查询。客户端据此完成「触发出图 → 轮询 → 拿结果」。

## 范围

- In：`POST /generate`、`GET /jobs/:id`、`GET /presets`、`GET /wallpapers`；进程内任务 runner（DB 状态驱动）。
- Out：鉴权强校验（0013/0014；MVP 用匿名 deviceId）、扩图/风格入口（0015）、上传签名接口（0004）。

## 涉及文件

- `apps/server/src/routes/generate.ts`、`apps/server/src/routes/presets.ts`、`apps/server/src/routes/wallpapers.ts`
- `apps/server/src/jobs/runner.ts`（触发 `runWallpaperGraph` 异步执行，不阻塞响应）
- `apps/server/src/app.ts`（挂载路由）
- `apps/server/prisma/schema.prisma`、`apps/server/prisma/migrations/20260726000000_add_wallpaper_device_id/`
  （匿名历史的 `deviceId` 归属与索引）

## 实现要点

- `POST /generate`：校验入参（`zod`：presetId、userInputs、width、height、mode、可选 deviceId）→ 建
  `Wallpaper(status=pending)` → 立即返回 `{ jobId }` → 后台 `runner` 跑图（成功/失败回写状态）。
- `GET /jobs/:id`：返回 `{ status, resultImageUrl?, width?, height?, error? }`，供客户端轮询。
- `GET /presets`：返回内置 + 当前用户自定义预设（MVP 先只内置）。
- `GET /wallpapers`：返回某 user/deviceId 的历史（分页）。
- MVP 任务并发：进程内简单队列/直接 async 即可，**不引入 Redis/队列**。
- 统一鉴权中间件占位：MVP 放行匿名（带 deviceId），0013 接入后改为 Clerk `optionalAuth`；有 Clerk
  token 时按 user 查询，无 token 时按 deviceId 查询。

## 独立测试

- `curl -X POST /generate`（带预设+想法+1080×2400）→ 拿 `jobId`；轮询 `GET /jobs/:id` 直到
  `succeeded`，确认 `resultImageUrl` 可访问且尺寸 ≥2K。
- `curl /presets` 返回种子预设；`curl /wallpapers?deviceId=...` 返回刚生成记录。
- 失败用例：mock provider 抛错 → job 最终 `failed` 且带 error。

## 完成标准 (DoD)

- [x] 三类查询接口 + 生成/轮询接口可用。
- [x] 出图异步、`/generate` 立即返回 jobId。
- [x] 入参用 zod 校验，非法入参返回 4xx。
- [x] 使用 mock 图执行路径跑通「建任务→轮询→出图」；真实外部服务验收待凭据。

## 验证记录

- Hono 路由测试覆盖 `POST /generate` 的 `202 { jobId }`
  异步响应、非法 JSON/参数的 4xx、任务轮询的成功与不存在任务路径、内置预设列表，以及按 `deviceId`
  的分页壁纸历史。
- `runWallpaperGraph`
  已覆盖把既有 job 交由 runner 执行：不会二次创建记录，Provider 失败会回写原 job 为 `failed`
  并保存 error。
- 已执行 `bun run prisma:generate`、`bun run test:server`（36 个测试）与
  `bun --filter=@lumina/server run build`。
- 未执行真实 `curl` 到 SiliconFlow/R2：当前工作区未提供相关凭据，且调用可能产生供应商费用。配置
  `SILICONFLOW_API_KEY` 和 R2 凭据后，应按「独立测试」补做一次真实生成、轮询及结果 URL 验收。
