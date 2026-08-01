import type { ReactElement } from 'react';
import { Image } from 'expo-image';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { EmptyState, Skeleton } from '@/components/feedback';
import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { useTheme } from '@/hooks/use-theme';
import type { WallpaperListItem } from '@/lib/api';

type WallpaperGridProps = {
  header?: ReactElement;
  isLoading: boolean;
  isRefreshing: boolean;
  items: WallpaperListItem[];
  onCreate: () => void;
  onEndReached: () => void;
  onRefresh: () => void;
  onSelect: (wallpaper: WallpaperListItem) => void;
  onToggleFavorite?: (wallpaper: WallpaperListItem) => void;
};

export function WallpaperGrid({
  header,
  isLoading,
  isRefreshing,
  items,
  onCreate,
  onEndReached,
  onRefresh,
  onSelect,
  onToggleFavorite = () => {},
}: WallpaperGridProps) {
  const theme = useTheme();

  return (
    <FlatList
      columnWrapperStyle={items.length > 0 ? { gap: 12 } : undefined}
      contentContainerStyle={{ gap: 16, paddingHorizontal: 20, paddingVertical: 24 }}
      contentInsetAdjustmentBehavior="automatic"
      data={items}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        isLoading ? (
          <View
            style={{ flexDirection: 'row', gap: 12, paddingVertical: 16 }}
            testID="wallpaper-skeleton"
          >
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton height={220} />
              <Skeleton width="60%" />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton height={220} />
              <Skeleton width="60%" />
            </View>
          </View>
        ) : (
          <EmptyState
            actionLabel="去创作"
            actionTestId="create-wallpaper-button"
            description="去创作一张属于你的壁纸，它会自动保存在这里。"
            onAction={onCreate}
            title="还没有壁纸"
          />
        )
      }
      ListFooterComponent={
        items.length > 0 ? (
          <View style={{ alignItems: 'center', minHeight: 28 }}>
            {isLoading ? <ActivityIndicator color={theme.accent} /> : null}
          </View>
        ) : null
      }
      ListHeaderComponent={header}
      numColumns={2}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      renderItem={({ item }) => (
        <WallpaperGridItem
          item={item}
          onPress={() => onSelect(item)}
          onToggleFavorite={() => onToggleFavorite(item)}
        />
      )}
      testID="wallpaper-grid"
    />
  );
}

function WallpaperGridItem({
  item,
  onPress,
  onToggleFavorite,
}: {
  item: WallpaperListItem;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const theme = useTheme();
  const imageUri = item.resultImageUrl;

  return (
    <Pressable
      accessibilityLabel="查看壁纸详情"
      accessibilityRole="button"
      onPress={onPress}
      style={{ flex: 1, gap: 6 }}
      testID={`wallpaper-grid-item-${item.id}`}
    >
      <View
        style={{
          aspectRatio: 0.56,
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderCurve: 'continuous',
          borderRadius: 12,
          borderWidth: 1,
          overflow: 'hidden',
        }}
      >
        {imageUri ? (
          <Image
            alt="已生成的壁纸"
            cachePolicy="memory-disk"
            contentFit="cover"
            source={{ uri: imageUri }}
            style={{ height: '100%', width: '100%' }}
            transition={120}
          />
        ) : (
          <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center', padding: 12 }}>
            <ThemedText style={{ color: theme.mutedText, textAlign: 'center' }} variant="caption">
              生成结果不可用
            </ThemedText>
          </View>
        )}
      </View>
      <ThemedText numberOfLines={1} style={{ color: theme.mutedText }} variant="caption">
        {formatDate(item.createdAt)}
      </ThemedText>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText numberOfLines={1} style={{ color: theme.mutedText }} variant="caption">
          {item.category ?? '未分类'} · {item.quality === 'draft' ? '预览' : '高清'}
        </ThemedText>
        <Pressable
          accessibilityLabel={item.favorite ? '取消收藏壁纸' : '收藏壁纸'}
          accessibilityRole="button"
          onPress={onToggleFavorite}
          hitSlop={8}
          testID={`favorite-wallpaper-${item.id}`}
        >
          <AppIcon
            color={item.favorite ? theme.text : theme.mutedText}
            name={item.favorite ? 'favorite-filled' : 'favorite'}
            size={18}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

function formatDate(createdAt: string): string {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? '已生成' : date.toLocaleDateString();
}
