import { tabIcons } from './tab-icons';

describe('tabIcons', () => {
  it('declares an app icon for every standard tab', () => {
    expect(tabIcons).toEqual({
      create: 'sparkles',
      library: 'library',
      profile: 'profile',
    });
  });
});
