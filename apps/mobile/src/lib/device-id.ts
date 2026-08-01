import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { create } from 'zustand';

const anonymousDeviceIdKey = 'lumina.anonymous-device-id';

let cachedDeviceId: string | undefined;
let pendingDeviceId: Promise<string> | undefined;

type AnonymousDeviceState = {
  deviceId?: string;
  error?: Error;
  initialize: () => Promise<void>;
  isLoading: boolean;
};

const useAnonymousDeviceStore = create<AnonymousDeviceState>()((set, get) => ({
  initialize: async () => {
    if (get().deviceId || get().isLoading) {
      return;
    }

    set({ error: undefined, isLoading: true });
    try {
      set({ deviceId: await getAnonymousDeviceId(), isLoading: false });
    } catch (reason) {
      set({
        error: reason instanceof Error ? reason : new Error('Unable to identify this device.'),
        isLoading: false,
      });
    }
  },
  isLoading: false,
}));

function createAnonymousDeviceId(): string {
  return `anonymous-${Crypto.randomUUID()}`;
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
  const deviceId = useAnonymousDeviceStore((state) => state.deviceId);
  const error = useAnonymousDeviceStore((state) => state.error);
  const isLoading = useAnonymousDeviceStore((state) => state.isLoading);
  const initialize = useAnonymousDeviceStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return { deviceId, error, isLoading: isLoading || (!deviceId && !error) };
}
