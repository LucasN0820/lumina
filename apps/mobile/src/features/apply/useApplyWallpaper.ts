import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';

import { setWallpaper, type WallpaperTarget } from '../../../modules/expo-wallpaper';

import { downloadWallpaper } from './local-wallpaper';

export function useApplyWallpaper(imageUrl: string) {
  const { t } = useLingui();
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
        const nextError =
          cause instanceof Error
            ? cause
            : new Error(
                t({
                  id: 'mobile.apply.failed',
                  message: 'Could not apply the wallpaper. Try again later.',
                }),
              );
        setError(nextError);
        throw nextError;
      } finally {
        setIsApplying(false);
      }
    },
    [imageUrl, t],
  );

  return { applyWallpaper, error, isApplying };
}
