import { useAuth as useClerkAuth, useSSO, useUser } from '@clerk/expo';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';

import { bindDevice } from '@/lib/api';
import { getAnonymousDeviceId } from '@/lib/device-id';

WebBrowser.maybeCompleteAuthSession();

export function useAuth() {
  const { getToken, isLoaded, isSignedIn, signOut, userId } = useClerkAuth();
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const [authError, setAuthError] = useState<Error>();
  const [bindError, setBindError] = useState<Error>();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncingHistory, setIsSyncingHistory] = useState(false);
  const lastBoundUserId = useRef<string | null>(null);

  const syncDeviceHistory = useCallback(async () => {
    if (!userId) {
      return;
    }

    setIsSyncingHistory(true);
    setBindError(undefined);
    try {
      await bindDevice(await getAnonymousDeviceId(), getToken);
      lastBoundUserId.current = userId;
    } catch (reason) {
      setBindError(reason instanceof Error ? reason : new Error('设备历史同步失败。'));
    } finally {
      setIsSyncingHistory(false);
    }
  }, [getToken, userId]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || lastBoundUserId.current === userId) {
      return;
    }

    void syncDeviceHistory();
  }, [isLoaded, isSignedIn, syncDeviceHistory, userId]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(undefined);
    setIsSigningIn(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy: 'oauth_google' });
      if (!createdSessionId || !setActive) {
        throw new Error('Google 登录未完成。');
      }

      await setActive({ session: createdSessionId });
    } catch (reason) {
      setAuthError(reason instanceof Error ? reason : new Error('Google 登录失败。'));
    } finally {
      setIsSigningIn(false);
    }
  }, [startSSOFlow]);

  const signOutFromApp = useCallback(async () => {
    await signOut();
    lastBoundUserId.current = null;
    setAuthError(undefined);
    setBindError(undefined);
  }, [signOut]);

  return {
    authError,
    bindError,
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    isSigningIn,
    isSyncingHistory,
    signInWithGoogle,
    signOut: signOutFromApp,
    syncDeviceHistory,
    user,
  };
}
