export const supportedLocales = ['en', 'zh-CN'] as const;

export type AppLocale = (typeof supportedLocales)[number];

export const defaultLocale: AppLocale = 'en';

export function resolveLocale(locale: string | null | undefined): AppLocale {
  if (!locale) {
    return defaultLocale;
  }

  const normalizedLocale = locale.replace('_', '-').toLowerCase();

  return normalizedLocale === 'zh' || normalizedLocale.startsWith('zh-') ? 'zh-CN' : 'en';
}

export function isSupportedLocale(locale: string): locale is AppLocale {
  return supportedLocales.includes(locale as AppLocale);
}
