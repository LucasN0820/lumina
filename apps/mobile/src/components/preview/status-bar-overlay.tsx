import { View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type StatusBarOverlayProps = {
  color?: string;
};

const barHeights = [5, 8, 11, 14];

export function StatusBarOverlay({ color = '#FFFFFF' }: StatusBarOverlayProps) {
  const sharedStyle: ViewStyle = { backgroundColor: color, borderCurve: 'continuous' };

  return (
    <View
      pointerEvents="none"
      style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}
      testID="preview-status-bar"
    >
      <ThemedText style={{ color, fontSize: 12, fontWeight: '700', letterSpacing: -0.2 }}>
        9:41
      </ThemedText>
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
        <View
          style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 1 }}
          testID="preview-signal"
        >
          {barHeights.map((height) => (
            <View key={height} style={{ ...sharedStyle, height, width: 2 }} />
          ))}
        </View>
        <View
          style={{ borderColor: color, borderRadius: 3, borderWidth: 1, padding: 1 }}
          testID="preview-battery"
        >
          <View style={{ ...sharedStyle, height: 6, width: 13 }} />
        </View>
      </View>
    </View>
  );
}
