import { PixelRatio, useWindowDimensions } from 'react-native';

export type WallpaperSize = {
  pixelHeight: number;
  pixelWidth: number;
  targetHeight: number;
  targetWidth: number;
};

export function getRecommendedWallpaperSize(
  width: number,
  height: number,
  pixelRatio: number,
): WallpaperSize {
  const pixelWidth = Math.max(1, Math.round(width * pixelRatio));
  const pixelHeight = Math.max(1, Math.round(height * pixelRatio));
  const scale = Math.max(1, 2_048 / Math.max(pixelWidth, pixelHeight));

  return {
    pixelHeight,
    pixelWidth,
    targetHeight: roundToMultiple(pixelHeight * scale, 8),
    targetWidth: roundToMultiple(pixelWidth * scale, 8),
  };
}

export function useDeviceSize(): WallpaperSize {
  const { height, width } = useWindowDimensions();
  return getRecommendedWallpaperSize(width, height, PixelRatio.get());
}

function roundToMultiple(value: number, multiple: number): number {
  return Math.max(multiple, Math.round(value / multiple) * multiple);
}
