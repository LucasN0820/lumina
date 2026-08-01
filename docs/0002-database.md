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
- 根目录提供 `db:generate`、`db:migrate`、`db:deploy`、`db:reset`、`db:seed`、
  `db:push`、`db:status`、`db:studio`；命令在 `apps/server` 中运行并读取其 `.env`。
- `db:migrate` 用于本地创建并应用迁移；`db:deploy` 只应用已有迁移，供部署使用； `db:reset`
  会清空数据库并重新应用迁移和种子数据，执行前保留 Prisma 的交互确认。

## 独立测试

- 本地起 Postgres（Docker 或本机），配置 `DATABASE_URL`。
- 在根目录运行 `bun run db:migrate -- --name <migration-name>` 生成迁移并建表； `bun run db:seed`
  写入预设。
- `bun run db:studio` 查看 `preset` 表确有种子数据，列名为 snake_case，每表含
  `created_at/updated_at`。
- 写一个一次性脚本 `prisma.preset.findMany()` 能查到数据。

## 生产数据库迁移

- `.github/workflows/deploy-database.yml` 仅支持从 GitHub Actions 手动触发，并只执行
  `bun run db:deploy` 应用已提交的迁移。
- 在仓库 `Settings > Environments` 创建 `production` Environment，为其配置 `DATABASE_URL`
  Secret；建议限制部署分支为默认分支并启用 Required reviewers。
- 合并 schema 与 migration 到默认分支后，打开
  `Actions > Deploy production database schema`，选择默认分支，输入 `deploy-production` 后运行。
- 工作流不会执行 `db:reset`、`db:push` 或
  `db:seed`；生产迁移使用固定并发组，避免多个迁移同时修改数据库。

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
