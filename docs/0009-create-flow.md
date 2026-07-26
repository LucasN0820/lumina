# 0009 — create-flow

> 模块：create-flow ｜ 优先级：9 ｜ 依赖：0007,0008,0006 ｜ 里程碑：M1 对应 SPEC：「创作页」
>
> 状态：本地实现与 mock 验证完成；真实后端/真机闭环待配置局域网 API 和 0003/0004 外部凭据后执行。

## 目标

完成核心创作闭环 UI：选预设 → 选主题/色调/氛围 + 一句话想法 → 出图（轮询进度）→ 在手机壳预览看结果 → 可重生成。这是 M1 的可演示主线。

## 范围

- In：预设网格、chips 选择、想法输入、生成按钮、轮询进度态、结果展示（接 0008 预览）、重生成。
- Out：应用/分享/存相册（0011）、登录门槛（0014）。

## 涉及文件

- `apps/mobile/src/app/(tabs)/index.tsx`（创作页主体）
- `apps/mobile/src/features/create/preset-grid.tsx`、`chips-selector.tsx`、`idea-input.tsx`、
  `generate-button.tsx`、`result-view.tsx`
- `apps/mobile/src/hooks/use-generate.ts`（封装 `POST /generate` + `GET /jobs/:id` 轮询）
- `apps/mobile/src/lib/api.ts`（生成、job、预设的类型化端点）

## 实现要点

- 用 `@expo/ui` 原生组件 + `expo-image`；`useGenerate` 基于 React Query（mutation 建任务 +
  query 轮询直到 succeeded/failed）。
- 出图请求带 `useDeviceSize()` 的目标 W×H，保证出图匹配本机。
- chips：主题/色调/氛围为有限可选项（与种子预设语义对应）。
- 进度态：轮询期间显示生成中（可放草稿/骨架）；失败显示错误 + 重试。
- 结果：渲染 `WallpaperPreview`（0008），提供「重生成」「下一步（应用/分享，占位到 0011）」。
- 「快速预览(草稿) / 高清出图」两档可先占位（完整在 0016）。

## 独立测试

- 后端（0006）起好后，真机/模拟器走完：选预设→填想法→生成→看到 2K 图在手机壳预览。
- 后端未就绪时，用 mock 数据渲染各子组件，保证 UI 可独立调。
- 失败用例：后端 job 置 failed → UI 显示错误并可重试。

## 完成标准 (DoD)

- [x] 能从预设 + 想法触发出图并轮询到结果（mock API 覆盖）。
- [x] 出图尺寸匹配本机屏幕（≥2K）。
- [x] 结果在手机壳预览正确展示，可重生成。
- [x] 加载/失败态完善。

## 验证记录

- `PresetGrid` 使用 `/presets`
  提供的内置预设，支持加载/失败重试；主题、色调和氛围 chips 与受控想法输入一并组成 `text2img`
  请求。请求始终使用 `useDeviceSize()` 的 `targetWidth` / `targetHeight`。
- `useGenerate` 以 mutation 创建 job，并每秒轮询 `/jobs/:id`；`succeeded` / `failed`
  时停止轮询。网络轮询失败重试当前 job，服务端 job 失败则可重新创建同一请求。
- 成功结果使用 0008 `WallpaperPreview`，可切换锁屏/桌面并重生成；加载、网络错误和 job 失败均通过统一
  `ErrorState` 暴露重试入口。
- 移动端测试共覆盖 5 个套件、12 项断言，包含 API 请求、chips、结果预览和失败/重试 UI；后续全仓
  `vp check`、测试与三平台导出均通过。
- 未执行真实请求或真机操作：设置 `EXPO_PUBLIC_API_URL`
  后，仍需按「独立测试」完成一次 2K 成功出图、预览与失败重试的设备联调。SiliconFlow/R2 凭据未配置时不得把该步骤标记为已验证。
