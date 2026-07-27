import { fireEvent, render } from '@testing-library/react-native';

import { WallpaperDetail } from './WallpaperDetail';

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Image: (props: Record<string, unknown>) => React.createElement(View, props),
  };
});

describe('WallpaperDetail', () => {
  const wallpaper = {
    createdAt: '2026-07-26T00:00:00.000Z',
    height: 2400,
    id: 'wallpaper-1',
    mode: 'text2img' as const,
    resultImageUrl: 'https://images.example/wallpaper-1.jpg',
    status: 'succeeded' as const,
    width: 1080,
  };

  it('reuses the preview and leaves a graceful action slot until ApplySheet is available', () => {
    const onClose = jest.fn();
    const onModeChange = jest.fn();
    const screen = render(
      <WallpaperDetail
        onClose={onClose}
        onModeChange={onModeChange}
        previewMode="lock-screen"
        wallpaper={wallpaper}
      />,
    );

    expect(screen.getByLabelText('Lock screen wallpaper preview')).toBeTruthy();
    expect(screen.getByTestId('apply-sheet-placeholder')).toBeTruthy();
    fireEvent.press(screen.getByTestId('detail-preview-mode-home-screen'));
    fireEvent.press(screen.getByTestId('close-wallpaper-detail'));
    expect(onModeChange).toHaveBeenCalledWith('home-screen');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
