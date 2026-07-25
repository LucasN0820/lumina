import { Codex, type Thread, type TurnOptions } from '@openai/codex-sdk';
import { isAbsolute, relative, resolve, sep } from 'node:path';

import {
  ImageProviderError,
  type ImageOperation,
  type ImageProvider,
  type ImageResult,
  type ImageSpec,
} from './types.js';

const artifactSchema = {
  type: 'object',
  properties: {
    artifact: { type: 'string' },
    artifactKind: { enum: ['base64', 'local_path', 'url'] },
    height: { type: 'integer', minimum: 1 },
    kind: { enum: ['image_result'] },
    mimeType: { type: 'string' },
    width: { type: 'integer', minimum: 1 },
  },
  required: ['artifact', 'artifactKind', 'height', 'kind', 'mimeType', 'width'],
  additionalProperties: false,
} as const;

type CodexArtifact = {
  artifact: string;
  artifactKind: 'base64' | 'local_path' | 'url';
  height: number;
  kind: 'image_result';
  mimeType: string;
  width: number;
};

type CodexThread = Pick<Thread, 'id' | 'run'>;

export interface CodexClient {
  startThread(options: {
    approvalPolicy: 'never';
    model?: string;
    networkAccessEnabled: false;
    sandboxMode: 'workspace-write';
    skipGitRepoCheck: true;
    webSearchEnabled: false;
    workingDirectory: string;
  }): CodexThread;
}

export interface CodexImageProviderOptions {
  client?: CodexClient;
  model?: string;
  timeoutMs: number;
  workingDirectory: string;
}

export class CodexImageProvider implements ImageProvider {
  private readonly client: CodexClient;

  constructor(private readonly options: CodexImageProviderOptions) {
    validateOptions(options);
    this.client = options.client ?? new Codex();
  }

  async textToImage(spec: ImageSpec): Promise<ImageResult> {
    return this.run('text_to_image', spec);
  }

  async editImage(spec: ImageSpec): Promise<ImageResult> {
    return this.run('edit_image', spec);
  }

  async outpaint(spec: ImageSpec): Promise<ImageResult> {
    return this.run('outpaint', spec);
  }

  async upscale(spec: ImageSpec): Promise<ImageResult> {
    return this.run('upscale', spec);
  }

  async extractStyle(spec: ImageSpec): Promise<ImageResult> {
    return this.run('extract_style', spec);
  }

