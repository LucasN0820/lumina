import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { getWallpapers, type WallpaperListItem, type WallpapersResponse } from '@/lib/api';
import { useAnonymousDeviceId } from '@/lib/device-id';

const defaultPageSize = 20;

export function useWallpapers(pageSize = defaultPageSize) {
  const anonymousDevice = useAnonymousDeviceId();
  const query = useInfiniteQuery<
    WallpapersResponse,
    Error,
    InfiniteData<WallpapersResponse>,
    [string, string | undefined, number],
    number
  >({
    enabled: Boolean(anonymousDevice.deviceId),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      if (!anonymousDevice.deviceId) {
        throw new Error('An anonymous device ID is required to load wallpapers.');
      }

      return getWallpapers({
        deviceId: anonymousDevice.deviceId,
        limit: pageSize,
        page: pageParam,
      });
    },
    queryKey: ['wallpapers', anonymousDevice.deviceId, pageSize],
  });
  const wallpapers = query.data?.pages.flatMap((page) => page.items) ?? [];

  return {
    ...query,
    deviceId: anonymousDevice.deviceId,
    deviceIdError: anonymousDevice.error,
    isPreparingDeviceId: anonymousDevice.isLoading,
    wallpapers,
  };
}

export type WallpaperItem = WallpaperListItem;
