import { cors } from 'hono/cors';
import { Hono } from 'hono';

import { errorHandler } from './middleware/error.js';

const defaultCorsOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081'];

export type AppOptions = {
  corsOrigins?: string[];
};

export function createApp({ corsOrigins = defaultCorsOrigins }: AppOptions = {}) {
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

  return app;
}

export const app = createApp();
