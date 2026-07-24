# 0006 — generation-api

> 模块：generation-api ｜ 优先级：6 ｜ 依赖：0005,0002 ｜ 里程碑：M1
> 对应 SPEC：「路由」「异步出图模式」

## 目标
对外暴露出图相关 HTTP 接口：异步建任务 + 轮询，外加预设与壁纸列表查询。客户端据此完成「触发出图 → 轮询 → 拿结果」。

## 范围
- In：`POST /generate`、`GET /jobs/:id`、`GET /presets`、`GET /wallpapers`；进程内任务 runner（DB 状态驱动）。
- Out：鉴权强校验（0013/0014；MVP 用匿名 deviceId）、扩图/风格入口（0015）、上传签名接口（0004）。

## 涉及文件
- `server/src/routes/generate.ts`、`server/src/routes/presets.ts`、`server/src/routes/wallpapers.ts`
- `server/src/jobs/runner.ts`（触发 `runWallpaperGraph` 异步执行，不阻塞响应）
- `server/src/app.ts`（挂载路由）

## 实现要点
- `POST /generate`：校验入参（`zod`：presetId、userInputs、width、height、mode、可选 deviceId）→ 建 `Wallpaper(status=pending)` → 立即返回 `{ jobId }` → 后台 `runner` 跑图（成功/失败回写状态）。
- `GET /jobs/:id`：返回 `{ status, resultImageUrl?, width?, height?, error? }`，供客户端轮询。
- `GET /presets`：返回内置 + 当前用户自定义预设（MVP 先只内置）。
- `GET /wallpapers`：返回某 user/deviceId 的历史（分页）。
- MVP 任务并发：进程内简单队列/直接 async 即可，**不引入 Redis/队列**。
- 统一鉴权中间件占位：MVP 放行匿名（带 deviceId），0013 接入后改为 Clerk `optionalAuth`；有 Clerk token 时按 user 查询，无 token 时按 deviceId 查询。

## 独立测试
- `curl -X POST /generate`（带预设+想法+1080×2400）→ 拿 `jobId`；轮询 `GET /jobs/:id` 直到 `succeeded`，确认 `resultImageUrl` 可访问且尺寸 ≥2K。
- `curl /presets` 返回种子预设；`curl /wallpapers?deviceId=...` 返回刚生成记录。
- 失败用例：mock provider 抛错 → job 最终 `failed` 且带 error。

## 完成标准 (DoD)
- [ ] 三类查询接口 + 生成/轮询接口可用。
- [ ] 出图异步、`/generate` 立即返回 jobId。
- [ ] 入参用 zod 校验，非法入参返回 4xx。
- [ ] 端到端 curl 跑通「建任务→轮询→出图」。
