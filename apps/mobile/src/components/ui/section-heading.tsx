import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function SectionHeading({
  description,
  eyebrow,
  title,
}: {
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  const theme = useTheme();

  return (
    <View style={{ gap: 5 }}>
      {eyebrow ? (
        <ThemedText style={{ color: theme.mutedText, textTransform: 'uppercase' }} variant="label">
          {eyebrow}
        </ThemedText>
      ) : null}
      <ThemedText variant="subtitle">{title}</ThemedText>
      {description ? (
        <ThemedText style={{ color: theme.mutedText }} variant="body">
          {description}
        </ThemedText>
      ) : null}
    </View>
  );
}
