import { describe, expect, it } from 'vite-plus/test';

import { CodexImageProvider, type CodexClient } from './codex.js';
import { getImageProvider } from './index.js';
import { MockImageProvider } from './mock.js';

describe('getImageProvider', () => {
  it('returns the deterministic mock provider when Codex is disabled', () => {
    const provider = getImageProvider({
      CODEX_IMAGE_TIMEOUT_MS: 120_000,
      CODEX_PROVIDER_ENABLED: false,
    });

    expect(provider).toBeInstanceOf(MockImageProvider);
  });

  it('returns the Codex provider when enabled', () => {
    const codexClient: CodexClient = {
      startThread: () => ({
        id: 'thread_factory_test',
        run: async () => ({ finalResponse: '{}', items: [], usage: null }),
      }),
    };
    const provider = getImageProvider(
      {
        CODEX_IMAGE_TIMEOUT_MS: 120_000,
        CODEX_MODEL: 'gpt-5',
        CODEX_PROVIDER_ENABLED: true,
        CODEX_WORKDIR: 'C:/work/lumina',
      },
      { codexClient },
    );

    expect(provider).toBeInstanceOf(CodexImageProvider);
  });
});
