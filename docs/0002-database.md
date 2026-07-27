# 0002 — database

> 模块：database ｜ 优先级：2 ｜ 依赖：0001 ｜ 里程碑：M0 ｜ 状态：完成（2026-07-25）
>
> 对应 SPEC：「数据模型（Prisma）」

## 目标

建立 Prisma + PostgreSQL 数据层：`User / Preset / Wallpaper`
三个模型、迁移、种子数据，并封装可复用的 Prisma Client 单例。

## 范围

- In：`schema.prisma`、初始迁移、`seed.ts`（6–8 个内置预设）、Prisma Client 单例。
- Out：业务读写逻辑（在各 API 模块）。

## 涉及文件

- `apps/server/prisma/schema.prisma`
- `apps/server/prisma/seed.ts`
- `apps/server/src/lib/db.ts`（导出单例 `prisma`）
- `apps/server/prisma/migrations/20260726000000_add_wallpaper_device_id/`（0006 为匿名历史补充）

## 实现要点（强制命名约定）

- **每个字段加 `@map("snake_case")`，每个模型加
  `@@map("...")`**；模型/字段在代码里用 camelCase，DB 列/表用 snake_case。
- **每个 model 必须含 `createdAt`(`@default(now())`→`created_at`) 与
  `updatedAt`(`@updatedAt`→`updated_at`)**。
- 关系导航字段（如 `user`/`wallpapers`/`presets`）是虚拟字段，不占列、**不加
  `@map`**；外键标量（`userId`→`user_id`）需 `@map`。
- 模型字段以 SPEC 中给定版本为准（`User/Preset/Wallpaper`）。
- 种子：内置预设覆盖「minimal / cinematic / cyberpunk / nature / anime / abstract /
  editorial」等国际化分类，含
  `promptTemplate`（含占位符）、`negativePrompt`、`coverImageUrl`、`isBuiltIn=true`。
- `db.ts` 用全局单例避免 dev 热重载重复连接。
- `Wallpaper.deviceId`
  是未登录 MVP 设备历史的可空归属字段；0006 已为其建索引，0013 登录后可将其绑定到 `userId`。
- 脚本：`prisma migrate dev`、`prisma generate`、`prisma db seed`（在 `package.json` 配
  `prisma.seed`）。

## 独立测试

- 本地起 Postgres（Docker 或本机），配置 `DATABASE_URL`。
- `npx prisma migrate dev` 生成迁移并建表；`npx prisma db seed` 写入预设。
- `npx prisma studio` 查看 `preset` 表确有种子数据，列名为 snake_case，每表含
  `created_at/updated_at`。
- 写一个一次性脚本 `prisma.preset.findMany()` 能查到数据。

## 完成标准 (DoD)

- [x] 迁移成功，DB 中表名/列名均为 snake_case。
- [x] 三个模型均含 `created_at` + `updated_at`。
- [x] 种子写入 ≥6 个内置预设且可查询。
- [x] `prisma` 单例可被其他模块 import 复用。

## 验证记录

- 在临时 PostgreSQL 16 容器中执行 `prisma migrate dev` 和 `prisma db seed`，容器在验收后已删除。
- `preset` 表查询到 7 个内置预设；`wallpaper` 表确认存在 `created_at` 与 `updated_at`。
- `prisma validate`、`prisma format --check`、`prisma generate`、初始迁移 diff、server
  `tsc`、Oxlint 和统一测试均通过。
