# 0015 - image-edit

> 模块：image-edit | 优先级：15 | 依赖：0005,0009 | 里程碑：M4
> 对应 SPEC：「已有图功能」

## 目标
基于已有图片的三类能力：**优化（超分/增强）/ 扩图（outpaint 填满本机比例）/ 提取风格（-> 存为自定义预设）**。后端在 LangGraph 增加分支，前端加选图与编辑入口。

## 范围
- In：图片选择上传；pipeline 的 `outpaint`/`edit`/`style`/`upscale` 分支落地；自定义预设落库与在创作页可用。
- Out：批量编辑、复杂蒙版编辑、专业图层编辑器。

## 涉及文件
- 后端：`server/src/graph/nodes/outpaint.ts`、`edit.ts`、`style.ts`、`upscale.ts`；`providers/codex.ts` 补齐对应方法；`routes/edit.ts`；`Preset` 写入自定义预设。
- 前端：`src/features/edit/`（`ImagePickerEntry.tsx`、`EditModePicker.tsx`、`StyleToPresetForm.tsx`）、`src/app/(tabs)/index.tsx` 增加「从已有图」入口。

## 实现要点
- 选图：`expo-image-picker` 选相册图 -> 后端签发 R2 presigned PUT URL -> 客户端直传 -> 得到 `sourceImageUrl` 或 object key。
- 扩图：调用 `ImageProvider.outpaint`，要求 Codex 按目标手机比例扩展画布并保持主体自然。
- 优化/超分：调用 `ImageProvider.upscale` 或 `editImage`，目标是输出长边/短边满足 2K+ 预览需求；如果 Codex 工具不支持精确超分，记录实际尺寸并在 UI 中提示。
- 编辑：调用 `ImageProvider.editImage`，支持用户输入局部/整体修改说明。
- 提取风格：调用 `ImageProvider.extractStyle`，让 Codex 返回结构化风格描述、色彩、构图、材质关键词，生成 `promptTemplate` + `styleRefUrl`，写 `Preset(isBuiltIn=false, ownerUserId)`；之后在创作页（0009）作为预设直接选用。
- route（0005）把这些分支接上。

## 独立测试
- 后端脚本：给定一张源图 -> 分别跑 outpaint / upscale / edit / extractStyle，断言产物（比例正确 / 尺寸满足预期 / 生成可用的自定义 Preset）。
- 前端：选相册图 -> 选模式 -> 出结果；风格提取后在创作页能选到该自定义预设再次出图。

## 完成标准 (DoD)
- [ ] 扩图能把已有图填满本机屏幕比例。
- [ ] 优化/超分能产出满足 2K+ 使用目标的图片。
- [ ] 图片编辑能基于用户说明生成新图。
- [ ] 风格提取生成自定义预设并可在创作页复用。
