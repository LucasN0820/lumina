import 'dotenv/config';

import { defineConfig } from 'prisma/config';

const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://unconfigured:unconfigured@127.0.0.1:1/lumina';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
