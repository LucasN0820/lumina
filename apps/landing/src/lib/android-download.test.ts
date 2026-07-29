import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getAndroidDownloadUrl } from './android-download';

describe('getAndroidDownloadUrl', () => {
  const environmentVariableName = 'NEXT_PUBLIC_ANDROID_DOWNLOAD_URL';
  let originalEnvironmentValue: string | undefined;

  beforeEach(() => {
    originalEnvironmentValue = process.env[environmentVariableName];
    delete process.env[environmentVariableName];
  });

  afterEach(() => {
    if (originalEnvironmentValue === undefined) {
      delete process.env[environmentVariableName];
    } else {
      process.env[environmentVariableName] = originalEnvironmentValue;
    }
  });

  it('normalizes a valid HTTPS origin', () => {
    expect(getAndroidDownloadUrl('https://example.com')).toBe('https://example.com/');
  });

  it('returns a normalized HTTPS URL', () => {
    expect(getAndroidDownloadUrl('https://play.google.com/store/apps/details?id=app.lumina')).toBe(
      'https://play.google.com/store/apps/details?id=app.lumina',
    );
  });

  it('returns undefined when the default environment lookup is absent', () => {
    expect(getAndroidDownloadUrl()).toBeUndefined();
  });

  it('reads a valid URL from the default environment lookup', () => {
    process.env[environmentVariableName] = 'https://example.com/download';

    expect(getAndroidDownloadUrl()).toBe('https://example.com/download');
  });

  it.each(['', '  ', 'http://example.com', 'javascript:alert(1)', 'not a URL'])(
    'returns undefined for %j',
    (value) => {
      expect(getAndroidDownloadUrl(value)).toBeUndefined();
    },
  );
});
