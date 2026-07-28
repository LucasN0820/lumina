import {
  ImageProviderError,
  type ExtractedStyle,
  type ImageProvider,
  type ImageResult,
  type ImageSpec,
} from './types.js';

export const DEFAULT_CODEX_IMAGE_MODEL = 'gpt-image-2';
export const DEFAULT_CODEX_STYLE_MODEL = 'gpt-5.6';
const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

type ImageResponse = {
  data?: Array<{ b64_json?: unknown; revised_prompt?: unknown }>;
};

type ResponseApiResult = {
  id?: unknown;
  output_text?: unknown;
  output?: Array<{ content?: Array<{ text?: unknown; type?: unknown }> }>;
};

export type CodexImageProviderOptions = {
  apiKey: string;
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  imageModel?: string;
  styleModel?: string;
  timeoutMs: number;
};

/**
 * GPT Image implementation used for existing-image operations. The name is
 * retained from the product design document; it talks to OpenAI's Image and
 * Responses APIs, not the local Codex application.
 */
export class CodexImageProvider implements ImageProvider {
  private readonly fetcher: typeof globalThis.fetch;
  private readonly imageModel: string;
  private readonly styleModel: string;

  constructor(private readonly options: CodexImageProviderOptions) {
    validateOptions(options);
    this.fetcher = options.fetch ?? globalThis.fetch;
    this.imageModel = options.imageModel ?? DEFAULT_CODEX_IMAGE_MODEL;
    this.styleModel = options.styleModel ?? DEFAULT_CODEX_STYLE_MODEL;
  }

  async textToImage(spec: ImageSpec): Promise<ImageResult> {
    validateSpec(spec);
    return this.createImage(spec, spec.prompt);
  }

  async editImage(spec: ImageSpec): Promise<ImageResult> {
    return this.editSourceImage(spec, `Edit the supplied image. ${spec.prompt}`);
  }

  async outpaint(spec: ImageSpec): Promise<ImageResult> {
    return this.editSourceImage(
      spec,
      `Expand the supplied image naturally to a ${spec.width} by ${spec.height} wallpaper canvas. ` +
        `Preserve the subject, lighting, and style; extend the surrounding scene without cropping it. ${spec.prompt}`,
    );
  }

  async upscale(spec: ImageSpec): Promise<ImageResult> {
    return this.editSourceImage(
      spec,
      `Create a high-resolution ${spec.width} by ${spec.height} version of the supplied image. ` +
        `Preserve composition and fine details, improve clarity without inventing text or watermarks. ${spec.prompt}`,
    );
  }

