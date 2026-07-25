# 0004 - r2-storage

> 模块：r2-storage | 优先级：4 | 依赖：0001 | 里程碑：M1 | 状态：外部 R2 验收待完成
>
> 对应 SPEC：「persist」「Cloudflare R2」

## 目标

封装 Cloudflare
R2 存取：把 Provider 返回的图片产物持久化到 R2，返回稳定可访问的图片地址，供入库与客户端展示。

## 范围

- In：`uploadFromUrl(url, key)`、`uploadBuffer(buf, key, contentType)`、`uploadFile(path, key, contentType)`、presigned
  PUT/GET URL、key 生成规则。
- Out：业务调用时机（在 0005 pipeline 的 persist 节点）。

## 涉及文件

- `apps/server/src/lib/r2.ts`（S3-compatible R2 客户端单例 + 上传/签名函数）
- `apps/server/src/config/env.ts`（追加
  `R2_ACCOUNT_ID/R2_BUCKET/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY/R2_ENDPOINT/R2_PUBLIC_BASE_URL`）
- `apps/server/scripts/try-r2.ts`

## 实现要点

- 依赖：`@aws-sdk/client-s3`、`@aws-sdk/s3-request-presigner`。
- key 规则：`wallpapers/{yyyymm}/{cuid}.png`，避免碰撞；可按用户/匿名设备前缀。
- `uploadBuffer`/`uploadFile`：把 Codex provider 返回的本地图片产物上传到 R2。
- `uploadFromUrl`：stream 下载外部临时图再上传到 R2，注意大图内存，优先流式。
- 访问策略二选一：
  - MVP 简化：R2 bucket 绑定 public/custom domain，返回公共 `resultImageUrl`。
  - 私有策略：对象保持私有，API 返回短期签名 GET URL；入库存 object key，展示时按需签名。
- 前端上传已有图片时，优先由后端发 presigned PUT URL，客户端直传 R2，然后把 object key 交回 API。

## 独立测试

- 脚本 `apps/server/scripts/try-r2.ts`：上传本地 buffer/file，打印 object key、公共 URL 或签名 GET
  URL；浏览器/`curl` 能访问且内容正确。
- 测试 presigned PUT：客户端或 curl 上传一张小图，再用签名 GET 读取。

## 完成标准 (DoD)

- [ ] 能把 Provider 图片产物落盘到 R2 并返回稳定可访问地址或 object key。
- [ ] 公共 URL 或签名 URL 可被客户端访问。
- [x] R2 配置全部来自 env，无硬编码密钥。

## 验证记录

- 离线测试覆盖 buffer/file/URL 流式上传、按月 key、公共 URL、签名 GET/PUT、内容类型和结构化错误。
- 实现使用 S3-compatible AWS SDK v3，R2 配置仅来自现有环境变量；`try:r2`
  可用于后续真实 bucket 验收。
- 当前工作区没有 R2 环境文件或 bucket 凭据，因此未运行真实上传、浏览器访问或 presigned
  URL 端到端测试；这两项保持未勾选。
