import { Image } from 'expo-image';
import { Pressable, ScrollView } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoginSheet } from '@/features/auth/LoginSheet';
import { useAuth } from '@/features/auth/useAuth';

export default function ProfileTab() {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
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
        <ThemedText variant="title">我的</ThemedText>
        {!isLoaded ? <ThemedText variant="body">正在恢复登录状态…</ThemedText> : null}
        {isLoaded && !isSignedIn ? (
          <>
            <ThemedText variant="body">
              匿名使用已开启。登录后可同步设备历史并跨设备访问壁纸。
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsLoginVisible(true)}
              style={{ alignSelf: 'flex-start', paddingVertical: 8 }}
            >
              <ThemedText variant="subtitle">登录并同步</ThemedText>
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
                '已登录'}
            </ThemedText>
            <ThemedText variant="body">{user?.primaryEmailAddress?.emailAddress}</ThemedText>
            <ThemedText variant="caption">
              {googleAccount ? `Google 已连接：${googleAccount.emailAddress}` : '已通过 Clerk 登录'}
            </ThemedText>
            {isSyncingHistory ? <ThemedText variant="caption">正在同步设备历史…</ThemedText> : null}
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
              <ThemedText variant="body">退出登录</ThemedText>
            </Pressable>
          </>
        ) : null}
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
