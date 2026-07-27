import { describe, expect, it } from 'vite-plus/test';

import { createGenerationRunner } from './runner.js';

describe('generation runner', () => {
  it('delegates the persisted job input to the wallpaper graph', async () => {
    const received: string[] = [];
    const runner = createGenerationRunner(async (input) => {
      received.push(input.wallpaperId ?? 'missing');
    });

    await runner.run({
      height: 2400,
      mode: 'text2img',
      userInputs: { idea: 'a calm night sky' },
      wallpaperId: 'job-1',
      width: 1080,
    });

    expect(received).toEqual(['job-1']);
  });
});
