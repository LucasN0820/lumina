/* eslint-disable import/no-commonjs */
const { withAndroidManifest } = require('expo/config-plugins');

const SET_WALLPAPER_PERMISSION = 'android.permission.SET_WALLPAPER';

function addSetWallpaperPermission(androidManifest) {
  const permissions = androidManifest.manifest['uses-permission'] ?? [];
  const alreadyDeclared = permissions.some(
    (permission) => permission.$?.['android:name'] === SET_WALLPAPER_PERMISSION,
  );

  if (!alreadyDeclared) {
    permissions.push({ $: { 'android:name': SET_WALLPAPER_PERMISSION } });
  }

  androidManifest.manifest['uses-permission'] = permissions;
  return androidManifest;
}

function withExpoWallpaper(config) {
  return withAndroidManifest(config, (config) => {
    config.modResults = addSetWallpaperPermission(config.modResults);
    return config;
  });
}

module.exports = withExpoWallpaper;
module.exports.addSetWallpaperPermission = addSetWallpaperPermission;
