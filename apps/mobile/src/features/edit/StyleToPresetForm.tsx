import { useLingui } from '@lingui/react/macro';
import { TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

type StyleToPresetFormProps = {
  instruction: string;
  isSubmitting: boolean;
  onChangeInstruction: (instruction: string) => void;
  onSubmit: (instruction: string) => void;
};

export function StyleToPresetForm({
  instruction,
  isSubmitting,
  onChangeInstruction,
  onSubmit,
}: StyleToPresetFormProps) {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <View style={{ gap: 10 }}>
      <ThemedText variant="subtitle">
        {t({ id: 'mobile.edit.style.title', message: 'Extract style' })}
      </ThemedText>
      <ThemedText style={{ color: theme.mutedText }} variant="caption">
        {t({
          id: 'mobile.edit.style.description',
          message: 'Analyze color, composition, and texture to save a private creative preset.',
        })}
      </ThemedText>
      <TextInput
        editable={!isSubmitting}
        onChangeText={onChangeInstruction}
        placeholder={t({
          id: 'mobile.edit.style.placeholder',
          message: 'Optional: describe the details you want to preserve',
        })}
        placeholderTextColor={theme.mutedText}
        style={{
          borderColor: theme.border,
          borderCurve: 'continuous',
          borderRadius: 12,
          borderWidth: 1,
          color: theme.text,
          minHeight: 48,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
        testID="style-preset-instruction"
        value={instruction}
      />
      <Button
        disabled={isSubmitting}
        label={
          isSubmitting
            ? t({ id: 'mobile.edit.style.extracting', message: 'Extracting…' })
            : t({ id: 'mobile.edit.style.save', message: 'Save custom preset' })
        }
        loading={isSubmitting}
        onPress={() =>
          onSubmit(instruction || 'Extract a reusable wallpaper style from this image.')
        }
        testID="extract-style-preset"
      />
    </View>
  );
}
