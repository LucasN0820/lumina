import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type HomeIconsOverlayProps = {
  color?: string;
};

const icons = [
  { color: '#4A90E2', label: 'Weather' },
  { color: '#E9635F', label: 'Photos' },
  { color: '#56B870', label: 'Notes' },
  { color: '#A26CE0', label: 'Music' },
  { color: '#F8A23B', label: 'Maps' },
  { color: '#5A79CF', label: 'Mail' },
  { color: '#D55B91', label: 'Health' },
  { color: '#5BAFC1', label: 'Files' },
];

export function HomeIconsOverlay({ color = '#FFFFFF' }: HomeIconsOverlayProps) {
  return (
    <View
      pointerEvents="none"
      style={{ gap: 16, paddingHorizontal: 18 }}
      testID="preview-home-icons"
    >
      {[0, 1].map((row) => (
        <View key={row} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {icons.slice(row * 4, row * 4 + 4).map((icon) => (
            <View key={icon.label} style={{ alignItems: 'center', gap: 4, width: 42 }}>
              <View
                style={{
                  backgroundColor: icon.color,
                  borderCurve: 'continuous',
                  borderRadius: 11,
                  height: 42,
                  width: 42,
                }}
              />
              <ThemedText
                numberOfLines={1}
                style={{ color, fontSize: 9, textAlign: 'center', width: 52 }}
              >
                {icon.label}
              </ThemedText>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
