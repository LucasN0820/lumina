# Lumina 实施进度 (progress)

> 来源规格：[SPEC.md](./SPEC.md)
> 拆分原则：每个模块尽量**独立、可单独测试**；编号越小优先级越高（从 0000 起）。`0000`
> 是所有功能开发前必须完成的工程化门槛。

## 使用方式

- 每个模块有独立规格文件
  `000x-<module>.md`，含「目标 / 范围 / 涉及文件 / 实现要点 / 独立测试 / 完成标准」。
- 开发时按编号顺序推进；同一里程碑内无依赖关系的模块可并行。
- 完成一个模块后，在下表更新状态，并勾选该模块文件内的 DoD。

## 状态图例

`☐ 未开始`　`◐ 进行中`　`☑ 完成`　`⊘ 本期不做`

## 模块清单

| 步骤                                       | 模块                                                      | 端     | 依赖           | 里程碑 | 状态 |
| ------------------------------------------ | --------------------------------------------------------- | ------ | -------------- | ------ | ---- |
| [0000](./0000-vite-plus-engineering.md)    | vite-plus-engineering（Bun monorepo + Vite+ 统一工具链）  | Eng    | —              | Pre-M0 | ☑    |
| [0001](./0001-backend-foundation.md)       | backend-foundation（Hono 脚手架/配置/健康检查）           | BE     | —              | M0     | ☐    |
| [0002](./0002-database.md)                 | database（Prisma schema/迁移/种子）                       | BE     | 0001           | M0     | ☐    |
| [0003](./0003-image-provider.md)           | image-provider（ImageProvider 接口 + Codex SDK）          | BE     | 0001           | M0/M1  | ☐    |
| [0004](./0004-oss-storage.md)              | r2-storage（Cloudflare R2 上传/下载）                     | BE     | 0001           | M1     | ☐    |
| [0005](./0005-generation-pipeline.md)      | generation-pipeline（LangGraph 编排）                     | BE     | 0002,0003,0004 | M1     | ☐    |
| [0006](./0006-generation-api.md)           | generation-api（/generate、/jobs、/presets、/wallpapers） | BE     | 0005,0002      | M1     | ☐    |
| [0007](./0007-frontend-foundation.md)      | frontend-foundation（Tabs/主题/React Query/API client）   | FE     | —              | M1     | ☐    |
| [0008](./0008-wallpaper-preview.md)        | wallpaper-preview（手机壳预览组件）                       | FE     | 0007           | M1     | ☐    |
| [0009](./0009-create-flow.md)              | create-flow（创作页：预设+chips+出图+轮询）               | FE     | 0007,0008,0006 | M1     | ☐    |
| [0010](./0010-native-wallpaper-android.md) | native-wallpaper-android（Kotlin 原生设壁纸模块）         | Native | 0007           | M2     | ☐    |
| [0011](./0011-apply-share-save.md)         | apply-share-save（应用/分享/存相册）                      | FE     | 0010,0009      | M2     | ☐    |
| [0012](./0012-library.md)                  | library（壁纸库 + 自定义预设管理）                        | FE     | 0007,0006      | M2     | ☐    |
| [0013](./0013-auth-backend.md)             | auth-backend（Clerk token 校验 + 用户映射）               | BE     | 0001,0002      | M3     | ☐    |
| [0014](./0014-auth-frontend.md)            | auth-frontend（Clerk Google SSO + secure-store）          | FE     | 0007,0013      | M3     | ☐    |
| [0015](./0015-image-edit.md)               | image-edit（选图：扩图/超分/提取风格→自定义预设）         | BE+FE  | 0005,0009      | M4     | ☐    |
| [0016](./0016-polish.md)                   | polish（草稿/高清两档、分类、收藏、错误态、限流）         | BE+FE  | 多             | M5     | ☐    |

## 依赖与并行建议

- **工程化门槛（已完成）**：0000。Bun
  monorepo、Vite+ 质量门禁、测试编排、并行任务、缓存、hooks 与 CI 已通过本地验证；可以开始 M0 模块。
- **关键路径（0000 完成后）**：0001 → 0002/0003/0004（可并行）→ Codex 图片能力 spike → 0005 →
  0006。完成后后端核心出图链路即可独立验证。
- **前端可并行**：0007 → 0008 与 0009 可与后端并行（先用 mock 数据，0006 就绪后联调）。
- **M1 完成即可演示**：选预设 → 出 2K 图 → 手机壳预览。对应 0001–0009。
- 0010 原生模块需 development build（非 Expo Go），可在前端壳就绪后独立开发与真机验证。
- 0013/0014 鉴权可整体后置；MVP 先「设备匿名」跑通生成。

## 里程碑映射

- **Pre-M0 工程化门槛**：0000（Bun monorepo、Vite+ 质量门禁、测试编排、并行任务与 CI）
- **M0 基建**：0001, 0002, 0003, 0004
- **M0.5 Codex 图片能力 spike**：验证 `@openai/codex-sdk` 能返回可程序化落盘的图片产物
- **M1 核心生成→预览闭环**：0005, 0006, 0007, 0008, 0009
- **M2 应用/分享/库**：0010, 0011, 0012
- **M3 登录**：0013, 0014
- **M4 已有图能力**：0015
- **M5 打磨**：0016

## 本期明确不做（⊘）

- 完整生产级多租户图片生成额度/计费体系。
- iOS 一键设壁纸（系统不支持）；iOS 仅后续「存相册 + 引导」。
- 应用商店上架、支付/会员。
