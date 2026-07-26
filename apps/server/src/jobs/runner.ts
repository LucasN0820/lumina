import { runWallpaperGraph, type WallpaperGraphInput } from '../graph/wallpaper.graph.js';

export type GenerationRunner = {
  run(input: WallpaperGraphInput): Promise<void>;
};

export function createGenerationRunner(
  runGraph: (input: WallpaperGraphInput) => Promise<unknown> = runWallpaperGraph,
): GenerationRunner {
  return {
    async run(input) {
      await runGraph(input);
    },
  };
}

export const generationRunner = createGenerationRunner();
