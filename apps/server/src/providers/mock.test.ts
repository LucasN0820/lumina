import { describe, expect, it } from 'vite-plus/test';

import { MockImageProvider } from './mock.js';

describe('MockImageProvider', () => {
  it('returns deterministic placeholder bytes at the requested dimensions', async () => {
    const provider = new MockImageProvider();
    const spec = { prompt: 'purple clouds', width: 1080, height: 2400 };

    await expect(provider.textToImage(spec)).resolves.toEqual(await provider.editImage(spec));
    const result = await provider.textToImage(spec);

    expect(result.providerTask).toBe('mock-image-provider');
    expect(result.metadata).toMatchObject({ mimeType: 'image/svg+xml', placeholder: true });
    expect(result.imageBytes?.toString()).toContain('1080 x 2400');
  });
});