  async extractStyle(spec: ImageSpec): Promise<ImageResult> {
    validateSourceImageSpec(spec);
    const response = await this.request('/responses', {
      body: JSON.stringify({
        input: [
          {
            content: [
              {
                text:
                  'Analyze the visual style of this image. Return JSON only with name, category, ' +
                  'colorKeywords, compositionKeywords, materialKeywords, and promptTemplate. ' +
                  'Each keyword field must be an array of concise strings. promptTemplate must be ' +
                  'a reusable image-generation prompt and include {{idea}} as the subject placeholder.',
                type: 'input_text',
              },
              { image_url: spec.sourceImageUrl, type: 'input_image' },
            ],
            role: 'user',
          },
        ],
        model: this.styleModel,
        text: {
          format: {
            name: 'wallpaper_style',
            schema: styleSchema,
            strict: true,
            type: 'json_schema',
          },
        },
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const payload = await readJson<ResponseApiResult>(response, 'style extraction');
    const style = parseStyle(extractOutputText(payload));

    return {
      providerTask: `openai:${asString(payload.id) ?? 'style'}`,
      style,
    };
  }

  private async createImage(spec: ImageSpec, prompt: string): Promise<ImageResult> {
    const dimensions = toSupportedDimensions(spec.width, spec.height);
    const response = await this.request('/images/generations', {
      body: JSON.stringify({
        model: this.imageModel,
        output_format: 'png',
        prompt,
        quality: spec.quality === 'high' ? 'high' : 'medium',
        size: formatDimensions(dimensions),
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    return toImageResult(await readJson<ImageResponse>(response, 'image generation'), dimensions);
  }

  private async editSourceImage(spec: ImageSpec, prompt: string): Promise<ImageResult> {
    validateSourceImageSpec(spec);
    const source = await this.downloadSource(spec.sourceImageUrl as string);
    const dimensions = toSupportedDimensions(spec.width, spec.height);
    const form = new FormData();
    form.set('model', this.imageModel);
    form.set('prompt', prompt);
    form.set('quality', spec.quality === 'high' ? 'high' : 'medium');
    form.set('size', formatDimensions(dimensions));
    form.set('output_format', 'png');
    const sourceBytes = Uint8Array.from(source.bytes);
    form.append(
      'image[]',
      new Blob([sourceBytes.buffer], { type: source.mimeType }),
      'source-image',
    );

    const response = await this.request('/images/edits', { body: form, method: 'POST' });
    return toImageResult(await readJson<ImageResponse>(response, 'image edit'), dimensions);
  }

  private async downloadSource(
    sourceImageUrl: string,
  ): Promise<{ bytes: Uint8Array; mimeType: string }> {
    let response: Response;
    try {
      response = await this.fetcher(sourceImageUrl);
    } catch (error) {
      throw new ImageProviderError(
        'INVALID_ARTIFACT',
        'Could not download the source image.',
        error,
      );
    }

    if (!response.ok) {
      throw new ImageProviderError(
        'INVALID_ARTIFACT',
        `Could not download the source image: HTTP ${response.status}.`,
      );
    }
    const mimeType = response.headers.get('content-type')?.split(';', 1)[0] ?? 'image/png';
    if (!mimeType.startsWith('image/')) {
      throw new ImageProviderError('INVALID_ARTIFACT', 'The uploaded source is not an image.');
    }

    return { bytes: new Uint8Array(await response.arrayBuffer()), mimeType };
  }

  private async request(path: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);
    try {
      const headers = new Headers(init.headers);
      headers.set('Authorization', `Bearer ${this.options.apiKey}`);
      const response = await this.fetcher(`${this.options.baseUrl ?? DEFAULT_BASE_URL}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      });
      if (!response.ok) {
        throw await mapOpenAIError(response);
      }
      return response;
    } catch (error) {
      if (error instanceof ImageProviderError) {
        throw error;
      }
      throw new ImageProviderError(
        controller.signal.aborted ? 'TIMEOUT' : 'PROVIDER_UNAVAILABLE',
        controller.signal.aborted
          ? 'OpenAI image request timed out.'
          : 'OpenAI image request failed.',
        error,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

const styleSchema = {
  additionalProperties: false,
  properties: {
    category: { type: 'string' },
    colorKeywords: { items: { type: 'string' }, type: 'array' },
    compositionKeywords: { items: { type: 'string' }, type: 'array' },
    materialKeywords: { items: { type: 'string' }, type: 'array' },
    name: { type: 'string' },
    promptTemplate: { type: 'string' },
  },
  required: [
    'name',
    'category',
    'colorKeywords',
    'compositionKeywords',
    'materialKeywords',
    'promptTemplate',
  ],
  type: 'object',
};

function toSupportedDimensions(width: number, height: number): { height: number; width: number } {
  const ratio = width / height;
  const longEdge = Math.min(3840, Math.max(2048, Math.max(width, height)));
  const shorterEdge = Math.round(longEdge / Math.max(ratio, 1 / ratio) / 16) * 16;
  const longEdgeRounded = Math.round(longEdge / 16) * 16;
  const [outputWidth, outputHeight] =
    width >= height ? [longEdgeRounded, shorterEdge] : [shorterEdge, longEdgeRounded];
  return { height: outputHeight, width: outputWidth };
}

function formatDimensions({ height, width }: { height: number; width: number }): string {
  return `${width}x${height}`;
}

function toImageResult(
  payload: ImageResponse,
  dimensions: { height: number; width: number },
): ImageResult {
  const imageBase64 = payload.data?.[0]?.b64_json;
  if (typeof imageBase64 !== 'string' || !imageBase64) {
    throw new ImageProviderError('INVALID_ARTIFACT', 'OpenAI returned no image bytes.');
  }
  const revisedPrompt = payload.data?.[0]?.revised_prompt;
  return {
    height: dimensions.height,
    imageBytes: Buffer.from(imageBase64, 'base64'),
    metadata: {
      mimeType: 'image/png',
      model: DEFAULT_CODEX_IMAGE_MODEL,
      ...(typeof revisedPrompt === 'string' ? { revisedPrompt } : {}),
    },
    providerTask: 'openai:image',
    width: dimensions.width,
  };
}

async function mapOpenAIError(response: Response): Promise<ImageProviderError> {
  const details = await response.text();
  if (response.status === 401) {
    return new ImageProviderError('AUTHENTICATION_FAILED', 'OpenAI authentication failed.');
  }
  if (response.status === 429) {
    return new ImageProviderError('RATE_LIMITED', 'OpenAI image requests are rate limited.');
  }
  if (response.status === 408 || response.status === 504) {
    return new ImageProviderError('TIMEOUT', 'OpenAI image request timed out.');
  }
  return new ImageProviderError(
    'TOOL_FAILED',
    `OpenAI image request failed with HTTP ${response.status}${details ? `: ${details}` : ''}.`,
  );
}

async function readJson<T>(response: Response, operation: string): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new ImageProviderError(
      'INVALID_ARTIFACT',
      `OpenAI ${operation} returned invalid JSON.`,
      error,
    );
  }
}

function parseStyle(value: string | undefined): ExtractedStyle {
  if (!value) {
    throw new ImageProviderError('INVALID_ARTIFACT', 'OpenAI returned no style extraction.');
  }
  try {
    const parsed = JSON.parse(value) as Partial<ExtractedStyle>;
    if (
      !isNonEmptyString(parsed.name) ||
      !isNonEmptyString(parsed.category) ||
      !isNonEmptyString(parsed.promptTemplate) ||
      !isStringArray(parsed.colorKeywords) ||
      !isStringArray(parsed.compositionKeywords) ||
      !isStringArray(parsed.materialKeywords)
    ) {
      throw new Error('Style schema did not match.');
    }
    return {
      category: parsed.category,
      colorKeywords: parsed.colorKeywords,
      compositionKeywords: parsed.compositionKeywords,
      materialKeywords: parsed.materialKeywords,
      name: parsed.name,
      promptTemplate: parsed.promptTemplate.includes('{{idea}}')
        ? parsed.promptTemplate
        : `${parsed.promptTemplate}, {{idea}}`,
    };
  } catch (error) {
    throw new ImageProviderError(
      'INVALID_ARTIFACT',
      'OpenAI returned an invalid style extraction.',
      error,
    );
  }
}

function extractOutputText(payload: ResponseApiResult): string | undefined {
  if (typeof payload.output_text === 'string') {
    return payload.output_text;
  }
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') {
        return content.text;
      }
    }
  }
  return undefined;
}

function validateOptions(options: CodexImageProviderOptions): void {
  if (!options.apiKey.trim()) {
    throw new ImageProviderError('CONFIGURATION_ERROR', 'OpenAI API key must not be empty.');
  }
  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new ImageProviderError(
      'CONFIGURATION_ERROR',
      'OpenAI timeout must be a positive integer.',
    );
  }
}

function validateSpec(spec: ImageSpec): void {
  if (!spec.prompt.trim()) {
    throw new ImageProviderError('INVALID_INPUT', 'Image prompt must not be empty.');
  }
  if (
    !Number.isInteger(spec.width) ||
    !Number.isInteger(spec.height) ||
    spec.width <= 0 ||
    spec.height <= 0
  ) {
    throw new ImageProviderError('INVALID_INPUT', 'Image dimensions must be positive integers.');
  }
}

function validateSourceImageSpec(spec: ImageSpec): void {
  validateSpec(spec);
  if (!spec.sourceImageUrl) {
    throw new ImageProviderError('INVALID_INPUT', 'A source image URL is required.');
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && Boolean(value.trim());
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
