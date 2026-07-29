import type React from 'react';

import { Trans } from '@lingui/react/macro';

export type PreviewVariant = 'aurora' | 'bloom' | 'night';

export type DevicePreviewProps = {
  className?: string;
  label: string;
  variant: PreviewVariant;
};

export function DevicePreview({
  className,
  label,
  variant,
}: DevicePreviewProps): React.JSX.Element {
  const previewClassName = ['device-preview', `device-preview--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <figure className={previewClassName}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="device-preview__shell">
        <div className="device-preview__screen">
          <div aria-hidden="true" className="device-preview__clock">
            <span>08:24</span>
            <span>
              <Trans id="landing.devicePreview.date">Wednesday · July 29</Trans>
            </span>
          </div>
          <div aria-hidden="true" className="device-preview__status">
            <span className="device-preview__signal" />
            <span className="device-preview__battery" />
          </div>
          <span className="device-preview__gesture" />
        </div>
      </div>
    </figure>
  );
}
