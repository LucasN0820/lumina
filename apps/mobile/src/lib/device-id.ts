import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

const anonymousDeviceIdKey = 'lumina.anonymous-device-id';

let cachedDeviceId: string | undefined;
let pendingDeviceId: Promise<string> | undefined;

function createAnonymousDeviceId(): string {
  return `anonymous-${globalThis.crypto.randomUUID()}`;
}

export async function getAnonymousDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  pendingDeviceId ??= (async () => {
    const storedDeviceId = await SecureStore.getItemAsync(anonymousDeviceIdKey);
    const deviceId = storedDeviceId ?? createAnonymousDeviceId();

    if (!storedDeviceId) {
      await SecureStore.setItemAsync(anonymousDeviceIdKey, deviceId);
    }

    cachedDeviceId = deviceId;
    return deviceId;
  })();

  try {
    return await pendingDeviceId;
  } finally {
    pendingDeviceId = undefined;
  }
}

export function useAnonymousDeviceId() {
  const [deviceId, setDeviceId] = useState<string>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    let active = true;

    void getAnonymousDeviceId().then(
      (nextDeviceId) => {
        if (active) {
          setDeviceId(nextDeviceId);
        }
      },
      (reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason : new Error('Unable to identify this device.'));
        }
      },
    );

    return () => {
      active = false;
    };
  }, []);

  return { deviceId, error, isLoading: !deviceId && !error };
}
