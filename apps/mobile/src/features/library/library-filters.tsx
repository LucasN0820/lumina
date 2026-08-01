import { useLingui } from '@lingui/react/macro';
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
  const { t } = useLingui();
  const theme = useTheme();
  const allLabel = t({ id: 'mobile.library.filter.all', message: 'All' });
  const options = [
    { label: allLabel, value: undefined },
    ...categories.map((value) => ({ label: value, value })),
  ];

  return (
    <View style={{ gap: 8 }}>
      <ScrollView horizontal>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {options.map((option) => {
            const selected = selectedCategory === option.value;
            return (
              <FilterChip
                key={option.value ?? 'all'}
                label={option.label}
                onPress={() => onCategoryChange(option.value)}
                selected={selected}
                theme={theme}
              />
            );
          })}
          <FilterChip
            label={t({ id: 'mobile.library.filter.favorites', message: 'Favorites' })}
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
