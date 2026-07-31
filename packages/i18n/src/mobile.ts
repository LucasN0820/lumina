import { setupI18n, type Messages } from '@lingui/core';

import type { AppLocale } from './locales';

export const mobileLocaleStorageKey = 'lumina.locale';

export async function loadMobileMessages(locale: AppLocale): Promise<Messages> {
  const catalog =
    locale === 'zh-CN'
      ? await import('../locales/zh-CN/mobile')
      : await import('../locales/en/mobile');

  return catalog.messages;
}

export async function createMobileI18n(locale: AppLocale) {
  const messages = await loadMobileMessages(locale);

  return setupI18n({ locale, messages: { [locale]: messages } });
}
