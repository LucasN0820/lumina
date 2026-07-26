# 0007 — frontend-foundation

> 模块：frontend-foundation ｜ 优先级：7 ｜ 依赖：无（现有 Expo 工程） ｜ 里程碑：M1 对应 SPEC：「前端设计」「技术栈」
>
> 状态：本地实现、测试与三平台导出完成；Expo Go 真机与局域网后端手动联调待执行。

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
- `apps/mobile/src/lib/useDeviceSize.ts`（用响应式窗口尺寸和像素比推算目标壁纸 W×H）
- `apps/mobile/src/components/`、`apps/mobile/src/constants/theme.ts`、`apps/mobile/src/hooks/`
  （主题、可复用文本/容器、加载/错误状态与健康检查 query）
- `apps/mobile/.env.example`（真机使用局域网 API URL）

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

- [x] 三 Tab 导航可用，主题/系统字体正常。
- [x] `QueryClientProvider` 就位；配置 `EXPO_PUBLIC_API_URL` 后通过 React Query 请求 `/health`。
- [x] `apiFetch` 统一处理 baseURL、JSON 与结构化服务端错误。
- [x] `useDeviceSize` 返回保留屏幕比例、长边不小于 2K 的目标出图尺寸。

## 验证记录

- 移动端 Jest 覆盖 API
  baseURL 优先级、成功 JSON 响应、结构化 HTTP 错误，以及常见与低密度屏幕的壁纸尺寸推算（5 项测试）。
- `bun run check` 通过格式、lint 与类型检查；`bun --filter=@lumina/mobile run build`
  成功导出 iOS、Android 与 Web，包含 `/`、`/library`、`/profile` 三个 Tab 路由。
- 通过 `.env.example` 提供局域网 API URL 示例；不会为真机回退到 `localhost`。
- 未进行 Expo Go/真机人工操作：配置真实 `EXPO_PUBLIC_API_URL` 后，应执行一次三个 Tab 切换与
  `/health` 联调，以验证设备网络可达性。
