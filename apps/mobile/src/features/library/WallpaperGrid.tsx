import { useLingui } from '@lingui/react/macro';
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
  const { t } = useLingui();
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
            actionLabel={t({ id: 'mobile.library.empty.action', message: 'Create wallpaper' })}
            actionTestId="create-wallpaper-button"
            description={t({
              id: 'mobile.library.empty.description',
              message: 'Create a wallpaper and it will be saved here automatically.',
            })}
            onAction={onCreate}
            title={t({ id: 'mobile.library.empty.title', message: 'No wallpapers yet' })}
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
  const { i18n, t } = useLingui();
  const theme = useTheme();
  const imageUri = item.resultImageUrl;

  return (
    <Pressable
      accessibilityLabel={t({
        id: 'mobile.library.viewDetails',
        message: 'View wallpaper details',
      })}
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
            alt={t({ id: 'mobile.library.generatedWallpaper', message: 'Generated wallpaper' })}
            cachePolicy="memory-disk"
            contentFit="cover"
            source={{ uri: imageUri }}
            style={{ height: '100%', width: '100%' }}
            transition={120}
          />
        ) : (
          <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center', padding: 12 }}>
            <ThemedText style={{ color: theme.mutedText, textAlign: 'center' }} variant="caption">
              {t({ id: 'mobile.library.resultUnavailable', message: 'Result unavailable' })}
            </ThemedText>
          </View>
        )}
      </View>
      <ThemedText numberOfLines={1} style={{ color: theme.mutedText }} variant="caption">
        {formatDate(
          item.createdAt,
          i18n.locale,
          t({ id: 'mobile.library.generated', message: 'Generated' }),
        )}
      </ThemedText>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText numberOfLines={1} style={{ color: theme.mutedText }} variant="caption">
          {item.category ?? t({ id: 'mobile.library.uncategorized', message: 'Uncategorized' })} ·{' '}
          {item.quality === 'draft'
            ? t({ id: 'mobile.library.quality.preview', message: 'Preview' })
            : t({ id: 'mobile.library.quality.hd', message: 'HD' })}
        </ThemedText>
        <Pressable
          accessibilityLabel={
            item.favorite
              ? t({ id: 'mobile.library.unfavorite', message: 'Remove wallpaper from favorites' })
              : t({ id: 'mobile.library.favorite', message: 'Add wallpaper to favorites' })
          }
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

function formatDate(createdAt: string, locale: string, fallback: string): string {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString(locale);
}
