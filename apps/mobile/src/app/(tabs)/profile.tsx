import { ScrollView } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfileTab() {
  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 24 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ThemedView variant="card" style={{ gap: 8 }}>
        <ThemedText variant="title">我的</ThemedText>
        <ThemedText variant="body">登录与设备历史绑定将在认证模块中接入。</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}
