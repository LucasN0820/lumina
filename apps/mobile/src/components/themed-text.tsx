import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type TextVariant = 'body' | 'caption' | 'display' | 'label' | 'subtitle' | 'title';

export type ThemedTextProps = TextProps & {
  variant?: TextVariant;
};

const variantStyles: Record<TextVariant, TextStyle> = {
  body: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 12, lineHeight: 17 },
  display: { fontSize: 36, fontWeight: '700', letterSpacing: -1.2, lineHeight: 42 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.7, lineHeight: 16 },
  subtitle: { fontSize: 17, fontWeight: '600', letterSpacing: -0.2, lineHeight: 23 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.8, lineHeight: 34 },
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