  private async run(operation: ImageOperation, spec: ImageSpec): Promise<ImageResult> {
    validateSpec(spec);
    const thread = this.client.startThread({
      approvalPolicy: 'never',
      model: this.options.model,
      networkAccessEnabled: false,
      sandboxMode: 'workspace-write',
      skipGitRepoCheck: true,
      webSearchEnabled: false,
      workingDirectory: this.options.workingDirectory,
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);
    const turnOptions: TurnOptions = {
      outputSchema: artifactSchema,
      signal: controller.signal,
    };

    try {
      const turn = await thread.run(buildPrompt(operation, spec), turnOptions);
      const artifact = parseArtifact(turn.finalResponse);
      const providerTask = thread.id;

      if (!providerTask) {
        throw new ImageProviderError(
          'TOOL_FAILED',
          'Codex completed without returning a thread identifier.',
        );
      }

      return toImageResult(artifact, providerTask, this.options.workingDirectory, operation, spec);
    } catch (error) {
      if (error instanceof ImageProviderError) {
        throw error;
      }

      throw mapCodexError(error, controller.signal.aborted);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function mapCodexError(error: unknown, timedOut = false): ImageProviderError {
  if (timedOut || hasErrorCode(error, 'ABORT_ERR') || hasErrorName(error, 'AbortError')) {
    return new ImageProviderError('TIMEOUT', 'Codex image generation timed out.', error);
  }

  const details = getErrorDetails(error);

  if (/\b(401|403|unauthori[sz]ed|authentication|login required)\b/i.test(details)) {
    return new ImageProviderError('AUTHENTICATION_FAILED', 'Codex authentication failed.', error);
  }

  if (/\b(429|quota|rate limit|usage limit|credits?)\b/i.test(details)) {
    return new ImageProviderError('RATE_LIMITED', 'Codex image generation is rate limited.', error);
  }

  if (/\b(tool|image generation|imagegen)\b/i.test(details)) {
    return new ImageProviderError('TOOL_FAILED', 'Codex image-generation tool failed.', error);
  }

  if (/\b(codex.*(not found|unavailable)|binary|spawn|enoent)\b/i.test(details)) {
    return new ImageProviderError(
      'PROVIDER_UNAVAILABLE',
      'Codex is unavailable on this server.',
      error,
    );
  }

  return new ImageProviderError('PROVIDER_UNAVAILABLE', 'Codex image generation failed.', error);
}

function buildPrompt(operation: ImageOperation, spec: ImageSpec): string {
  const references = [
    spec.sourceImageUrl ? `Source image reference: ${spec.sourceImageUrl}` : undefined,
    spec.styleRefUrl ? `Style reference: ${spec.styleRefUrl}` : undefined,
  ].filter((value): value is string => value !== undefined);

  return [
    'Create exactly one image artifact using an available local image-generation capability.',
    'Do not access the network and do not request approval.',
    `Operation: ${operation}.`,
    `Prompt: ${spec.prompt}`,
    spec.negativePrompt ? `Avoid: ${spec.negativePrompt}` : undefined,
    `Requested dimensions: ${spec.width}x${spec.height}.`,
    spec.mode ? `Mode: ${spec.mode}.` : undefined,
    spec.quality ? `Quality: ${spec.quality}.` : undefined,
    ...references,
    'Write any local artifact under the configured working directory.',
    'Return only the structured result requested by the output schema.',
    'For local_path, artifact must be a path to the generated image. For base64, artifact must be raw base64 without a data URL prefix.',
    'Report the actual output dimensions, even when they differ from the requested dimensions.',
  ]
    .filter((value): value is string => Boolean(value))
    .join('\n');
}

function parseArtifact(response: string): CodexArtifact {
  let value: unknown;

  try {
    value = JSON.parse(response);
  } catch (error) {
    throw new ImageProviderError(
      'INVALID_ARTIFACT',
      'Codex returned non-JSON image output.',
      error,
    );
  }

  if (!isCodexArtifact(value)) {
    throw new ImageProviderError(
      'INVALID_ARTIFACT',
      'Codex returned an invalid image artifact.',
      value,
    );
  }

  return value;
}

function isCodexArtifact(value: unknown): value is CodexArtifact {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const artifact = value as Record<string, unknown>;
  return (
    artifact.kind === 'image_result' &&
    typeof artifact.artifact === 'string' &&
    artifact.artifact.length > 0 &&
    (artifact.artifactKind === 'base64' ||
      artifact.artifactKind === 'local_path' ||
      artifact.artifactKind === 'url') &&
    typeof artifact.mimeType === 'string' &&
    artifact.mimeType.startsWith('image/') &&
    isPositiveInteger(artifact.width) &&
    isPositiveInteger(artifact.height)
  );
}

function toImageResult(
  artifact: CodexArtifact,
  providerTask: string,
  workingDirectory: string,
  operation: ImageOperation,
  spec: ImageSpec,
): ImageResult {
  const baseResult: ImageResult = {
    width: artifact.width,
    height: artifact.height,
    providerTask,
    metadata: {
      actualHeight: artifact.height,
      actualWidth: artifact.width,
      artifactKind: artifact.artifactKind,
      mimeType: artifact.mimeType,
      operation,
      requestedHeight: spec.height,
      requestedWidth: spec.width,
    },
  };

  if (artifact.artifactKind === 'base64') {
    const imageBytes = Buffer.from(artifact.artifact, 'base64');

    if (imageBytes.length === 0) {
      throw new ImageProviderError('INVALID_ARTIFACT', 'Codex returned an empty image artifact.');
    }

    return { ...baseResult, imageBytes };
  }

  if (artifact.artifactKind === 'url') {
    try {
      const imageUrl = new URL(artifact.artifact).toString();
      return { ...baseResult, imageUrl };
    } catch (error) {
      throw new ImageProviderError(
        'INVALID_ARTIFACT',
        'Codex returned an invalid image URL.',
        error,
      );
    }
  }

  return { ...baseResult, imagePath: toSafeArtifactPath(workingDirectory, artifact.artifact) };
}

function toSafeArtifactPath(workingDirectory: string, artifactPath: string): string {
  const absolutePath = resolve(workingDirectory, artifactPath);
  const pathFromWorkdir = relative(workingDirectory, absolutePath);

  if (
    pathFromWorkdir === '' ||
    pathFromWorkdir === '..' ||
    pathFromWorkdir.startsWith(`..${sep}`) ||
    isAbsolute(pathFromWorkdir)
  ) {
    throw new ImageProviderError(
      'INVALID_ARTIFACT',
      'Codex returned an artifact path outside the configured working directory.',
    );
  }

  return absolutePath;
}

function validateSpec(spec: ImageSpec): void {
  if (!spec.prompt.trim()) {
    throw new ImageProviderError('INVALID_INPUT', 'Image prompt must not be empty.');
  }

  if (!isPositiveInteger(spec.width) || !isPositiveInteger(spec.height)) {
    throw new ImageProviderError('INVALID_INPUT', 'Image dimensions must be positive integers.');
  }
}

function validateOptions(options: CodexImageProviderOptions): void {
  if (!options.workingDirectory.trim()) {
    throw new ImageProviderError(
      'CONFIGURATION_ERROR',
      'Codex working directory must not be empty.',
    );
  }

  if (!isPositiveInteger(options.timeoutMs)) {
    throw new ImageProviderError(
      'CONFIGURATION_ERROR',
      'Codex image timeout must be a positive integer.',
    );
  }
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function getErrorDetails(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name} ${error.message}`;
  }

  return String(error);
}

function hasErrorCode(error: unknown, expectedCode: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === expectedCode
  );
}

function hasErrorName(error: unknown, expectedName: string): boolean {
  return error instanceof Error && error.name === expectedName;
}
