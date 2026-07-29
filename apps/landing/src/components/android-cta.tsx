import type React from 'react';

import { Trans } from '@lingui/react/macro';
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
        <span>
          <Trans id="common.androidCta">Download for Android</Trans>
        </span>
      </a>
    );
  }

  return (
    <button className={ctaClassName} type="button">
      <span>
        <Trans id="common.androidCta">Download for Android</Trans>
      </span>
    </button>
  );
}
