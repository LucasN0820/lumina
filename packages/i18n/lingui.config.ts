import { defineConfig } from '@lingui/cli';
import { formatter } from '@lingui/format-po';

export default defineConfig({
  rootDir: '.',
  catalogs: [
    {
      include: ['<rootDir>/apps/landing/src'],
      path: '<rootDir>/packages/i18n/locales/{locale}/landing',
    },
    {
      include: ['<rootDir>/apps/mobile/src'],
      path: '<rootDir>/packages/i18n/locales/{locale}/mobile',
    },
  ],
  format: formatter({ lineNumbers: false }),
  locales: ['en', 'zh-CN'],
  orderBy: 'messageId',
  sourceLocale: 'en',
});
