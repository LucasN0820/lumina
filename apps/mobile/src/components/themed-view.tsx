import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  variant?: 'card' | 'surface';
};

export function ThemedView({ style, variant = 'surface', ...props }: ThemedViewProps) {
  const theme = useTheme();

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: variant === 'card' ? theme.card : theme.surface,
          borderCurve: 'continuous',
          ...(variant === 'card'
            ? { borderColor: theme.border, borderRadius: 20, borderWidth: 1, padding: 20 }
            : {}),
        },
        style,
      ]}
    />
  );
}
