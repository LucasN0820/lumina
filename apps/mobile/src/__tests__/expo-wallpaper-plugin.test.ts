/* eslint-disable import/no-commonjs */
const { addSetWallpaperPermission } = require('../../modules/expo-wallpaper/app.plugin.js');

describe('expo-wallpaper config plugin', () => {
  it('adds SET_WALLPAPER once and preserves existing permissions', () => {
    const manifest = {
      manifest: {
        'uses-permission': [{ $: { 'android:name': 'android.permission.INTERNET' } }],
      },
    };

    addSetWallpaperPermission(manifest);
    addSetWallpaperPermission(manifest);

    expect(manifest.manifest['uses-permission']).toEqual([
      { $: { 'android:name': 'android.permission.INTERNET' } },
      { $: { 'android:name': 'android.permission.SET_WALLPAPER' } },
    ]);
  });
});
