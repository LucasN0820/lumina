import { ActivityIndicator, Pressable, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'destructive' | 'ghost' | 'primary' | 'secondary';

type ButtonProps = {
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: AppIconName;
  label: string;
  loading?: boolean;
  onPress: () => void;
  testID?: string;
  variant?: ButtonVariant;
};

export function Button({
  disabled = false,
  fullWidth = false,
  icon,
  label,
  loading = false,
  onPress,
  testID,
  variant = 'primary',
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const palette = {
    destructive: { background: theme.error, border: theme.error, foreground: '#FFFFFF' },
    ghost: { background: 'transparent', border: 'transparent', foreground: theme.text },
    primary: {
      background: theme.accent,
      border: theme.accent,
      foreground: theme.accentForeground,
    },
    secondary: { background: theme.card, border: theme.border, foreground: theme.text },
  }[variant];
  const width: ViewStyle['width'] = fullWidth ? '100%' : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        backgroundColor: palette.background,
        borderColor: palette.border,
        borderCurve: 'continuous',
        borderRadius: 11,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 46,
        opacity: isDisabled ? 0.45 : pressed ? 0.72 : 1,
        paddingHorizontal: 16,
        width,
      })}
      testID={testID}
    >
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
        {loading ? (
          <ActivityIndicator color={palette.foreground} size="small" />
        ) : icon ? (
          <AppIcon color={palette.foreground} name={icon} />
        ) : null}
        <ThemedText
          style={{ color: palette.foreground, fontSize: 14, fontWeight: '600' }}
          variant="body"
        >
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}
