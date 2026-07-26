import { render } from '@testing-library/react-native';

import { WallpaperPreview } from './WallpaperPreview';

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Image: (props: Record<string, unknown>) => React.createElement(View, props),
  };
});

describe('WallpaperPreview', () => {
  const image = { uri: 'https://images.example/wallpaper.jpg' };

  it('renders a cover image with the lock screen overlays by default', () => {
    const screen = render(<WallpaperPreview height={360} image={image} width={180} />);

    expect(screen.getByTestId('wallpaper-preview')).toHaveStyle({ height: 366, width: 186 });
    expect(screen.getByTestId('wallpaper-preview-image')).toHaveProp('contentFit', 'cover');
    expect(screen.getByTestId('preview-status-bar')).toBeTruthy();
    expect(screen.getByTestId('preview-lock-clock')).toBeTruthy();
    expect(screen.queryByTestId('preview-home-icons')).toBeNull();
  });

  it('uses the home screen overlay when requested through the mode prop', () => {
    const screen = render(
      <WallpaperPreview height={360} image={image} mode="home-screen" width={180} />,
    );

    expect(screen.getByTestId('preview-home-icons')).toBeTruthy();
    expect(screen.queryByTestId('preview-lock-clock')).toBeNull();
  });

  it('supports the lockScreen shorthand for switching to the home screen', () => {
    const screen = render(
      <WallpaperPreview height={360} image={image} mode="home-screen" width={180} />,
    );

    expect(screen.getByLabelText('Home screen wallpaper preview')).toBeTruthy();
    expect(screen.getByTestId('preview-home-icons')).toBeTruthy();
  });
});
