import { useCallback, useState } from 'react';

import { setWallpaper, type WallpaperTarget } from '../../../modules/expo-wallpaper';

import { downloadWallpaper } from './local-wallpaper';

export function useApplyWallpaper(imageUrl: string) {
  const [error, setError] = useState<Error>();
  const [isApplying, setIsApplying] = useState(false);

  const applyWallpaper = useCallback(
    async (target: WallpaperTarget) => {
      setError(undefined);
      setIsApplying(true);

      try {
        const localUri = await downloadWallpaper(imageUrl);
        await setWallpaper(localUri, target);
      } catch (cause) {
        const nextError = cause instanceof Error ? cause : new Error('应用壁纸失败，请稍后重试。');
        setError(nextError);
        throw nextError;
      } finally {
        setIsApplying(false);
      }
    },
    [imageUrl],
  );

  return { applyWallpaper, error, isApplying };
}
