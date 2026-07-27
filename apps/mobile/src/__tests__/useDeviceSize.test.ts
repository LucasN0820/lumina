import { getRecommendedWallpaperSize } from '../lib/useDeviceSize';

describe('getRecommendedWallpaperSize', () => {
  it('preserves the screen aspect ratio and keeps the long edge at least 2K', () => {
    const result = getRecommendedWallpaperSize(375, 812, 3);

    expect(result).toEqual({
      pixelHeight: 2436,
      pixelWidth: 1125,
      targetHeight: 2440,
      targetWidth: 1128,
    });
  });

  it('upscales low-density screens to a 2K long edge', () => {
    const result = getRecommendedWallpaperSize(320, 640, 1);

    expect(result.targetHeight).toBe(2048);
    expect(result.targetWidth).toBe(1024);
  });
});
