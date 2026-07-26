import { ScrollView } from 'react-native';

import { ErrorState, LoadingState } from '@/components/feedback';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHealthQuery } from '@/hooks/use-health-query';
import { hasApiBaseUrl } from '@/lib/api';
import { useDeviceSize } from '@/lib/useDeviceSize';

export default function CreateTab() {
  const deviceSize = useDeviceSize();
  const healthQuery = useHealthQuery();

  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 24 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ThemedView variant="card" style={{ gap: 8 }}>
        <ThemedText variant="title">开始创作</ThemedText>
        <ThemedText variant="body">选择预设、描述灵感，即可生成专属壁纸。</ThemedText>
      </ThemedView>

      <ThemedView variant="card" style={{ gap: 8 }}>
        <ThemedText variant="subtitle">推荐出图尺寸</ThemedText>
        <ThemedText variant="body">
          {deviceSize.targetWidth} × {deviceSize.targetHeight}
        </ThemedText>
        <ThemedText variant="caption">
          当前屏幕像素：{deviceSize.pixelWidth} × {deviceSize.pixelHeight}
        </ThemedText>
      </ThemedView>

      <ThemedView variant="card" style={{ gap: 8 }}>
        <ThemedText variant="subtitle">服务状态</ThemedText>
        {!hasApiBaseUrl ? (
          <ThemedText variant="body">设置 EXPO_PUBLIC_API_URL 后即可连接 Lumina 服务。</ThemedText>
        ) : healthQuery.isPending ? (
          <LoadingState label="正在连接服务…" />
        ) : healthQuery.isError ? (
          <ErrorState
            message={healthQuery.error.message}
            onRetry={() => void healthQuery.refetch()}
          />
        ) : (
          <ThemedText variant="body">
            {healthQuery.data.ok ? '服务已连接。' : '服务返回了未知状态。'}
          </ThemedText>
        )}
      </ThemedView>
    </ScrollView>
  );
}
