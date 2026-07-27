# 0010 — native-wallpaper-android

> 模块：native-wallpaper-android ｜ 优先级：10 ｜ 依赖：0007 ｜ 里程碑：M2 对应 SPEC：「原生壁纸模块」
>
> 状态：本地 Expo Module、权限插件和单元验证完成；Android development
> build 与真机系统壁纸验收待执行。

## 目标

自写本地 Expo 原生模块 `expo-wallpaper`（Kotlin），用 Android `WallpaperManager`
一键设置桌面/锁屏/两者。这是 Android 首发的核心差异化能力。

## 范围

- In：本地模块 `setWallpaper(uri, target)`、config plugin 注入 `SET_WALLPAPER` 权限、TS 类型。
- Out：iOS 实现（系统不支持，留 `存相册` 在 0011）、UI 接入（0011）。

## 涉及文件

- `modules/expo-wallpaper/`（`npx create-expo-module --local` 生成）
  - `android/src/main/java/.../ExpoWallpaperModule.kt`
  - `src/index.ts`（JS API：`setWallpaper(uri: string, target: 'home'|'lock'|'both')`）
  - `expo-module.config.json`、config plugin（加权限）
  - `apps/mobile/app.json`（plugins 增加该本地模块）

## 实现要点

- Kotlin：`WallpaperManager.getInstance(context)`；按 target 用 `FLAG_SYSTEM` / `FLAG_LOCK`
  / 二者 OR；`setBitmap(bitmap, null, true, which)`（API 24+）。
- 入参 `uri`：支持 `file://` / content uri
  / 远程已下载到本地的路径；先解码为 Bitmap（注意大图 OOM，必要时按屏缩放）。
- 权限：config plugin 向 `AndroidManifest.xml` 注入 `android.permission.SET_WALLPAPER`。
- **必须 development build**：`npx expo prebuild` + `expo run:android`（或 EAS dev
  build），不能用 Expo Go。
- 旧第三方库（`react-native-manage-wallpaper` 等）对 RN 0.85/新架构兼容性不确定，故自写薄封装。

## 独立测试

- 在一个临时 demo 按钮里：把一张本地/已下载图传给
  `setWallpaper(uri,'both')`，回桌面/锁屏确认壁纸**确实更换**。
- 分别测 `'home'` / `'lock'` / `'both'` 三种 target。
- 真机 + 模拟器各验证一次（部分模拟器锁屏壁纸支持有限，以真机为准）。

## 完成标准 (DoD)

- [ ] `npx expo run:android` 能编译含该原生模块的 dev build。
- [ ] `setWallpaper` 三种 target 均能真正改变系统壁纸。
- [ ] 权限经 config plugin 自动注入。

## 验证记录

- 已新增本地 `expo-wallpaper` Android Expo Module：Kotlin API 支持 `file://`、content
  URI 和本地路径，按 `home` / `lock` / `both` 调用
  `WallpaperManager`，并在解码时按屏幕尺寸下采样以降低 OOM 风险。
- `app.plugin.js` 幂等注入 `android.permission.SET_WALLPAPER`，并已在 `apps/mobile/app.json`
  注册；Android autolinking可发现 `expo.modules.wallpaper.ExpoWallpaperModule`。TypeScript
  API 会在调用原生层前校验 URI 与 target。
- Jest 覆盖三种 target、非法入参与权限去重；后续全仓 `vp check` 和移动端全部 29 项测试已通过。
- 尚未执行 `expo prebuild` /
  `expo run:android`，因此开发构建可编译性和三种 target 的实际系统壁纸效果仍需在 Android 模拟器和真机验收后才可勾选 DoD。
