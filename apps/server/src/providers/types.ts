export type ImageOperation =
  | 'text_to_image'
  | 'edit_image'
  | 'outpaint'
  | 'upscale'
  | 'extract_style';

// 2k or 4k
export type ImageQuality = 'standard' | 'high';

export interface ImageSpec {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  seed?: number;
  mode?: string;
  sourceImageUrl?: string;
  styleRefUrl?: string;
  quality?: ImageQuality;
}

export type ImageMetadataValue = boolean | number | string | null;

export type ExtractedStyle = {
  category: string;
  colorKeywords: string[];
  compositionKeywords: string[];
  materialKeywords: string[];
  name: string;
  promptTemplate: string;
};

export interface ImageResult {
  imageBytes?: Uint8Array;
  imagePath?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
  providerTask: string;
  metadata?: Record<string, ImageMetadataValue>;
  style?: ExtractedStyle;
}

export interface ImageProvider {
  textToImage(spec: ImageSpec): Promise<ImageResult>;
  editImage(spec: ImageSpec): Promise<ImageResult>;
  outpaint(spec: ImageSpec): Promise<ImageResult>;
  upscale(spec: ImageSpec): Promise<ImageResult>;
  extractStyle(spec: ImageSpec): Promise<ImageResult>;
}

export type ImageProviderErrorCode =
  | 'AUTHENTICATION_FAILED'
  | 'CONFIGURATION_ERROR'
  | 'INVALID_ARTIFACT'
  | 'INVALID_INPUT'
  | 'PROVIDER_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'TOOL_FAILED'
  | 'UNSUPPORTED_OPERATION';

export class ImageProviderError extends Error {
  constructor(
    readonly code: ImageProviderErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'ImageProviderError';
  }
}
