import { loadEnv } from '../src/config/env.js';
import { getImageProvider } from '../src/providers/index.js';

const env = loadEnv();

if (!env.CODEX_PROVIDER_ENABLED) {
  throw new Error('Set CODEX_PROVIDER_ENABLED=true before running the Codex image spike.');
}

const provider = getImageProvider(env);

const result = await provider.textToImage({
  prompt: 'An abstract dusk landscape designed as a vertical mobile wallpaper.',
  width: 1080,
  height: 2400,
  quality: 'high',
});

console.log(
  JSON.stringify({
    height: result.height,
    imagePath: result.imagePath,
    imageUrl: result.imageUrl,
    providerTask: result.providerTask,
    width: result.width,
  }),
);
