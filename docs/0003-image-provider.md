# 0003 - image-provider

> 模块：image-provider | 优先级：3 | 依赖：0001 | 里程碑：M0/M1
> | 状态：外部 Spike 待完成对应 SPEC：「Provider 抽象」「SiliconFlow FLUX.2 Flex image provider」

## 目标

定义统一图片能力接口 `ImageProvider`，并实现使用 SiliconFlow 聚合平台的
`SiliconFlowImageProvider`。服务端以 `black-forest-labs/FLUX.2-pro` 作为默认高质量文生图模型，调用
`POST /v1/images/generations`，立即将供应商一小时有效的结果 URL 持久化到 Cloudflare R2。

## 范围

- In：`ImageProvider` 接口、`SiliconFlowImageProvider`、mock
  provider、provider 工厂、R2 落盘适配、FLUX.2 Flex 文生图 spike。
- Out：LangGraph 编排（0005）、生成 API（0006）、完整编辑 UI（0015）。
- 本期仅正式实现 `textToImage`；`editImage`、`outpaint`、`upscale`、`extractStyle`
  在确认各自SiliconFlow 参数契约前返回结构化“不支持”错误，不能伪装成已完成能力。

## 涉及文件

- `apps/server/src/providers/types.ts`：`ImageProvider`、`ImageSpec`、`ImageResult` 类型。
- `apps/server/src/providers/siliconflow.ts`：SiliconFlow HTTP 实现。
- `apps/server/src/providers/mock.ts`
- `apps/server/src/providers/index.ts`：按 env 选择 provider。
- `apps/server/src/lib/r2.ts`：下载供应商临时 URL 并持久化到 R2。
- `apps/server/scripts/try-siliconflow-image.ts`：真实 API spike。

## 实现要点

- 服务端向 `https://api.siliconflow.com/v1/images/generations` 发起 Bearer Token 请求；API Key 只从
  `SILICONFLOW_API_KEY` 读取，绝不进入 Expo 客户端或日志。
- 默认模型为 `black-forest-labs/FLUX.2-pro`；`SILICONFLOW_IMAGE_MODEL` 可显式覆盖，且不做静默降级。
- 请求固定 `batch_size: 1`、`output_format: "png"`，将 `ImageSpec`
  的 prompt、负向 prompt、尺寸、seed/quality 映射到平台请求。
- 当前公开 API 文档列举的尺寸与模型公告的“自定义尺寸”表述不完全一致。实现不得假定 `1080x2400`
  一定可用：真实 spike 先使用文档列举的
  `576x1024`，并记录供应商返回的实际尺寸；设备精确尺寸能力待持有 API Key 后单独验收。
- 平台响应的 `images[].url`
  只在短时间内有效。Provider 只返回供应商 URL 作为临时产物；生成管线必须立刻通过 R2 存储模块下载、校验
  `image/*` 内容类型后写入对象存储，客户端只拿 R2 URL。
- `providerTask` 使用供应商返回的 seed 或请求关联标识；记录模型、seed、推理耗时和实际尺寸。
- `401` 映射为 `AUTHENTICATION_FAILED`，`429` 为 `RATE_LIMITED`，`503` 为
  `PROVIDER_UNAVAILABLE`，`504`/Abort 为 `TIMEOUT`，其他非成功响应为 `TOOL_FAILED`。

## 独立测试

- 离线单元测试：请求体构造、成功响应、临时 URL 校验、超时、401/429/503/504 错误映射、未支持的编辑操作、provider 工厂与 mock
  provider。
- `apps/server/scripts/try-siliconflow-image.ts`：要求显式
  `SILICONFLOW_PROVIDER_ENABLED=true`，用真实 API Key 调用 FLUX.2 Flex 生成 `576x1024`
  PNG；验证返回的 URL 可被 Node 下载。该脚本不自动运行，防止无意消耗额度。
- 0004 完成真实 R2 验收后，增加端到端 spike：生成 -> 下载临时 URL -> R2 -> 读取 R2 URL。

## 完成标准 (DoD)

- [x] `getImageProvider()` 能按 env 返回 SiliconFlow 或 mock provider。
- [x] `textToImage` 能调用 `black-forest-labs/FLUX.2-pro` 并返回可持久化的临时图像 URL。
- [ ] 供应商短期 URL 的下载和 R2 持久化链路经真实凭据验证。
- [x] 不支持的编辑类操作返回结构化错误。
- [x] 认证、限流、过载、超时和供应商失败能结构化抛出。
- [x] Codex SDK、个人登录态和相关 spike 已从图片生成路径移除。

## 验证记录

- 已调研 SiliconFlow `POST /v1/images/generations`：使用 Bearer API Key，返回 `images[].url`、
  `timings` 和 `seed`，且生成 URL 需在一小时内下载并持久化。
- 已确认 SiliconFlow 提供
  `black-forest-labs/FLUX.2-pro`；平台将其定位为可调推理步数与提示词遵循度、偏重文字和细节表现的高质量模型。
- 尚未配置
  `SILICONFLOW_API_KEY`，因此真实模型与 R2 联调仍是 M0 外部验收项；离线实现和测试完成后，必须保持本模块为待验收状态，不能错误标为完成。
