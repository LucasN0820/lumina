# 0003 - image-provider

> 模块：image-provider | 优先级：3 | 依赖：0001 | 里程碑：M0/M1 对应 SPEC：「Provider 抽象」「Codex
> image provider」

## 目标

定义统一图片能力接口 `ImageProvider`，并实现 `CodexImageProvider`。Provider 通过 `@openai/codex-sdk`
调用受信任服务端上的 Codex 代理，使用现有 Codex
Plus 额度完成图片生成、编辑、扩图、超分或风格提取能力。

## 范围

- In：`ImageProvider` 接口、`CodexImageProvider`、mock provider、provider 工厂（按 env 选择）。
- Out：LangGraph 编排（0005）、R2 落盘（0004）、完整编辑 UI（0015）。

## 涉及文件

- `apps/server/src/providers/types.ts`（`ImageProvider`、`ImageSpec`、`ImageResult` 类型）
- `apps/server/src/providers/codex.ts`（Codex SDK 实现）
- `apps/server/src/providers/mock.ts`
- `apps/server/src/providers/index.ts`（工厂：`getImageProvider()`）
- `apps/server/scripts/try-codex-image.ts`（图片能力 spike）

## 实现要点

- 依赖：`@openai/codex-sdk`。
- 接口示例：`textToImage(spec): Promise<ImageResult>`；预留并逐步实现
  `editImage(spec)`、`outpaint(spec)`、`upscale(spec)`、`extractStyle(spec)`。
- `ImageSpec`：`{ prompt, negativePrompt?, width, height, mode, sourceImageUrl?, styleRefUrl?, quality? }`。
- `ImageResult`：`{ imageBytes | imagePath | imageUrl, width?, height?, providerTask, metadata? }`。
- 先做 `apps/server/scripts/try-codex-image.ts`，验证 Codex
  SDK 能稳定返回可由 Node 读取的图片产物（文件、base64、blob 或 URL）。这一步是 M1 的前置门槛。
- Provider 给 Codex 的指令必须要求机器可解析结果，例如 JSON：`{ "kind":"image_result", "path":"...", "width":1080, "height":2400 }`。
- `providerTask` 存 Codex thread/run id，便于排错。
- 不把个人 Codex 会话暴露给客户端；所有 Codex 调用只能发生在受信任后端。
- 目标尺寸支持自定义手机比例（如 1080x2400、1440x3200）。如果 SDK/工具不支持精确尺寸，Provider 必须记录实际尺寸并让后续节点决定是否重试或走编辑/裁剪。

## 独立测试

- `apps/server/scripts/try-codex-image.ts`：用真实 Codex 登录/额度生成一张 `1080x2400`
  壁纸，确认返回产物可被 Node 读取并上传到 R2。
- 无 Codex 权限或离线时用 mock provider 返回固定占位图，保证下游模块可测试。

## 完成标准 (DoD)

- [ ] `getImageProvider()` 能按 env 返回 Codex 或 mock provider。
- [ ] `textToImage` 能返回可持久化的图片产物。
- [ ] Codex thread/run id 被记录到 `providerTask`。
- [ ] 超时、额度耗尽、工具失败等错误能结构化抛出。
