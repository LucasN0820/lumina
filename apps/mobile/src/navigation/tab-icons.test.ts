import { tabIcons } from './tab-icons';

describe('tabIcons', () => {
  it('declares an Android Material symbol and iOS SF Symbol for every tab', () => {
    for (const icon of Object.values(tabIcons)) {
      expect(icon.md).toBeTruthy();
      expect(icon.sf).toBeTruthy();
    }
  });
});
