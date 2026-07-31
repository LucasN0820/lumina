import { Image } from 'expo-image';
import { Pressable, ScrollView } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useLingui } from '@lingui/react/macro';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoginSheet } from '@/features/auth/LoginSheet';
import { useAuth } from '@/features/auth/useAuth';
import { useAppLocale } from '@/features/i18n/i18n-provider';

export default function ProfileTab() {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const { locale, setLocale } = useAppLocale();
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
      contentContainerStyle={{ gap: 16, padding: 24 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ThemedView variant="card" style={{ gap: 8 }}>
        <ThemedText variant="title">
          {t({ id: 'mobile.profile.title', message: 'Profile' })}
        </ThemedText>
        {!isLoaded ? (
          <ThemedText variant="body">
            {t({ id: 'mobile.profile.restoring', message: 'Restoring sign-in state…' })}
          </ThemedText>
        ) : null}
        {isLoaded && !isSignedIn ? (
          <>
            <ThemedText variant="body">
              {t({
                id: 'mobile.profile.anonymous',
                message:
                  'You are using Lumina anonymously. Sign in to sync your history across devices.',
              })}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsLoginVisible(true)}
              style={{ alignSelf: 'flex-start', paddingVertical: 8 }}
            >
              <ThemedText variant="subtitle">
                {t({ id: 'mobile.profile.signIn', message: 'Sign in and sync' })}
              </ThemedText>
            </Pressable>
          </>
        ) : null}
        {isLoaded && isSignedIn ? (
          <>
            {user?.imageUrl ? (
              <Image
                contentFit="cover"
                source={{ uri: user.imageUrl }}
                style={{ borderRadius: 32, height: 64, width: 64 }}
              />
            ) : null}
            <ThemedText variant="subtitle">
              {user?.fullName ??
                user?.username ??
                user?.primaryEmailAddress?.emailAddress ??
                t({ id: 'mobile.profile.signedIn', message: 'Signed in' })}
            </ThemedText>
            <ThemedText variant="body">{user?.primaryEmailAddress?.emailAddress}</ThemedText>
            <ThemedText variant="caption">
              {googleAccount
                ? t({
                    id: 'mobile.profile.googleConnected',
                    message: `Google connected: ${googleAccount.emailAddress}`,
                  })
                : t({ id: 'mobile.profile.clerkConnected', message: 'Signed in with Clerk' })}
            </ThemedText>
            {isSyncingHistory ? (
              <ThemedText variant="caption">
                {t({ id: 'mobile.profile.syncing', message: 'Syncing device history…' })}
              </ThemedText>
            ) : null}
            {bindError ? (
              <ThemedText style={{ color: '#D83030' }} variant="caption">
                {bindError.message}
              </ThemedText>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => void signOut()}
              style={{ alignSelf: 'flex-start', paddingVertical: 8 }}
            >
              <ThemedText variant="body">
                {t({ id: 'mobile.profile.signOut', message: 'Sign out' })}
              </ThemedText>
            </Pressable>
          </>
        ) : null}
      </ThemedView>
      <ThemedView variant="card" style={{ gap: 8 }}>
        <ThemedText variant="subtitle">
          {t({ id: 'mobile.profile.language', message: 'Language' })}
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={() => void setLocale('en')}>
          <ThemedText variant="body">{locale === 'en' ? '✓ ' : ''}English</ThemedText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => void setLocale('zh-CN')}>
          <ThemedText variant="body">{locale === 'zh-CN' ? '✓ ' : ''}简体中文</ThemedText>
        </Pressable>
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
