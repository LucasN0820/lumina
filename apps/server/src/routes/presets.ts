import { Hono } from 'hono';

export type PresetListItem = {
  category: string;
  coverImageUrl: string | null;
  id: string;
  name: string;
};

export type PresetRepository = {
  listBuiltIn(): Promise<PresetListItem[]>;
};

export function createPresetRoutes(repository?: PresetRepository) {
  const routes = new Hono();

  routes.get('/presets', async (context) => {
    const presets = await (repository ?? (await createPrismaPresetRepository())).listBuiltIn();
    return context.json({ presets });
  });

  return routes;
}

async function createPrismaPresetRepository(): Promise<PresetRepository> {
  const { prisma } = await import('../lib/db.js');

  return {
    listBuiltIn: () =>
      prisma.preset.findMany({
        orderBy: { name: 'asc' },
        select: { category: true, coverImageUrl: true, id: true, name: true },
        where: { isBuiltIn: true },
      }),
  };
}
