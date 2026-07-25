# 0007 — frontend-foundation

> 模块：frontend-foundation ｜ 优先级：7 ｜ 依赖：无（现有 Expo 工程） ｜ 里程碑：M1 对应 SPEC：「前端设计」「技术栈」

## 目标

搭好 App 基础设施：底部 Tabs 导航、主题、React Query Provider、类型化 API
client。坚持 native-first（`@expo/ui`），不引入 nativewind。

## 范围

- In：Tabs 路由骨架、主题/字体、`QueryClientProvider`、`apps/mobile/src/lib/api.ts`（fetch 封装 + 基础 hooks）、设备尺寸工具。
- Out：各页面具体内容（0009/0012）、鉴权头（0014 接入）。

## 涉及文件

- `apps/mobile/src/app/_layout.tsx`（包 `QueryClientProvider` + 主题 + 字体）
- `apps/mobile/src/app/(tabs)/_layout.tsx`、`apps/mobile/src/app/(tabs)/index.tsx`(创作占位)、`library.tsx`、`profile.tsx`
- `apps/mobile/src/lib/api.ts`（`apiFetch`、baseURL 来自
  `expo-constants`/env）、`apps/mobile/src/lib/queryClient.ts`
- `apps/mobile/src/lib/useDeviceSize.ts`（用 `Dimensions`/`expo-device` 推算目标壁纸 W×H）
- 复用
  `example/src/components`(ThemedText/View)、`example/src/hooks`(use-theme)、`example/src/constants/theme.ts`

## 实现要点

- 依赖：`@tanstack/react-query`（必）、`zustand`（可选，轻状态）。
- API baseURL 走 env（开发指向本机后端 IP；真机用局域网 IP 而非 localhost）。
- Tabs：创作 / 壁纸库 / 我的，icon 用 `expo-symbols`；可叠 `expo-glass-effect` 提升质感。
- `useDeviceSize`：返回设备像素宽高与推荐出图尺寸（≥2K，按屏比）。
- 全局错误/加载态约定，供各页面复用。

## 独立测试

- `expo start` 运行（此阶段无原生模块，Expo Go 或 dev build 均可），三个 Tab 可切换、主题/字体生效。
- 用 React Query 调一个后端 `/health` 或 `/presets`（0006 就绪后）渲染出列表，验证 API client 连通。
- 打印 `useDeviceSize()` 结果，确认推荐尺寸合理。

## 完成标准 (DoD)

- [ ] 三 Tab 导航可用，主题/字体正常。
- [ ] `QueryClientProvider` 就位，能成功请求一个后端接口。
- [ ] `apiFetch` 统一处理 baseURL/JSON/错误。
- [ ] `useDeviceSize` 返回正确的目标出图尺寸。
