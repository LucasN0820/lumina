# 0012 — library

> 模块：library ｜ 优先级：12 ｜ 依赖：0007,0006 ｜ 里程碑：M2
> 对应 SPEC：「壁纸库/自定义预设」

## 目标
「壁纸库」Tab：展示用户（或匿名 deviceId）历史生成的壁纸网格，点击可重新预览/应用/分享；并预留自定义预设管理入口（自定义预设的产生在 0015）。

## 范围
- In：壁纸网格列表（分页/下拉刷新）、详情查看（接 0008 预览 + 0011 操作）、空态。
- Out：自定义预设的生成逻辑（0015）、跨设备同步（依赖 0013 登录）。

## 涉及文件
- `src/app/(tabs)/library.tsx`
- `src/features/library/WallpaperGrid.tsx`、`WallpaperDetail.tsx`、`useWallpapers.ts`（`GET /wallpapers`）
- （预留）`src/features/library/PresetManager.tsx`

## 实现要点
- `useWallpapers`：React Query 拉 `GET /wallpapers?deviceId|userId`，瀑布/网格用 `expo-image`（开启缓存/占位）。
- 点击进详情：复用 `WallpaperPreview`（0008）+ `ApplySheet`（0011）。
- 空态：引导去创作页。
- 自定义预设区先占位（列表为空），等 0015 接入风格提取后填充。

## 独立测试
- 先用 0009 生成几张 → 进库 Tab 看到网格；点开能预览并触发应用/分享。
- 后端无数据时显示空态且可跳创作。

## 完成标准 (DoD)
- [ ] 历史壁纸网格正确加载与分页。
- [ ] 详情可预览 + 应用 + 分享。
- [ ] 空态友好；自定义预设入口已预留。
