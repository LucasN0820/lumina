# 0017 - Lingui 国际化调研

> 模块：i18n | 状态：已调研，待实施 | 日期：2026-07-29

## 目标

在不改变服务端 API 的前提下，为 `apps/landing`（Next.js App Router）与 `apps/mobile` （Expo SDK
56）引入 Lingui 国际化。所有共享的国际化资产必须集中在独立工作区包 `packages/i18n`。

首发支持英文（`en`，默认）与简体中文（`zh-CN`）。

## 已确认的产品决策

- Landing 使用显式语言路由：`/en` 与 `/zh-CN`。访问 `/` 时按 `Accept-Language`
  重定向，不能匹配时进入 `/en`。
- Mobile 首次按系统语言选择：中文对应 `zh-CN`，其他语言回退
  `en`。Profile 提供应用内语言选择，用户显式选择以 `expo-secure-store` 本地持久化并立即生效。
- 第一阶段不把语言偏好同步到账号；Landing 以 URL 为准，Mobile 以本地偏好为准。
- 迁移两个应用全部静态、面向用户的文案，包括 metadata、无障碍标签、Alert、Toast、错误与空状态。用户输入、服务端返回内容和图像生成提示词不纳入此阶段。
- `.po` 是提交到仓库的翻译源文件；编译生成的 TypeScript/JavaScript 目录不提交，由本地与 CI 生成。
- CI 对 `zh-CN` 使用严格编译；新增静态文案必须同时具备中文译文。
- 消息使用显式、按产品域命名的 ID：`landing.hero.title`、
  `mobile.library.empty.title`、`common.action.cancel`。仅真正跨端复用的文字使用 `common.*`。
- `packages/i18n`
  共享语言类型、目录、Lingui 配置与按应用加载器；各应用保留自己的 Provider 与语言切换 UI，因为 Next 服务端请求和 Expo 异步 Secure
  Store 生命周期不同。

## 现状

- `apps/landing` 为 Next.js 16.2 的 App Router 应用，目前只有中文主文案加少量英文辅助文字，根路由是
  `/`，`<html lang>` 固定为 `zh-CN`。
- `apps/mobile` 使用 Expo SDK 56、Expo Router、React Native 0.85 与 Secure Store；目前未安装
  `expo-localization`，也未配置 Metro 或 Babel 的 Lingui 宏。
- 根 `package.json` 已声明 `packages/*` workspace，但仓库尚未有 `packages/` 目录。
- CI 当前依次运行 `vp check`、测试和构建；应在这些步骤前生成并校验目录。

## 推荐架构

```text
packages/i18n/
├── package.json                         # @lumina/i18n
├── lingui.config.ts                     # 集中提取与编译配置
├── src/
│   ├── locales.ts                       # Locale 类型、解析、默认与回退
│   ├── landing.ts                       # Landing 的目录加载与服务器 i18n 工厂
│   └── mobile.ts                        # Mobile 目录加载、初始 locale 辅助函数
└── locales/
    ├── en/
    │   ├── landing.po                   # 提交
    │   └── mobile.po                    # 提交
    └── zh-CN/
        ├── landing.po                   # 提交
        └── mobile.po                    # 提交
```

`lingui.config.ts` 以仓库根为 `rootDir`，分别扫描 `apps/landing/src` 和
`apps/mobile/src`，将结果写入 `packages/i18n/locales/{locale}/landing.po` 与
`packages/i18n/locales/{locale}/mobile.po`。每端独立目录避免无关文案相互耦合，加载时也无需将另一端的目录打入包。

使用 `sourceLocale: 'en'`、`locales: ['en', 'zh-CN']`、PO 格式和显式 ID。目录可配置多个
`include`/`path` 映射，Lingui 会按配置扫描源码并生成每种 locale 的目录。

## Landing 实施设计

1. 将 `src/app` 页面与布局迁入 `src/app/[locale]`，新增根 middleware：
   - `/` 解析 `Accept-Language` 并重定向到支持的 locale；
   - 非语言前缀路径同样补上 locale；
   - 不处理 `/_next`、静态资源和 API 路径。
2. 在 `[locale]/layout.tsx` 中校验 locale、设置
   `<html lang>`、生成语言匹配的 metadata 和 alternate/hreflang 链接；实现 `generateStaticParams`
   以静态生成 `en` 和 `zh-CN`。
3. 接入 `@lingui/swc-plugin` 至 `apps/landing/next.config.ts`，使 `Trans`、`t`、`msg`
   等宏可在 Next 构建时转换。
4. 每个 locale 的请求创建独立 i18n 实例，在服务端调用 `setI18n`；如出现客户端组件，则通过
   `I18nProvider` 传递可序列化的初始 locale/messages，而不是传递 i18n 实例本身。
