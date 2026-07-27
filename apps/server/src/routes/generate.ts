import { Hono } from 'hono';
import { z } from 'zod';

import type { WallpaperGraphInput } from '../graph/wallpaper.graph.js';
import { generationRunner, type GenerationRunner } from '../jobs/runner.js';
import { AppError } from '../middleware/error.js';

const wallpaperModes = ['text2img', 'outpaint', 'edit', 'style', 'upscale'] as const;

const userInputsSchema = z
  .object({
    idea: z.string().trim().min(1).max(1_000).optional(),
    mood: z.string().trim().min(1).max(200).optional(),
    theme: z.string().trim().min(1).max(200).optional(),
    tone: z.string().trim().min(1).max(200).optional(),
  })
  .refine((inputs) => Object.values(inputs).some(Boolean), {
    message: 'Provide at least one user input.',
  });

const generateRequestSchema = z.object({
  deviceId: z.string().trim().min(1).max(200).optional(),
  height: z.number().int().min(256).max(8_192),
  mode: z.enum(wallpaperModes),
  presetId: z.string().trim().min(1).max(200).optional(),
  sourceImageUrl: z.url().optional(),
  userInputs: userInputsSchema,
  width: z.number().int().min(256).max(8_192),
});

export type JobRecord = {
  deviceId: string | null;
  error: string | null;
  height: number | null;
  id: string;
  resultImageUrl: string | null;
  status: string;
  width: number | null;
};

export type GenerationJobRepository = {
  create(data: {
    deviceId?: string;
    height: number;
    mode: string;
    presetId?: string;
    prompt: string;
    sourceImageUrl?: string;
    status: string;
    width: number;
  }): Promise<JobRecord>;
  findById(id: string): Promise<JobRecord | null>;
};

export type GenerateRouteDependencies = {
  jobs?: GenerationJobRepository;
  runner?: GenerationRunner;
};

export function createGenerateRoutes(dependencies: GenerateRouteDependencies = {}) {
  const routes = new Hono();

  routes.post('/generate', async (context) => {
    const payload = await parseRequestBody(context.req.raw);
    const parsed = generateRequestSchema.safeParse(payload);
    if (!parsed.success) {
      throw new AppError('Invalid generation request.', 400, 'VALIDATION_ERROR');
    }

    const jobs = dependencies.jobs ?? (await createPrismaJobRepository());
    const input = parsed.data;
    const job = await jobs.create({
      deviceId: input.deviceId,
      height: input.height,
      mode: input.mode,
      presetId: input.presetId,
      prompt: initialPrompt(input.userInputs),
      sourceImageUrl: input.sourceImageUrl,
      status: 'pending',
      width: input.width,
    });
    const graphInput: WallpaperGraphInput = { ...input, wallpaperId: job.id };
    const runner = dependencies.runner ?? generationRunner;

    void runner.run(graphInput).catch(() => {});

    return context.json({ jobId: job.id }, 202);
  });

  routes.get('/jobs/:id', async (context) => {
    const jobId = context.req.param('id').trim();
    if (!jobId) {
      throw new AppError('Job id is required.', 400, 'VALIDATION_ERROR');
    }

    const jobs = dependencies.jobs ?? (await createPrismaJobRepository());
    const job = await jobs.findById(jobId);
    if (!job) {
      throw new AppError('Generation job was not found.', 404, 'JOB_NOT_FOUND');
    }

    return context.json({
      ...(job.error ? { error: job.error } : {}),
      ...(job.height ? { height: job.height } : {}),
      ...(job.resultImageUrl ? { resultImageUrl: job.resultImageUrl } : {}),
      status: job.status,
      ...(job.width ? { width: job.width } : {}),
    });
  });

  return routes;
}

async function parseRequestBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError('Request body must be valid JSON.', 400, 'INVALID_JSON');
  }
}

function initialPrompt(userInputs: WallpaperGraphInput['userInputs']): string {
  return [userInputs.idea, userInputs.theme, userInputs.mood, userInputs.tone]
    .filter((value): value is string => Boolean(value))
    .join(', ');
}

async function createPrismaJobRepository(): Promise<GenerationJobRepository> {
  const { prisma } = await import('../lib/db.js');

  return {
    create: (data) => prisma.wallpaper.create({ data }),
    findById: (id) => prisma.wallpaper.findUnique({ where: { id } }),
  };
}
