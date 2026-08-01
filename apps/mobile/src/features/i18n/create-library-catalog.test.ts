import { setupI18n } from '@lingui/core';

import { messages as englishMessages } from '../../../../../packages/i18n/locales/en/mobile';
import { messages as chineseMessages } from '../../../../../packages/i18n/locales/zh-CN/mobile';

describe('Create and Library catalogs', () => {
  it('loads English and Simplified Chinese translations', () => {
    const english = setupI18n({ locale: 'en', messages: { en: englishMessages } });
    const chinese = setupI18n({
      locale: 'zh-CN',
      messages: { 'zh-CN': chineseMessages },
    });

    expect(english._('mobile.create.generate')).toBe('Generate wallpaper');
    expect(chinese._('mobile.create.generate')).toBe('生成壁纸');
    expect(chinese._('mobile.create.preset.minimal.name')).toBe('极简');
    expect(english._('mobile.library.empty.title')).toBe('No wallpapers yet');
    expect(chinese._('mobile.library.empty.title')).toBe('还没有壁纸');
    expect(chinese._('mobile.create.cooldown', { 0: 5 })).toBe('为避免重复请求，请在 5 秒后重试。');
  });
});
