# 0012 — library

> 模块：library ｜ 优先级：12 ｜ 依赖：0007,0006 ｜ 里程碑：M2 对应 SPEC：「壁纸库/自定义预设」
>
> 状态：本地列表、详情和 mock 验证完成；真实 API 数据及 0011 原生操作待设备/服务联调。

## 目标

「壁纸库」Tab：展示用户（或匿名 deviceId）历史生成的壁纸网格，点击可重新预览/应用/分享；并预留自定义预设管理入口（自定义预设的产生在 0015）。

## 范围

- In：壁纸网格列表（分页/下拉刷新）、详情查看（接 0008 预览 + 0011 操作）、空态。
- Out：自定义预设的生成逻辑（0015）、跨设备同步（依赖 0013 登录）。

## 涉及文件

- `apps/mobile/src/app/(tabs)/library.tsx`
- `apps/mobile/src/features/library/WallpaperGrid.tsx`、`WallpaperDetail.tsx`、`useWallpapers.ts`（`GET /wallpapers`）
- （预留）`apps/mobile/src/features/library/PresetManager.tsx`

## 实现要点

- `useWallpapers`：React Query 拉 `GET /wallpapers?deviceId|userId`，瀑布/网格用
  `expo-image`（开启缓存/占位）。
- 点击进详情：复用 `WallpaperPreview`（0008）+ `ApplySheet`（0011）。
- 空态：引导去创作页。
- 自定义预设区先占位（列表为空），等 0015 接入风格提取后填充。

## 独立测试

- 先用 0009 生成几张 → 进库 Tab 看到网格；点开能预览并触发应用/分享。
- 后端无数据时显示空态且可跳创作。

## 完成标准 (DoD)

- [x] 历史壁纸网格正确加载与分页（mock API 覆盖）。
- [x] 详情可预览，并为应用 + 分享操作保留可选接入点。
- [x] 空态友好；自定义预设入口已预留。

## 验证记录

- `GET /wallpapers` 已具备类型化响应、游标分页和 React
  Query 无限查询；图书馆支持下拉刷新、载入更多、错误重试、空态跳转创作以及 `expo-image` 缓存网格。
- 匿名访问使用 SecureStore 保存的随机 UUID，创作请求与图库查询复用此
  `deviceId`；不使用硬件指纹。详情复用
  `WallpaperPreview`，并允许 0011 的操作面板作为可选 action 注入。
- 添加网格、详情、查询与匿名 ID 测试；后续移动端全量 Jest 12 个套件、29 项断言和全仓 `vp check`
  通过。
- 真实生成内容、分页 API 与 Android/iOS 操作面板需在配置 `EXPO_PUBLIC_API_URL` 和设备环境后联调。
