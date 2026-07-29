import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { setI18n } from '@lingui/react/server';
import { createLandingI18n } from '@lumina/i18n/landing';
import { isSupportedLocale, supportedLocales } from '@lumina/i18n';
import { notFound } from 'next/navigation';

import '../globals.css';

type LayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const isChinese = locale === 'zh-CN';

  return {
    alternates: {
      languages: { en: '/en', 'zh-CN': '/zh-CN' },
    },
    description: isChinese
      ? '用 AI 创建、编辑并应用属于你的 Android 壁纸。'
      : 'Create, edit, and apply Android wallpapers that feel personal with AI.',
    title: isChinese ? 'Lumina — 让屏幕成为你的世界' : 'Lumina — Make your screen feel like yours',
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  setI18n(await createLandingI18n(locale));

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
