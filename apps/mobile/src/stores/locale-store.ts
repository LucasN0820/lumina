import { defaultLocale, resolveLocale, type AppLocale } from '@lumina/i18n';
import { createMobileI18n, mobileLocaleStorageKey } from '@lumina/i18n/mobile';
import { getLocales } from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import type { I18n } from '@lingui/core';

type LocaleState = {
  i18n: I18n | null;
  initializationError?: Error;
  isInitializing: boolean;
  locale: AppLocale;
};

type LocaleActions = {
  initialize: () => Promise<void>;
  reset: () => void;
  setLocale: (locale: AppLocale) => Promise<void>;
};

export type LocaleStore = LocaleState & LocaleActions;

const initialLocaleState: LocaleState = {
  i18n: null,
  initializationError: undefined,
  isInitializing: false,
  locale: defaultLocale,
};

let initializationPromise: Promise<void> | undefined;

export const useLocaleStore = create<LocaleStore>()((set, get) => ({
  ...initialLocaleState,
  initialize: async () => {
    if (get().i18n) {
      return;
    }

    initializationPromise ??= (async () => {
      set({ initializationError: undefined, isInitializing: true });
      try {
        const storedLocale = await SecureStore.getItemAsync(mobileLocaleStorageKey).catch(
          () => null,
        );
        const nextLocale = resolveLocale(storedLocale ?? getLocales()[0].languageTag);
        const i18n = await createMobileI18n(nextLocale);
        set({ i18n, isInitializing: false, locale: nextLocale });
      } catch (reason) {
        set({
          initializationError:
            reason instanceof Error ? reason : new Error('Unable to initialize translations.'),
          isInitializing: false,
        });
      }
    })();

    try {
      await initializationPromise;
    } finally {
      initializationPromise = undefined;
    }
  },
  reset: () => {
    initializationPromise = undefined;
    set(initialLocaleState);
  },
  setLocale: async (locale) => {
    const i18n = await createMobileI18n(locale);
    set({ i18n, locale });
    await SecureStore.setItemAsync(mobileLocaleStorageKey, locale).catch(() => {});
  },
}));
