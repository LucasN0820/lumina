import { Hono } from 'hono';
import { z } from 'zod';

import { AppError } from '../middleware/error.js';

const querySchema = z.object({
  deviceId: z.string().trim().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export type WallpaperListItem = {
  createdAt: Date;
  height: number | null;
  id: string;
  mode: string;
  resultImageUrl: string | null;
  status: string;
  width: number | null;
};

export type WallpaperRepository = {
  listByDeviceId(input: {
    deviceId: string;
    limit: number;
    page: number;
  }): Promise<WallpaperListItem[]>;
};

export function createWallpaperRoutes(repository?: WallpaperRepository) {
  const routes = new Hono();

  routes.get('/wallpapers', async (context) => {
    const parsed = querySchema.safeParse(context.req.query());
    if (!parsed.success) {
      throw new AppError('deviceId, page, or limit is invalid.', 400, 'VALIDATION_ERROR');
    }

    const wallpapers = await (
      repository ?? (await createPrismaWallpaperRepository())
    ).listByDeviceId(parsed.data);
    const { limit, page } = parsed.data;

    return context.json({
      hasMore: wallpapers.length > limit,
      items: wallpapers.slice(0, limit),
      limit,
      page,
    });
  });

  return routes;
}

async function createPrismaWallpaperRepository(): Promise<WallpaperRepository> {
  const { prisma } = await import('../lib/db.js');

  return {
    listByDeviceId: ({ deviceId, limit, page }) =>
      prisma.wallpaper.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit + 1,
        where: { deviceId },
      }),
  };
}
