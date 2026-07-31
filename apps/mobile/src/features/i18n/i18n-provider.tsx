import { I18nProvider } from '@lingui/react';
import { createMobileI18n, mobileLocaleStorageKey } from '@lumina/i18n/mobile';
import { defaultLocale, resolveLocale, type AppLocale } from '@lumina/i18n';
import { getLocales } from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import type { I18n } from '@lingui/core';

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => Promise<void>;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function MobileI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setActiveLocale] = useState<AppLocale>(defaultLocale);
  const [i18n, setI18n] = useState<I18n | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      const storedLocale = await SecureStore.getItemAsync(mobileLocaleStorageKey);
      const nextLocale = resolveLocale(storedLocale ?? getLocales()[0].languageTag);
      const nextI18n = await createMobileI18n(nextLocale);

      if (isMounted) {
        setActiveLocale(nextLocale);
        setI18n(nextI18n);
      }
    }

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  async function setLocale(nextLocale: AppLocale) {
    const nextI18n = await createMobileI18n(nextLocale);
    await SecureStore.setItemAsync(mobileLocaleStorageKey, nextLocale);
    setActiveLocale(nextLocale);
    setI18n(nextI18n);
  }

  if (!i18n) {
    return null;
  }

  return (
    <LocaleContext value={{ locale, setLocale }}>
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    </LocaleContext>
  );
}

export function useAppLocale(): LocaleContextValue {
  const context = use(LocaleContext);

  if (!context) {
    throw new Error('useAppLocale must be used inside MobileI18nProvider.');
  }

  return context;
}
