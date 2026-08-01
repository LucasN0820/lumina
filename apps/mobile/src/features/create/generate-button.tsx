import { Button } from '@/components/ui/button';

type GenerateButtonProps = {
  disabled: boolean;
  isGenerating: boolean;
  onPress: () => void;
};

export function GenerateButton({ disabled, isGenerating, onPress }: GenerateButtonProps) {
  return (
    <Button
      disabled={disabled}
      fullWidth
      icon="sparkles"
      label={isGenerating ? '正在生成…' : '生成壁纸'}
      loading={isGenerating}
      onPress={onPress}
      testID="generate-button"
    />
  );
}
