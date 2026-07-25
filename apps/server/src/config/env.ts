import { z } from 'zod';

const nonEmptyString = z.string().trim().min(1);

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: nonEmptyString,
    CLERK_SECRET_KEY: nonEmptyString,
    CLERK_PUBLISHABLE_KEY: nonEmptyString,
    CLERK_JWT_ISSUER: nonEmptyString.optional(),
    CLERK_JWKS_URL: nonEmptyString.optional(),
    R2_ACCOUNT_ID: nonEmptyString,
    R2_BUCKET: nonEmptyString,
    R2_ACCESS_KEY_ID: nonEmptyString,
    R2_SECRET_ACCESS_KEY: nonEmptyString,
    R2_ENDPOINT: z.url(),
    R2_PUBLIC_BASE_URL: z.url().optional(),
    SILICONFLOW_PROVIDER_ENABLED: z.stringbool().default(false),
    SILICONFLOW_API_KEY: nonEmptyString.optional(),
    SILICONFLOW_IMAGE_MODEL: nonEmptyString.default('black-forest-labs/FLUX.2-flex'),
    SILICONFLOW_IMAGE_TIMEOUT_MS: z.coerce.number().int().positive().default(120000),
    ENRICH_PROMPT: z.stringbool().default(false),
    OPENAI_API_KEY: nonEmptyString.optional(),
    OPENAI_PROMPT_MODEL: nonEmptyString.optional(),
    CORS_ORIGIN: z.string().optional(),
  })
  .superRefine((env, context) => {
    if (!env.CLERK_JWT_ISSUER && !env.CLERK_JWKS_URL) {
      context.addIssue({
        code: 'custom',
        message: 'Set CLERK_JWT_ISSUER or CLERK_JWKS_URL.',
        path: ['CLERK_JWT_ISSUER'],
      });
    }

    if (env.SILICONFLOW_PROVIDER_ENABLED && !env.SILICONFLOW_API_KEY) {
      context.addIssue({
        code: 'custom',
        message: 'SILICONFLOW_API_KEY is required when SILICONFLOW_PROVIDER_ENABLED is true.',
        path: ['SILICONFLOW_API_KEY'],
      });
    }

    if (env.ENRICH_PROMPT && !env.OPENAI_API_KEY) {
      context.addIssue({
        code: 'custom',
        message: 'OPENAI_API_KEY is required when ENRICH_PROMPT is true.',
        path: ['OPENAI_API_KEY'],
      });
    }

    if (env.ENRICH_PROMPT && !env.OPENAI_PROMPT_MODEL) {
      context.addIssue({
        code: 'custom',
        message: 'OPENAI_PROMPT_MODEL is required when ENRICH_PROMPT is true.',
        path: ['OPENAI_PROMPT_MODEL'],
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export class EnvValidationError extends Error {
  constructor(readonly issues: z.core.$ZodIssue[]) {
    super(`Invalid environment configuration:\n${issues.map(formatIssue).join('\n')}`);
    this.name = 'EnvValidationError';
  }
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    throw new EnvValidationError(result.error.issues);
  }

  return result.data;
}

export function getCorsOrigins(config: Env): string[] {
  return (
    config.CORS_ORIGIN?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []
  );
}

function formatIssue(issue: z.core.$ZodIssue): string {
  const path = issue.path.join('.') || 'environment';
  return `- ${path}: ${issue.message}`;
}
