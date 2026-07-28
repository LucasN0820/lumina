import type { Env } from '../config/env.js';

import { CodexImageProvider } from './codex.js';
import { MockImageProvider } from './mock.js';
import { SiliconFlowImageProvider } from './siliconflow.js';
import type { ImageProvider } from './types.js';

export * from './mock.js';
export * from './codex.js';
export * from './siliconflow.js';
export * from './types.js';

export interface ImageProviderFactoryOptions {
  siliconFlowFetch?: typeof globalThis.fetch;
}

type ImageProviderEnv = Pick<
  Env,
  | 'SILICONFLOW_API_KEY'
  | 'SILICONFLOW_IMAGE_MODEL'
  | 'SILICONFLOW_IMAGE_TIMEOUT_MS'
  | 'SILICONFLOW_PROVIDER_ENABLED'
> &
  Partial<
    Pick<
      Env,
      | 'OPENAI_API_KEY'
      | 'OPENAI_IMAGE_MODEL'
      | 'OPENAI_IMAGE_PROVIDER_ENABLED'
      | 'OPENAI_IMAGE_TIMEOUT_MS'
      | 'OPENAI_STYLE_MODEL'
    >
  >;

export function getImageProvider(
  env: ImageProviderEnv,
  options: ImageProviderFactoryOptions = {},
): ImageProvider {
  if (env.OPENAI_IMAGE_PROVIDER_ENABLED) {
    if (
      !env.OPENAI_API_KEY ||
      !env.OPENAI_IMAGE_MODEL ||
      !env.OPENAI_STYLE_MODEL ||
      !env.OPENAI_IMAGE_TIMEOUT_MS
    ) {
      throw new Error('OpenAI image provider is missing required configuration.');
    }
    return new CodexImageProvider({
      apiKey: env.OPENAI_API_KEY,
      imageModel: env.OPENAI_IMAGE_MODEL,
      styleModel: env.OPENAI_STYLE_MODEL,
      timeoutMs: env.OPENAI_IMAGE_TIMEOUT_MS,
    });
  }

  if (!env.SILICONFLOW_PROVIDER_ENABLED) {
    return new MockImageProvider();
  }

  if (!env.SILICONFLOW_API_KEY) {
    throw new Error('SiliconFlow provider requires SILICONFLOW_API_KEY.');
  }

  return new SiliconFlowImageProvider({
    apiKey: env.SILICONFLOW_API_KEY,
    fetch: options.siliconFlowFetch,
    model: env.SILICONFLOW_IMAGE_MODEL,
    timeoutMs: env.SILICONFLOW_IMAGE_TIMEOUT_MS,
  });
}
