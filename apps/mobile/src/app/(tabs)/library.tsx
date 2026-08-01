import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { ErrorState } from '@/components/feedback';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { ApplySheet } from '@/features/apply/ApplySheet';
import { PresetManager } from '@/features/library/PresetManager';
import { LibraryFilters } from '@/features/library/library-filters';
import { WallpaperDetail } from '@/features/library/WallpaperDetail';
import { WallpaperGrid } from '@/features/library/WallpaperGrid';
import { useWallpapers } from '@/features/library/use-wallpapers';
import { useLibraryStore } from '@/stores/library-store';

export default function LibraryTab() {
  const router = useRouter();
  const selectedWallpaper = useLibraryStore((state) => state.selectedWallpaper);
  const isApplySheetVisible = useLibraryStore((state) => state.isApplySheetVisible);
  const previewMode = useLibraryStore((state) => state.previewMode);
  const selectedCategory = useLibraryStore((state) => state.selectedCategory);
  const favoritesOnly = useLibraryStore((state) => state.favoritesOnly);
  const closeWallpaper = useLibraryStore((state) => state.closeWallpaper);
  const selectWallpaper = useLibraryStore((state) => state.selectWallpaper);
  const setApplySheetVisible = useLibraryStore((state) => state.setApplySheetVisible);
  const setPreviewMode = useLibraryStore((state) => state.setPreviewMode);
  const setSelectedCategory = useLibraryStore((state) => state.setSelectedCategory);
  const setFavoritesOnly = useLibraryStore((state) => state.setFavoritesOnly);
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
        actionSlot={
          selectedWallpaper.resultImageUrl ? (
            <>
              <Button
                icon="download"
                label="应用、保存或分享"
                onPress={() => setApplySheetVisible(true)}
              />
              <ApplySheet
                imageUrl={selectedWallpaper.resultImageUrl}
                onDismiss={() => setApplySheetVisible(false)}
                visible={isApplySheetVisible}
              />
            </>
          ) : undefined
        }
        onClose={closeWallpaper}
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
            <SectionHeading
              description="所有生成结果都会自动归档。收藏、预览，随时重新使用。"
              eyebrow="Archive"
              title="你的壁纸库"
            />
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
          selectWallpaper(wallpaper);
        }}
        onToggleFavorite={wallpapers.toggleFavorite}
      />
    </View>
  );
}
