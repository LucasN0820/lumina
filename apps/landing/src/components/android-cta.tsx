import type React from 'react';

import { getAndroidDownloadUrl } from '@/lib/android-download';

export interface AndroidCtaProps {
  className?: string;
  compact?: boolean;
}

export function AndroidCta({ className, compact = false }: AndroidCtaProps): React.JSX.Element {
  const href = getAndroidDownloadUrl();
  const ctaClassName = [className, compact ? 'android-cta--compact' : undefined]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <a className={ctaClassName} href={href} rel="noreferrer" target="_blank">
        <span>下载 Android</span>
        <span>Download for Android</span>
      </a>
    );
  }

  return (
    <button aria-label="下载 Android / Download for Android" className={ctaClassName} type="button">
      <span>下载 Android</span>
      <span>Download for Android</span>
    </button>
  );
}
