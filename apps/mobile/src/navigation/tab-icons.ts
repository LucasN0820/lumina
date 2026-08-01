import type { AppIconName } from '@/components/ui/app-icon';

export const tabIcons = {
  create: 'sparkles',
  library: 'library',
  profile: 'profile',
} as const satisfies Record<'create' | 'library' | 'profile', AppIconName>;
