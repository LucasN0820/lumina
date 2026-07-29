import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'Lumina — 让屏幕成为你的世界 | AI Wallpaper',
  description:
    '用 AI 创建、编辑并应用属于你的 Android 壁纸。 Create and apply AI wallpapers that feel personal.',
  robots: {
    follow: true,
    index: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
