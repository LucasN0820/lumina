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
    CODEX_PROVIDER_ENABLED: z.stringbool().default(false),
    CODEX_MODEL: nonEmptyString.optional(),
    CODEX_WORKDIR: nonEmptyString.optional(),
    CODEX_IMAGE_TIMEOUT_MS: z.coerce.number().int().positive().default(120000),
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

    if (env.CODEX_PROVIDER_ENABLED && !env.CODEX_MODEL) {
      context.addIssue({
        code: 'custom',
        message: 'CODEX_MODEL is required when CODEX_PROVIDER_ENABLED is true.',
        path: ['CODEX_MODEL'],
      });
    }

    if (env.CODEX_PROVIDER_ENABLED && !env.CODEX_WORKDIR) {
      context.addIssue({
        code: 'custom',
        message: 'CODEX_WORKDIR is required when CODEX_PROVIDER_ENABLED is true.',
        path: ['CODEX_WORKDIR'],
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
