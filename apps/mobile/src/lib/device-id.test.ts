import * as SecureStore from 'expo-secure-store';

import { getAnonymousDeviceId } from './device-id';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe('getAnonymousDeviceId', () => {
  it('persists and reuses a neutral anonymous UUID when no value exists', async () => {
    const getItemAsync = jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
    const setItemAsync = jest.mocked(SecureStore.setItemAsync).mockResolvedValue();

    const first = await getAnonymousDeviceId();
    const second = await getAnonymousDeviceId();

    expect(first).toMatch(/^anonymous-/);
    expect(second).toBe(first);
    expect(getItemAsync).toHaveBeenCalledTimes(1);
    expect(setItemAsync).toHaveBeenCalledWith('lumina.anonymous-device-id', first);
  });
});
