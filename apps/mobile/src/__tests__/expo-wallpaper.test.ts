import { setWallpaper } from '../../modules/expo-wallpaper';

jest.mock('expo', () => {
  const setWallpaper = jest.fn<Promise<void>, [string, 'home' | 'lock' | 'both']>();
  return {
    requireNativeModule: jest.fn(() => ({ setWallpaper })),
  };
});

const expoMock: {
  requireNativeModule: jest.Mock<{
    setWallpaper: jest.Mock<Promise<void>, [string, 'home' | 'lock' | 'both']>;
  }>;
} = jest.requireMock('expo');
const mockSetWallpaper = expoMock.requireNativeModule.mock.results[0].value.setWallpaper;

describe('expo-wallpaper', () => {
  beforeEach(() => {
    mockSetWallpaper.mockReset();
    mockSetWallpaper.mockResolvedValue();
  });

  it.each(['home', 'lock', 'both'] as const)(
    'forwards the %s target to the native module',
    async (target) => {
      await expect(setWallpaper('file:///cache/wallpaper.jpg', target)).resolves.toBeUndefined();
      expect(mockSetWallpaper).toHaveBeenCalledWith('file:///cache/wallpaper.jpg', target);
    },
  );

  it('rejects empty URIs and unsupported targets before calling native code', () => {
    expect(() => setWallpaper('  ', 'home')).toThrow('non-empty local image URI');
    expect(() => setWallpaper('file:///cache/wallpaper.jpg', 'invalid' as never)).toThrow(
      'Unsupported wallpaper target',
    );
    expect(mockSetWallpaper).not.toHaveBeenCalled();
  });
});
