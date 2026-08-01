import { colors } from '@/constants/theme';

import { createTabStackScreenOptions } from './tab-stack-options';

describe('createTabStackScreenOptions', () => {
  it('enables a themed native header for tab stacks', () => {
    const options = createTabStackScreenOptions({ ...colors.light, fontFamily: 'System' });

    expect(options).toMatchObject({
      contentStyle: { backgroundColor: colors.light.background },
      headerBackButtonDisplayMode: 'minimal',
      headerShadowVisible: false,
      headerShown: true,
      headerStyle: { backgroundColor: colors.light.surface },
      headerTintColor: colors.light.text,
      headerTitleStyle: { fontFamily: 'System' },
    });
  });
});
