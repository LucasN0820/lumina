import { cors } from 'hono/cors';
import { Hono } from 'hono';

import { errorHandler } from './middleware/error.js';
import { createGenerateRoutes, type GenerateRouteDependencies } from './routes/generate.js';
import { createPresetRoutes, type PresetRepository } from './routes/presets.js';
import { createWallpaperRoutes, type WallpaperRepository } from './routes/wallpapers.js';

const defaultCorsOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081'];

export type AppOptions = {
  corsOrigins?: string[];
  generation?: GenerateRouteDependencies;
  presets?: PresetRepository;
  wallpapers?: WallpaperRepository;
};

export function createApp({
  corsOrigins = defaultCorsOrigins,
  generation,
  presets,
  wallpapers,
}: AppOptions = {}) {
  const app = new Hono();

  app.use(
    '*',
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );

  app.onError(errorHandler);

  app.get('/health', (context) => context.json({ ok: true }));
  app.route('/', createGenerateRoutes(generation));
  app.route('/', createPresetRoutes(presets));
  app.route('/', createWallpaperRoutes(wallpapers));

  return app;
}

export const app = createApp();
