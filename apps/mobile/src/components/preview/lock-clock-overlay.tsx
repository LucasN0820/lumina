import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type LockClockOverlayProps = {
  color?: string;
};

export function LockClockOverlay({ color = '#FFFFFF' }: LockClockOverlayProps) {
  return (
    <View pointerEvents="none" style={{ alignItems: 'center', gap: 2 }} testID="preview-lock-clock">
      <ThemedText style={{ color, fontSize: 16, fontWeight: '600' }}>Tuesday, July 26</ThemedText>
      <ThemedText
        style={{
          color,
          fontSize: 72,
          fontVariant: ['tabular-nums'],
          fontWeight: '200',
          letterSpacing: -3,
          lineHeight: 82,
        }}
      >
        9:41
      </ThemedText>
    </View>
  );
}
