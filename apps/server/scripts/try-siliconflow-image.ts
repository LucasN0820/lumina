import 'dotenv/config';

import { loadSiliconFlowEnv } from '../src/config/env.js';
import { getImageProvider } from '../src/providers/index.js';

const env = loadSiliconFlowEnv();

const provider = getImageProvider(env);
const result = await provider.textToImage({
  prompt: 'An abstract dusk landscape designed as a vertical mobile wallpaper.',
  quality: 'high',
  width: 576,
  height: 1024,
});

if (!result.imageUrl) {
  throw new Error('SiliconFlow did not return a downloadable image URL.');
}

const image = await fetch(result.imageUrl);

if (!image.ok || !image.headers.get('content-type')?.startsWith('image/')) {
  throw new Error(`SiliconFlow result could not be downloaded as an image: HTTP ${image.status}.`);
}

console.log(
  JSON.stringify({
    contentType: image.headers.get('content-type'),
    height: result.height,
    model: result.metadata?.model,
    providerTask: result.providerTask,
    sizeBytes: Number(image.headers.get('content-length')) || undefined,
    width: result.width,
  }),
);
