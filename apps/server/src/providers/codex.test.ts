import { describe, expect, it, vi } from 'vite-plus/test';

import { CodexImageProvider, type CodexClient, mapCodexError } from './codex.js';
import { ImageProviderError } from './types.js';

const validArtifact = JSON.stringify({
  artifact: 'aGVsbG8=',
  artifactKind: 'base64',
  height: 2400,
  kind: 'image_result',
  mimeType: 'image/png',
  width: 1080,
});

function createClient(finalResponse = validArtifact): {
  client: CodexClient;
  startThread: ReturnType<typeof vi.fn>;
} {
  const startThread = vi.fn(() => ({
    id: 'thread_123',
    run: vi.fn().mockResolvedValue({ finalResponse }),
  }));

  return { client: { startThread }, startThread };
}

describe('CodexImageProvider', () => {
  it('uses structured output and returns a machine-readable base64 artifact', async () => {
    const { client, startThread } = createClient();
    const provider = new CodexImageProvider({
      client,
      model: 'gpt-5',
      timeoutMs: 1_000,
      workingDirectory: 'C:/work/lumina',
    });

    const result = await provider.textToImage({
      prompt: 'moonlight over a lake',
      width: 1080,
      height: 2400,
    });

    expect(result.imageBytes?.toString()).toBe('hello');
    expect(result.providerTask).toBe('thread_123');
    expect(result.metadata).toMatchObject({ actualHeight: 2400, actualWidth: 1080 });
    expect(startThread).toHaveBeenCalledWith(
      expect.objectContaining({
        approvalPolicy: 'never',
        networkAccessEnabled: false,
        sandboxMode: 'workspace-write',
        webSearchEnabled: false,
      }),
    );
  });

  it('rejects a local artifact outside the configured working directory', async () => {
    const { client } = createClient(
      JSON.stringify({
        ...JSON.parse(validArtifact),
        artifact: '../outside.png',
        artifactKind: 'local_path',
      }),
    );
    const provider = new CodexImageProvider({
      client,
      timeoutMs: 1_000,
      workingDirectory: 'C:/work/lumina',
    });

    await expect(
      provider.textToImage({ prompt: 'moonlight over a lake', width: 1080, height: 2400 }),
    ).rejects.toMatchObject({ code: 'INVALID_ARTIFACT' });
  });

  it('maps known provider failures to structured error codes', () => {
    expect(mapCodexError(new Error('HTTP 429 quota exhausted')).code).toBe('RATE_LIMITED');
    expect(mapCodexError(new Error('imagegen tool failed')).code).toBe('TOOL_FAILED');
    expect(mapCodexError(new Error('unauthorized')).code).toBe('AUTHENTICATION_FAILED');
  });

  it('rejects empty prompts before starting Codex', async () => {
    const { client, startThread } = createClient();
    const provider = new CodexImageProvider({
      client,
      timeoutMs: 1_000,
      workingDirectory: 'C:/work/lumina',
    });

    await expect(provider.textToImage({ prompt: '  ', width: 1080, height: 2400 })).rejects.toEqual(
      expect.objectContaining({ code: 'INVALID_INPUT' } satisfies Partial<ImageProviderError>),
    );
    expect(startThread).not.toHaveBeenCalled();
  });
});