5. 替换 Landing 的所有可见内容、辅助文本和 metadata。由于当前源文案多为中文，必须撰写完整英文源文案，而不能将中文作为
   `en` 的 source message。
6. 语言切换使用目标 locale URL 导航，避免客户端动态切换后服务端渲染内容陈旧。

## Mobile 实施设计

1. 通过 Expo 的 SDK 56 命令安装 `expo-localization`，并在 `app.json` 加入 config
   plugin，声明 iOS 与 Android 的 `en`、`zh-CN` 支持语言。
2. 在根 `_layout.tsx` 由 Mobile i18n Provider 包裹现有 Clerk、Query 与主题 Provider。Provider：
   - 先异步读取 Secure Store 的显式偏好；
   - 没有偏好时读取 `expo-localization` 的首选 locale；
   - 加载相应目录后再渲染已国际化的导航树；
   - 将显式切换持久化，并通过更新 i18n context 使当前界面立即重渲染。
3. 在 Profile 加入 `English` / `简体中文` 选择器；不新增 server/Clerk 字段。
4. 使用 `Trans` 渲染 React Native 文本，使用 `useLingui` 的 `t` 生成 `TextInput`、
   `Alert`、`accessibilityLabel` 等需要字符串的属性。业务逻辑文件中的惰性文案使用 `msg`。
5. 翻译 tabs、创建、编辑、图库、登录、保存/分享、加载与错误状态；为会因翻译变长的按钮和卡片验证布局。

## 依赖与构建流程

- `@lumina/i18n`：运行时使用 `@lingui/core` 与 `@lingui/react`，并暴露语言定义和目录加载器。
- 工作区开发依赖：`@lingui/cli`、`@lingui/format-po`、`@lingui/swc-plugin`（Landing）以及
  `@lingui/babel-plugin-lingui-macro`（Mobile）。应用源码直接使用 Lingui 的宏导入，避免自定义 wrapper 破坏提取器识别。
- 根 scripts：
  - `i18n:extract`：更新两个应用的 `.po`；
  - `i18n:compile`：生成 TypeScript 目录；
  - `i18n:check`：提取后检查受版本控制的 PO 没有差异，再运行
    `lingui compile --strict --typescript`。
- 将生成的 `packages/i18n/locales/**/*.ts`（及其声明文件）加入 `.gitignore`，不忽略 `.po`。
- CI 在 `vp check` 前执行 `i18n:check`；测试和构建之前应确保 `i18n:compile` 已运行。

## 验证

- 单元测试：locale 解析、`zh`/`zh-CN` 匹配和 `en` 回退；Mobile 的 Secure
  Store 优先级与系统 locale 回退。
- Landing：验证 `/` 的重定向、两个静态 locale、`html[lang]`、metadata/hreflang 与语言切换链接。
- Mobile：mock `expo-localization` 与 Secure
  Store；验证选择器持久化、Provider 重新渲染，以及代表性的中英文 UI 文案和 accessibility label。
- 运行 `bun run check`、`bun run test`、`bun run build`。新增 Metro/Babel 配置后以
  `bun --filter=@lumina/mobile run start -- --clear` 验证清空 Metro 缓存后的开发启动。

## 风险与前置验证

- Mobile 已启用 React Compiler。Lingui 宏转换必须先于 React Compiler；实现开始时先用一个最小 `Trans`
  组件验证 Expo 的 Babel 插件顺序。若不满足，调整 `babel.config.js` 中 Lingui
  macro 的位置后再进行全量迁移。
- Lingui 的 Metro transformer 可直接导入
  `.po`，但官方仍标记为 beta。本方案使用预编译目录，可避免将 beta transformer、额外 Metro
  resolver 和工作区文件监视引入生产路径。
- 当前 Landing 设计是中英同屏展示；迁移后每个 locale 页面只展示该语言，需在视觉验收中重新检查标题、卡片、CTA 和设备预览的折行。

## 参考资料

- [Lingui 安装与宏/编译器配置](https://lingui.dev/installation)
- [Lingui monorepo 指南](https://lingui.dev/guides/monorepo)
- [Lingui 配置与目录](https://lingui.dev/ref/conf)
- [Lingui React Server Components / Next App Router](https://lingui.dev/tutorials/react-rsc)
- [Lingui React Native / Expo](https://lingui.dev/tutorials/react-native)
- [Lingui Metro transformer](https://lingui.dev/ref/metro-transformer)
- [Lingui 显式与生成消息 ID](https://lingui.dev/guides/explicit-vs-generated-ids)
- [Expo Localization 指南](https://docs.expo.dev/guides/localization/)
