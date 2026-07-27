import { useCallback, useState } from 'react';

import { Asset, requestPermissionsAsync } from 'expo-media-library';
import { isAvailableAsync, shareAsync } from 'expo-sharing';

import { downloadWallpaper } from './local-wallpaper';

export type SaveAndShareAction = 'save' | 'share' | undefined;

export function useSaveAndShare(imageUrl: string) {
  const [error, setError] = useState<Error>();
  const [activeAction, setActiveAction] = useState<SaveAndShareAction>();

  const saveWallpaper = useCallback(async () => {
    setError(undefined);
    setActiveAction('save');

    try {
      const permission = await requestPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('需要相册写入权限才能保存壁纸。');
      }

      const localUri = await downloadWallpaper(imageUrl);
      await Asset.create(localUri);
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error('保存壁纸失败，请稍后重试。');
      setError(nextError);
      throw nextError;
    } finally {
      setActiveAction(undefined);
    }
  }, [imageUrl]);

  const shareWallpaper = useCallback(async () => {
    setError(undefined);
    setActiveAction('share');

    try {
      if (!(await isAvailableAsync())) {
        throw new Error('当前设备不支持系统分享。');
      }

      const localUri = await downloadWallpaper(imageUrl);
      await shareAsync(localUri);
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error('分享壁纸失败，请稍后重试。');
      setError(nextError);
      throw nextError;
    } finally {
      setActiveAction(undefined);
    }
  }, [imageUrl]);

  return { activeAction, error, saveWallpaper, shareWallpaper };
}
