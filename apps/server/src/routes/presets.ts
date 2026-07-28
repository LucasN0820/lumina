import { Hono } from 'hono';

import type { AuthVariables } from '../middleware/auth.js';

export type PresetListItem = {
  category: string;
  coverImageUrl: string | null;
  id: string;
  name: string;
};

export type PresetRepository = {
  /** Compatibility with test doubles for the original built-in-only endpoint. */
  listBuiltIn?(): Promise<PresetListItem[]>;
  listVisible?(clerkUserId?: string): Promise<PresetListItem[]>;
};

export function createPresetRoutes(repository?: PresetRepository) {
  const routes = new Hono<{ Variables: AuthVariables }>();

  routes.get('/presets', async (context) => {
    const resolvedRepository = repository ?? (await createPrismaPresetRepository());
    const presets = resolvedRepository.listVisible
      ? await resolvedRepository.listVisible(context.get('user')?.clerkUserId)
      : await resolvedRepository.listBuiltIn?.();
    if (!presets) {
      throw new Error('Preset repository does not implement a list operation.');
    }
    return context.json({ presets });
  });

  return routes;
}

async function createPrismaPresetRepository(): Promise<PresetRepository> {
  const { prisma } = await import('../lib/db.js');

  return {
    listVisible: (clerkUserId) =>
      prisma.preset.findMany({
        orderBy: { name: 'asc' },
        select: { category: true, coverImageUrl: true, id: true, name: true },
        where: {
          OR: [{ isBuiltIn: true }, ...(clerkUserId ? [{ owner: { clerkUserId } }] : [])],
        },
      }),
  };
}
