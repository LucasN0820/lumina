// On web, this resolves to ExpoWallpaperModule.web.ts; native builds use ExpoWallpaperModule.ts.
import ExpoWallpaperModule, { setWallpaper } from './src/ExpoWallpaperModule';

export default ExpoWallpaperModule;
export { setWallpaper };
export type { WallpaperTarget } from './src/ExpoWallpaper.types';
