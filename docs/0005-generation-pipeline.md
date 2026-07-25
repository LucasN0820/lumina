# 0005 - generation-pipeline

> 模块：generation-pipeline | 优先级：5 | 依赖：0002,0003,0004
> | 里程碑：M1 对应 SPEC：「LangGraph 图」

## 目标

用 LangGraph.js 把「预设 + 用户输入 + 设备尺寸」编排成一条图片流水线，产出最终壁纸并入库；图结构可扩展到已有图片编辑、扩图、超分和风格提取。

## 范围

- In：图节点 `resolvePreset -> enrichPrompt(可开关) -> route -> generate/edit -> persist`，以及
  `runWallpaperGraph(input): Promise<Wallpaper>`。
- Out：HTTP 任务封装（0006）、完整编辑 UI（0015）。

## 涉及文件

- `apps/server/src/graph/wallpaper.graph.ts`（图定义 + 编译）
- `apps/server/src/graph/nodes/*.ts`（各节点）
- `apps/server/src/graph/state.ts`（图状态类型）

## 实现要点

- 依赖：`@langchain/langgraph`、`@langchain/core`。
- 状态：`{ presetId?, userInputs{theme,tone,mood,idea}, mode, width, height, prompt?, negativePrompt?, sourceImageUrl?, providerResult?, wallpaperId? }`。
- 节点职责：
  1. `resolvePreset`：读 `Preset`（0002）+ 注入用户 chips/想法 + 设备 W x H -> 填好
     `prompt/negativePrompt/width/height`。
  2. `enrichPrompt`：用 Codex/OpenAI 文本能力把「一句话」扩写为专业 image prompt（env 开关
     `ENRICH_PROMPT`，关则跳过省额度）。
  3. `route`：按 `mode`(text2img|outpaint|edit|style|upscale) 分流；MVP 首先落地 text2img。
  4. `generate/edit`：调 `ImageProvider`（0003）。
  5. `persist`：Provider 产物 -> R2（0004）-> 写 `Wallpaper`（0002），回填 `status=succeeded`。
- **合规占位**：在 `route` 前 / `persist` 前留
  `// TODO: moderation / watermark / policy checks`，本期不实现。
- 失败处理：任一节点抛错 -> 捕获 -> `Wallpaper.status=failed` + `error`。
- Codex 额度防护：记录 job 开始/结束、失败原因、耗时；额度耗尽或达到本地限流时返回可理解错误。

## 独立测试

- 脚本 `apps/server/scripts/try-graph.ts`：构造
  `{presetId, userInputs, width:1080, height:2400, mode:'text2img'}` -> `runWallpaperGraph`
  -> 断言返回 `Wallpaper.status==='succeeded'` 且 `resultImageUrl` 可访问、尺寸接近目标。
- 用 mock provider（0003）跑通无网络路径，验证图编排与入库逻辑。

## 完成标准 (DoD)

- [ ] 图能端到端跑出一张壁纸并入库（status=succeeded）。
- [ ] `enrichPrompt` 可通过 env 开关。
- [ ] route 已为 outpaint/edit/style/upscale 预留分支与合规 TODO。
- [ ] 失败路径正确置 failed 并记录 error。
