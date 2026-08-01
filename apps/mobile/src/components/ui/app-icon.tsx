import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

export type AppIconName =
  | 'arrow-left'
  | 'check'
  | 'chevron-right'
  | 'close'
  | 'download'
  | 'edit'
  | 'favorite'
  | 'favorite-filled'
  | 'image'
  | 'language'
  | 'library'
  | 'profile'
  | 'refresh'
  | 'share'
  | 'sparkles'
  | 'upload';

const iconNames = {
  'arrow-left': { android: 'arrow_back', ios: 'arrow.left', web: 'arrow_back' },
  check: { android: 'check', ios: 'checkmark', web: 'check' },
  'chevron-right': { android: 'chevron_right', ios: 'chevron.right', web: 'chevron_right' },
  close: { android: 'close', ios: 'xmark', web: 'close' },
  download: { android: 'download', ios: 'square.and.arrow.down', web: 'download' },
  edit: { android: 'edit', ios: 'pencil', web: 'edit' },
  favorite: { android: 'favorite', ios: 'heart', web: 'favorite' },
  'favorite-filled': { android: 'favorite', ios: 'heart.fill', web: 'favorite' },
  image: { android: 'image', ios: 'photo', web: 'image' },
  language: { android: 'language', ios: 'globe', web: 'language' },
  library: { android: 'photo_library', ios: 'photo.on.rectangle', web: 'photo_library' },
  profile: { android: 'account_circle', ios: 'person.crop.circle', web: 'account_circle' },
  refresh: { android: 'refresh', ios: 'arrow.clockwise', web: 'refresh' },
  share: { android: 'share', ios: 'square.and.arrow.up', web: 'share' },
  sparkles: { android: 'auto_awesome', ios: 'sparkles', web: 'auto_awesome' },
  upload: { android: 'upload', ios: 'arrow.up.circle', web: 'upload' },
} as const satisfies Record<AppIconName, SymbolViewProps['name']>;

type AppIconProps = {
  color: ColorValue;
  name: AppIconName;
  size?: number;
};

export function AppIcon({ color, name, size = 18 }: AppIconProps) {
  return <SymbolView name={iconNames[name]} size={size} tintColor={color} />;
}
