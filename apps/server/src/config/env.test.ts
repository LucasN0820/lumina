import { describe, expect, it } from 'vite-plus/test';

import { EnvValidationError, getCorsOrigins, loadEnv } from './env.js';

const validEnv = {
  CLERK_JWT_ISSUER: 'https://clerk.example.com',
  CLERK_PUBLISHABLE_KEY: 'pk_test_example',
  CLERK_SECRET_KEY: 'sk_test_example',
  DATABASE_URL: 'postgresql://postgres:password@localhost:5432/lumina',
  R2_ACCESS_KEY_ID: 'access-key',
  R2_ACCOUNT_ID: 'account-id',
  R2_BUCKET: 'lumina',
  R2_ENDPOINT: 'https://account-id.r2.cloudflarestorage.com',
  R2_SECRET_ACCESS_KEY: 'secret-key',
};

describe('loadEnv', () => {
  it('parses required configuration and defaults', () => {
    const config = loadEnv(validEnv);

    expect(config.PORT).toBe(3000);
    expect(config.CODEX_PROVIDER_ENABLED).toBe(false);
    expect(getCorsOrigins(config)).toEqual([]);
  });

  it('reports missing required configuration', () => {
    const { DATABASE_URL: _databaseUrl, ...missingDatabaseUrl } = validEnv;

    expect(() => loadEnv(missingDatabaseUrl)).toThrow(EnvValidationError);
    expect(() => loadEnv(missingDatabaseUrl)).toThrow('DATABASE_URL');
  });

  it('requires Codex configuration when the provider is enabled', () => {
    expect(() => loadEnv({ ...validEnv, CODEX_PROVIDER_ENABLED: 'true' })).toThrow(
      'CODEX_MODEL is required',
    );
  });
});
