# 0011 — apply-share-save

> 模块：apply-share-save ｜ 优先级：11 ｜ 依赖：0010,0009 ｜ 里程碑：M2 对应 SPEC：「应用/分享」
>
> 状态：本地操作链路和 mock 验证完成；原生开发构建、系统相册与分享面板仍待设备验收。

## 目标

把出图结果接上「一键应用（Android）/ 存相册 / 系统分享」，并为 iOS 提供降级路径（仅存相册 + 引导）。

## 范围

- In：应用壁纸（调 0010）、存相册（`expo-media-library`）、分享（`expo-sharing`）、target 选择 UI（桌面/锁屏/两者）。
- Out：原生设壁纸实现本身（0010）。

## 涉及文件

- `apps/mobile/src/features/apply/ApplySheet.tsx`（底部操作：应用/分享/保存 + target 选择）
- `apps/mobile/src/features/apply/useApplyWallpaper.ts`（先下载远程图到本地 → 调 `expo-wallpaper`）
- `apps/mobile/src/features/apply/useSaveAndShare.ts`

## 实现要点

- 应用前需把 R2 远程图**下载到本地文件**（`expo-file-system`）再交给原生模块。
- 权限：`expo-media-library` 存相册需相册写权限；首次申请并处理拒绝态。
- 分享：`expo-sharing.shareAsync(localUri)` 调系统分享面板。
- 平台分支：iOS 隐藏「一键应用」，仅显示「存相册」并提示去系统设置应用；Android 显示完整 target 选择。
- 依赖新增：`expo-media-library`、`expo-sharing`、`expo-file-system`（如未装）。

## 独立测试

- Android dev build：出一张图 →
  ApplySheet 选「两者」→ 桌面/锁屏确认更换；再测「存相册」（相册可见）与「分享」（面板弹出）。
- iOS（如有设备）：确认仅「存相册 + 引导」，无报错。

## 完成标准 (DoD)

- [ ] Android 可从结果页一键设桌面/锁屏/两者。
- [ ] 存相册、系统分享均可用，权限处理完善。
- [ ] iOS 正确降级为存相册 + 引导。

## 验证记录

- 新增 `ApplySheet`、下载、应用、存相册和分享 hooks；结果预览页可打开该操作面板。远程图片先由 SDK
  56 的 `File.downloadFileAsync` 下载到缓存，再交给 Android 原生模块、Media Library 或系统分享。
- Android 提供桌面、锁屏、两者三个 target；保存前请求写入权限并展示拒绝错误，分享会检测系统能力。iOS 隐藏一键应用与分享入口，仅保留保存及去系统设置的说明。
- 新增
  `expo-file-system`、`expo-media-library`、`expo-sharing`，Jest 覆盖下载后应用、保存、分享、权限拒绝及 iOS 降级；后续移动端测试共 12 个套件、29 项断言通过。
- Android development
  build、真实相册权限、系统分享面板和实际壁纸更换未在本机设备执行，故 DoD 保持待设备验收。
