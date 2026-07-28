import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { ErrorState } from '@/components/feedback';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PresetManager } from '@/features/library/PresetManager';
import { LibraryFilters } from '@/features/library/library-filters';
import { WallpaperDetail } from '@/features/library/WallpaperDetail';
import { WallpaperGrid } from '@/features/library/WallpaperGrid';
import { useWallpapers } from '@/features/library/use-wallpapers';
import { useTheme } from '@/hooks/use-theme';
import type { WallpaperPreviewMode } from '@/components/WallpaperPreview';
import type { WallpaperListItem } from '@/lib/api';

export default function LibraryTab() {
  const router = useRouter();
  const theme = useTheme();
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperListItem>();
  const [previewMode, setPreviewMode] = useState<WallpaperPreviewMode>('lock-screen');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const wallpapers = useWallpapers({ category: selectedCategory, favoritesOnly });
  const error = wallpapers.deviceIdError ?? wallpapers.error ?? wallpapers.favoriteError;
  const categories = [
    ...new Set(
      wallpapers.wallpapers.flatMap((wallpaper) =>
        wallpaper.category ? [wallpaper.category] : [],
      ),
    ),
  ];

  if (selectedWallpaper) {
    return (
      <WallpaperDetail
        onClose={() => setSelectedWallpaper(undefined)}
        onModeChange={setPreviewMode}
        previewMode={previewMode}
        wallpaper={selectedWallpaper}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {error ? (
        <View style={{ padding: 16 }}>
          <ErrorState message={error.message} onRetry={() => void wallpapers.refetch()} />
        </View>
      ) : null}
      <WallpaperGrid
        header={
          <View style={{ gap: 12 }}>
            <ThemedView variant="card" style={{ gap: 6 }}>
              <ThemedText variant="title">壁纸库</ThemedText>
              <ThemedText style={{ color: theme.mutedText }} variant="body">
                你的生成记录会按当前设备保存，可随时预览。
              </ThemedText>
            </ThemedView>
            <LibraryFilters
              categories={categories}
              favoritesOnly={favoritesOnly}
              onCategoryChange={setSelectedCategory}
              onFavoritesOnlyChange={setFavoritesOnly}
              selectedCategory={selectedCategory}
            />
            <PresetManager />
          </View>
        }
        isLoading={
          wallpapers.isLoading || wallpapers.isFetchingNextPage || wallpapers.isPreparingDeviceId
        }
        isRefreshing={wallpapers.isRefetching && !wallpapers.isFetchingNextPage}
        items={wallpapers.wallpapers}
        onCreate={() => router.navigate('/')}
        onEndReached={() => {
          if (wallpapers.hasNextPage && !wallpapers.isFetchingNextPage) {
            void wallpapers.fetchNextPage();
          }
        }}
        onRefresh={() => void wallpapers.refetch()}
        onSelect={(wallpaper) => {
          setPreviewMode('lock-screen');
          setSelectedWallpaper(wallpaper);
        }}
        onToggleFavorite={wallpapers.toggleFavorite}
      />
    </View>
  );
}
