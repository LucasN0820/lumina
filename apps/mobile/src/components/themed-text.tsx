import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type TextVariant = 'body' | 'caption' | 'subtitle' | 'title';

export type ThemedTextProps = TextProps & {
  variant?: TextVariant;
};

const variantStyles: Record<TextVariant, TextStyle> = {
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 13, lineHeight: 18 },
  subtitle: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  title: { fontSize: 30, fontWeight: '700', lineHeight: 36 },
};

export function ThemedText({ style, variant = 'body', ...props }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      selectable
      {...props}
      style={[{ color: theme.text, fontFamily: theme.fontFamily }, variantStyles[variant], style]}
    />
  );
}
