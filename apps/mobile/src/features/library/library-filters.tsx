import { Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type LibraryFiltersProps = {
  categories: string[];
  favoritesOnly: boolean;
  onCategoryChange: (category: string | undefined) => void;
  onFavoritesOnlyChange: (value: boolean) => void;
  selectedCategory?: string;
};

export function LibraryFilters({
  categories,
  favoritesOnly,
  onCategoryChange,
  onFavoritesOnlyChange,
  selectedCategory,
}: LibraryFiltersProps) {
  const theme = useTheme();
  const options = ['全部', ...categories];

  return (
    <View style={{ gap: 8 }}>
      <ScrollView horizontal>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {options.map((option) => {
            const category = option === '全部' ? undefined : option;
            const selected = selectedCategory === category;
            return (
              <FilterChip
                key={option}
                label={option}
                onPress={() => onCategoryChange(category)}
                selected={selected}
                theme={theme}
              />
            );
          })}
          <FilterChip
            label="已收藏"
            onPress={() => onFavoritesOnlyChange(!favoritesOnly)}
            selected={favoritesOnly}
            theme={theme}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function FilterChip({
  label,
  onPress,
  selected,
  theme,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        backgroundColor: selected ? theme.accent : theme.surface,
        borderColor: selected ? theme.accent : theme.border,
        borderCurve: 'continuous',
        borderRadius: 9,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
      testID={`library-filter-${label}`}
    >
      <ThemedText
        style={{ color: selected ? theme.accentForeground : theme.text }}
        variant="caption"
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}
