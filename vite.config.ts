import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: {
    ignorePatterns: [
      '.agents/**',
      '.claude/**',
      'example/**',
      'apps/mobile/assets/**',
      '**/node_modules/**',
      '**/.expo/**',
      '**/dist/**',
      '**/web-build/**',
      '**/coverage/**',
      '**/.vite/**',
    ],
    semi: true,
    singleQuote: true,
    printWidth: 100,
    overrides: [
      {
        files: ['**/*.md'],
        options: {
          proseWrap: 'always',
        },
      },
    ],
  },
  lint: {
    ignorePatterns: [
      '.agents/**',
      '.claude/**',
      'example/**',
      'apps/mobile/assets/**',
      '**/node_modules/**',
      '**/.expo/**',
      '**/dist/**',
      '**/web-build/**',
      '**/coverage/**',
      '**/.vite/**',
    ],
    plugins: ['typescript'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    overrides: [
      {
        files: ['apps/mobile/**/*.{ts,tsx}'],
        plugins: ['typescript', 'react'],
      },
      {
        files: ['apps/server/**/*.ts'],
        env: {
          node: true,
        },
        rules: {
          'no-console': 'off',
        },
      },
      {
        files: ['apps/server/**/*.test.ts'],
        plugins: ['typescript', 'vitest'],
      },
    ],
  },
  test: {
    include: ['apps/server/src/**/*.test.ts'],
  },
  staged: {
    '*.{js,cjs,mjs,ts,tsx,json,md,yml,yaml}': 'vp check --fix',
  },
  run: {
    cache: {
      scripts: true,
      tasks: true,
    },
    tasks: {
      'dev:all': {
        command: 'vp run --parallel --no-cache --filter=@lumina/mobile --filter=@lumina/server dev',
        cache: false,
      },
      'test:all': {
        command: 'bun --filter=@lumina/mobile run test && vp test run',
        input: [{ auto: true }, '!apps/mobile/.expo/**', '!apps/mobile/dist/**'],
        output: [{ auto: true }, '!apps/mobile/.expo/**', '!apps/mobile/dist/**'],
      },
      'build:all': {
        command: 'vp run --parallel --filter=@lumina/mobile --filter=@lumina/server build',
        output: ['apps/mobile/dist/**', 'apps/server/dist/**'],
      },
      'build:android': {
        command: 'bun --filter=@lumina/mobile run build:android',
        cache: false,
      },
    },
  },
});
