import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { View } from 'react-native';

import { ErrorState, LoadingState } from '@/components/feedback';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { uploadSourceImage } from '@/lib/api';

type ImagePickerEntryProps = {
  onUploaded: (sourceImageUrl: string) => void;
  sourceImageUrl?: string;
};

const supportedContentTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function ImagePickerEntry({ onUploaded, sourceImageUrl }: ImagePickerEntryProps) {
  const [error, setError] = useState<Error>();
  const [isUploading, setIsUploading] = useState(false);
  const [localUri, setLocalUri] = useState<string>();
  const theme = useTheme();

  async function chooseImage() {
    setError(undefined);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        mediaTypes: ['images'],
        quality: 1,
      });
      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      const contentType = asset.mimeType ?? 'image/jpeg';
      if (!supportedContentTypes.has(contentType)) {
        throw new Error('请选择 JPEG、PNG 或 WebP 图片。');
      }

      setLocalUri(asset.uri);
      setIsUploading(true);
      onUploaded(
        await uploadSourceImage(
          asset.uri,
          contentType as 'image/jpeg' | 'image/png' | 'image/webp',
        ),
      );
    } catch (reason) {
      const nextError = reason instanceof Error ? reason : new Error('图片上传失败，请重试。');
      setError(
        nextError.message.includes('native module')
          ? new Error('图片组件未安装完整，请安装最新的开发版本。')
          : nextError,
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <View style={{ gap: 10 }}>
      <ThemedText variant="subtitle">从已有图开始</ThemedText>
      <ThemedText style={{ color: theme.mutedText }} variant="caption">
        从相册选一张图片，上传后可扩图、优化、修改或提取风格。
      </ThemedText>
      {localUri || sourceImageUrl ? (
        <Image
          accessibilityLabel="Selected source image"
          contentFit="cover"
          source={localUri ?? sourceImageUrl}
          style={{ borderRadius: 14, height: 180, width: '100%' }}
        />
      ) : null}
      {isUploading ? <LoadingState label="正在安全上传图片…" /> : null}
      {error ? <ErrorState message={error.message} onRetry={() => void chooseImage()} /> : null}
      <Button
        disabled={isUploading}
        icon="upload"
        label={sourceImageUrl ? '更换图片' : '选择图片'}
        loading={isUploading}
        onPress={() => void chooseImage()}
        testID="pick-source-image"
        variant="secondary"
      />
    </View>
  );
}
