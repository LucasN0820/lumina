import { describe, expect, it } from 'vite-plus/test';

import { app } from './app.js';

describe('health endpoint', () => {
  it('returns a healthy response', async () => {
    const response = await app.request('/health');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
