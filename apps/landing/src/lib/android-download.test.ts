import { describe, expect, it } from 'vitest';

import { getAndroidDownloadUrl } from './android-download';

describe('getAndroidDownloadUrl', () => {
  it('normalizes a valid HTTPS origin', () => {
    expect(getAndroidDownloadUrl('https://example.com')).toBe('https://example.com/');
  });

  it('returns a normalized HTTPS URL', () => {
    expect(getAndroidDownloadUrl('https://play.google.com/store/apps/details?id=app.lumina')).toBe(
      'https://play.google.com/store/apps/details?id=app.lumina',
    );
  });

  it.each([undefined, '', '  ', 'http://example.com', 'javascript:alert(1)', 'not a URL'])(
    'returns undefined for %j',
    (value) => {
      expect(getAndroidDownloadUrl(value)).toBeUndefined();
    },
  );
});
