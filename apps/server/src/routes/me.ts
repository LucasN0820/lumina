import { Hono } from 'hono';
import { z } from 'zod';

import type { ClerkAuthService, ClerkUserProfile } from '../lib/clerk.js';
import { type AuthVariables, requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

const bindDeviceSchema = z.object({
  deviceId: z.string().trim().min(1).max(200),
});

export type LocalUser = {
  avatarUrl: string | null;
  clerkUserId: string;
  email: string | null;
  googleSubject: string | null;
  id: string;
  nickname: string | null;
};

export type MeRepository = {
  bindDeviceToUser(input: { deviceId: string; userId: string }): Promise<number>;
  upsertUser(user: ClerkUserProfile): Promise<LocalUser>;
};

export type MeRouteDependencies = {
  clerk: ClerkAuthService;
  users?: MeRepository;
};

type MeEnvironment = {
  Variables: AuthVariables;
};

export function createMeRoutes({ clerk, users }: MeRouteDependencies) {
  const routes = new Hono<MeEnvironment>();

  routes.use('/me', requireAuth(clerk));
  routes.use('/me/bind-device', requireAuth(clerk));

  routes.get('/me', async (context) => {
    const user = await syncLocalUser(context.get('user')?.clerkUserId, clerk, users);
    return context.json({ user });
  });

  routes.post('/me/bind-device', async (context) => {
    const parsed = bindDeviceSchema.safeParse(await parseRequestBody(context.req.raw));
    if (!parsed.success) {
      throw new AppError('deviceId is invalid.', 400, 'VALIDATION_ERROR');
    }

    const user = await syncLocalUser(context.get('user')?.clerkUserId, clerk, users);
    const repository = users ?? (await createPrismaMeRepository());
    const bound = await repository.bindDeviceToUser({
      deviceId: parsed.data.deviceId,
      userId: user.id,
    });

    return context.json({ bound });
  });

  return routes;
}

async function syncLocalUser(
  clerkUserId: string | undefined,
  clerk: ClerkAuthService,
  users?: MeRepository,
): Promise<LocalUser> {
  if (!clerkUserId) {
    throw new AppError('Authentication is required.', 401, 'UNAUTHORIZED');
  }

  const profile = await clerk.getUser(clerkUserId);
  const repository = users ?? (await createPrismaMeRepository());
  return repository.upsertUser(profile);
}

async function parseRequestBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError('Request body must be valid JSON.', 400, 'INVALID_JSON');
  }
}

async function createPrismaMeRepository(): Promise<MeRepository> {
  const { prisma } = await import('../lib/db.js');

  return {
    bindDeviceToUser: async ({ deviceId, userId }) => {
      const result = await prisma.wallpaper.updateMany({
        data: { userId },
        where: { deviceId, userId: null },
      });
      return result.count;
    },
    upsertUser: (user) =>
      prisma.user.upsert({
        create: user,
        update: {
          avatarUrl: user.avatarUrl,
          email: user.email,
          googleSubject: user.googleSubject,
          nickname: user.nickname,
        },
        where: { clerkUserId: user.clerkUserId },
      }),
  };
}
