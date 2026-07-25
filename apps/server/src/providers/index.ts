import type { Env } from '../config/env.js';

import { CodexImageProvider, type CodexClient } from './codex.js';
import { MockImageProvider } from './mock.js';
import type { ImageProvider } from './types.js';

export * from './codex.js';
export * from './mock.js';
export * from './types.js';

export interface ImageProviderFactoryOptions {
  codexClient?: CodexClient;
}

export function getImageProvider(
  env: Pick<
    Env,
    'CODEX_IMAGE_TIMEOUT_MS' | 'CODEX_MODEL' | 'CODEX_PROVIDER_ENABLED' | 'CODEX_WORKDIR'
  >,
  options: ImageProviderFactoryOptions = {},
): ImageProvider {
  if (!env.CODEX_PROVIDER_ENABLED) {
    return new MockImageProvider();
  }

  if (!env.CODEX_MODEL || !env.CODEX_WORKDIR) {
    throw new Error('Codex provider requires CODEX_MODEL and CODEX_WORKDIR.');
  }

  return new CodexImageProvider({
    client: options.codexClient,
    model: env.CODEX_MODEL,
    timeoutMs: env.CODEX_IMAGE_TIMEOUT_MS,
    workingDirectory: env.CODEX_WORKDIR,
  });
}
