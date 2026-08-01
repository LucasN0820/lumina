import { create } from 'zustand';

import type { WallpaperPreviewMode } from '@/components/WallpaperPreview';
import type { WallpaperListItem } from '@/lib/api';

type LibraryState = {
  favoritesOnly: boolean;
  isApplySheetVisible: boolean;
  previewMode: WallpaperPreviewMode;
  selectedCategory?: string;
  selectedWallpaper?: WallpaperListItem;
};

type LibraryActions = {
  closeWallpaper: () => void;
  reset: () => void;
  selectWallpaper: (wallpaper: WallpaperListItem) => void;
  setApplySheetVisible: (visible: boolean) => void;
  setFavoritesOnly: (favoritesOnly: boolean) => void;
  setPreviewMode: (previewMode: WallpaperPreviewMode) => void;
  setSelectedCategory: (selectedCategory: string | undefined) => void;
};

export type LibraryStore = LibraryState & LibraryActions;

const initialLibraryState: LibraryState = {
  favoritesOnly: false,
  isApplySheetVisible: false,
  previewMode: 'lock-screen',
  selectedCategory: undefined,
  selectedWallpaper: undefined,
};

export const useLibraryStore = create<LibraryStore>()((set) => ({
  ...initialLibraryState,
  closeWallpaper: () =>
    set({ isApplySheetVisible: false, previewMode: 'lock-screen', selectedWallpaper: undefined }),
  reset: () => set(initialLibraryState),
  selectWallpaper: (selectedWallpaper) =>
    set({ isApplySheetVisible: false, previewMode: 'lock-screen', selectedWallpaper }),
  setApplySheetVisible: (isApplySheetVisible) => set({ isApplySheetVisible }),
  setFavoritesOnly: (favoritesOnly) => set({ favoritesOnly }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
}));
