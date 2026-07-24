# 0008 — wallpaper-preview

> 模块：wallpaper-preview ｜ 优先级：8 ｜ 依赖：0007 ｜ 里程碑：M1
> 对应 SPEC：「预览组件」

## 目标
做一个纯展示组件：把任意图片合成进「手机壳 mockup」，叠加状态栏/时钟，支持 `锁屏 / 桌面` 切换。可用静态图独立测试，与出图逻辑解耦。

## 范围
- In：`<WallpaperPreview image lockScreen />` 组件、状态栏/时钟/锁屏元素 overlay、锁屏/桌面切换。
- Out：出图、应用壁纸（0011）。

## 涉及文件
- `src/components/WallpaperPreview.tsx`
- `src/components/preview/StatusBarOverlay.tsx`、`LockClockOverlay.tsx`、`HomeIconsOverlay.tsx`（可选）

## 实现要点
- 用 `expo-image` 渲染底图，按手机比例容器裁切（cover）。
- overlay：状态栏（时间/信号/电量）+ 锁屏大时钟；桌面态可叠几个占位图标网格。
- `mode` 切换锁屏/桌面时切换 overlay。
- 避免渐变把状态栏糊掉；overlay 用半透明前景色，自适应深浅底图（可选：根据图片亮度调字色）。
- 组件接收 `width/height`（来自 0007 `useDeviceSize`）保证比例真实。

## 独立测试
- 临时在创作 Tab 或单独 demo 路由放一张本地静态图，渲染 `WallpaperPreview`，切换锁屏/桌面观察 overlay 正确。
- 用不同比例图片验证 cover 裁切无拉伸。

## 完成标准 (DoD)
- [ ] 静态图即可渲染出「手机壳 + 状态栏 + 时钟」预览。
- [ ] 锁屏/桌面切换正常。
- [ ] 不依赖网络/出图逻辑，可单独测试。
