import type { ReactElement } from 'react';
import { Image } from 'expo-image';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
}: WallpaperGridProps) {
  const theme = useTheme();

  return (
    <FlatList
      columnWrapperStyle={items.length > 0 ? { gap: 12 } : undefined}
      contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 32 }}
      contentInsetAdjustmentBehavior="automatic"
      data={items}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        isLoading ? (
          <View style={{ alignItems: 'center', gap: 10, paddingVertical: 56 }}>
            <ActivityIndicator color={theme.accent} />
            <ThemedText variant="body">正在加载壁纸库…</ThemedText>
          </View>
        ) : (
          <ThemedView style={{ alignItems: 'center', gap: 10, paddingVertical: 32 }} variant="card">
            <ThemedText variant="subtitle">还没有壁纸</ThemedText>
            <ThemedText style={{ color: theme.mutedText, textAlign: 'center' }} variant="body">
              去创作一张属于你的壁纸，它会自动保存在这里。
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={onCreate}
              testID="create-wallpaper-button"
            >
              <ThemedText style={{ color: theme.accent }} variant="body">
                去创作
              </ThemedText>
            </Pressable>
          </ThemedView>
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
      renderItem={({ item }) => <WallpaperGridItem item={item} onPress={() => onSelect(item)} />}
      testID="wallpaper-grid"
    />
  );
}

function WallpaperGridItem({ item, onPress }: { item: WallpaperListItem; onPress: () => void }) {
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
          borderRadius: 18,
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
    </Pressable>
  );
}

function formatDate(createdAt: string): string {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? '已生成' : date.toLocaleDateString();
}
