import { ScrollView } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LibraryTab() {
  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 24 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ThemedView variant="card" style={{ gap: 8 }}>
        <ThemedText variant="title">壁纸库</ThemedText>
        <ThemedText variant="body">生成的壁纸会在这里按设备历史展示。</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}
