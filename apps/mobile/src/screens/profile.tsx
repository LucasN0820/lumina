import { useLingui } from '@lingui/react/macro';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { LoginSheet } from '@/features/auth/LoginSheet';
import { useAuth } from '@/features/auth/useAuth';
import { useAppLocale } from '@/features/i18n/i18n-provider';
import { useTheme } from '@/hooks/use-theme';

export function ProfileScreen() {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const { locale, setLocale } = useAppLocale();
  const theme = useTheme();
  const { t } = useLingui();
  const {
    authError,
    bindError,
    isLoaded,
    isSignedIn,
    isSigningIn,
    isSyncingHistory,
    signInWithGoogle,
    signOut,
    user,
  } = useAuth();
  const googleAccount = useMemo(
    () =>
      user?.externalAccounts.find((account: { emailAddress?: string | null; provider: string }) =>
        account.provider.includes('google'),
      ),
    [user?.externalAccounts],
  );

  useEffect(() => {
    if (isSignedIn) {
      setIsLoginVisible(false);
    }
  }, [isSignedIn]);

  return (
    <ScrollView
      contentContainerStyle={{ gap: 18, paddingHorizontal: 20, paddingVertical: 24 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ThemedView variant="card" style={{ gap: 18 }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
          {user?.imageUrl ? (
            <Image
              accessibilityLabel="用户头像"
              contentFit="cover"
              source={{ uri: user.imageUrl }}
              style={{ borderRadius: 14, height: 56, width: 56 }}
            />
          ) : (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: theme.muted,
                borderRadius: 14,
                height: 56,
                justifyContent: 'center',
                width: 56,
              }}
            >
              <AppIcon color={theme.mutedText} name="profile" size={28} />
            </View>
          )}
          <View style={{ flex: 1, gap: 3 }}>
            <ThemedText numberOfLines={1} variant="subtitle">
              {isSignedIn
                ? (user?.fullName ??
                  user?.username ??
                  user?.primaryEmailAddress?.emailAddress ??
                  t({ id: 'mobile.profile.signedIn', message: 'Signed in' }))
                : '匿名创作者'}
            </ThemedText>
            <ThemedText numberOfLines={1} style={{ color: theme.mutedText }} variant="caption">
              {isLoaded
                ? isSignedIn
                  ? (googleAccount?.emailAddress ?? user?.primaryEmailAddress?.emailAddress)
                  : '仅保存在当前设备'
                : t({ id: 'mobile.profile.restoring', message: 'Restoring sign-in state…' })}
            </ThemedText>
          </View>
        </View>

        {isLoaded && !isSignedIn ? (
          <>
            <ThemedText style={{ color: theme.mutedText }} variant="body">
              登录后可跨设备同步壁纸历史，同时保留当前设备已生成的内容。
            </ThemedText>
            <Button
              fullWidth
              label={t({ id: 'mobile.profile.signIn', message: 'Sign in and sync' })}
              onPress={() => setIsLoginVisible(true)}
            />
          </>
        ) : null}

        {isLoaded && isSignedIn ? (
          <>
            {isSyncingHistory ? (
              <ThemedText style={{ color: theme.mutedText }} variant="caption">
                {t({ id: 'mobile.profile.syncing', message: 'Syncing device history…' })}
              </ThemedText>
            ) : null}
            {bindError ? (
              <ThemedText style={{ color: theme.error }} variant="caption">
                {bindError.message}
              </ThemedText>
            ) : null}
            {authError ? (
              <ThemedText style={{ color: theme.error }} variant="caption">
                {authError.message}
              </ThemedText>
            ) : null}
            <Button
              label={t({ id: 'mobile.profile.signOut', message: 'Sign out' })}
              onPress={() => void signOut()}
              variant="secondary"
            />
          </>
        ) : null}
      </ThemedView>

      <ThemedView variant="card" style={{ gap: 4, paddingVertical: 8 }}>
        <View style={{ gap: 4, paddingHorizontal: 6, paddingVertical: 10 }}>
          <ThemedText variant="subtitle">
            {t({ id: 'mobile.profile.language', message: 'Language' })}
          </ThemedText>
          <ThemedText style={{ color: theme.mutedText }} variant="caption">
            界面语言会安全保存在此设备。
          </ThemedText>
        </View>
        <LanguageOption
          active={locale === 'en'}
          label="English"
          onPress={() => void setLocale('en')}
        />
        <LanguageOption
          active={locale === 'zh-CN'}
          label="简体中文"
          onPress={() => void setLocale('zh-CN')}
        />
      </ThemedView>

      <LoginSheet
        error={authError}
        isLoading={isSigningIn}
        onDismiss={() => setIsLoginVisible(false)}
        onGoogleSignIn={() => void signInWithGoogle()}
        visible={isLoginVisible}
      />
    </ScrollView>
  );
}

function LanguageOption({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: pressed ? theme.muted : 'transparent',
        borderCurve: 'continuous',
        borderRadius: 9,
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: 46,
        paddingHorizontal: 10,
      })}
    >
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
        <AppIcon color={theme.mutedText} name="language" />
        <ThemedText variant="body">{label}</ThemedText>
      </View>
      {active ? <AppIcon color={theme.text} name="check" /> : null}
    </Pressable>
  );
}
