import { setupI18n, type Messages } from '@lingui/core';

import type { AppLocale } from './locales';

export async function loadLandingMessages(locale: AppLocale): Promise<Messages> {
  const catalog =
    locale === 'zh-CN'
      ? await import('../locales/zh-CN/landing')
      : await import('../locales/en/landing');

  return catalog.messages;
}

export async function createLandingI18n(locale: AppLocale) {
  const messages = await loadLandingMessages(locale);

  return setupI18n({ locale, messages: { [locale]: messages } });
}
