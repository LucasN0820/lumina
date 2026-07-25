import { prisma } from '../src/lib/db.js';

const builtInPresets = [
  {
    id: 'preset_builtin_minimal',
    name: 'Minimal',
    category: 'minimal',
    coverImageUrl: 'https://assets.lumina.app/presets/minimal.jpg',
    promptTemplate:
      'A clean minimal wallpaper featuring {{subject}}, {{palette}} palette, generous negative space, {{width}}x{{height}}.',
    negativePrompt: 'text, logo, watermark, clutter, busy composition',
    isBuiltIn: true,
  },
  {
    id: 'preset_builtin_cinematic',
    name: 'Cinematic',
    category: 'cinematic',
    coverImageUrl: 'https://assets.lumina.app/presets/cinematic.jpg',
    promptTemplate:
      'A cinematic wide-angle scene of {{subject}}, dramatic {{mood}} lighting, film grain, immersive depth, {{width}}x{{height}}.',
    negativePrompt: 'text, logo, watermark, flat lighting, oversaturated colors',
    isBuiltIn: true,
  },
  {
    id: 'preset_builtin_cyberpunk',
    name: 'Cyberpunk',
    category: 'cyberpunk',
    coverImageUrl: 'https://assets.lumina.app/presets/cyberpunk.jpg',
    promptTemplate:
      'A neon cyberpunk vision of {{subject}}, electric {{palette}} lights, rain-slicked atmosphere, high detail, {{width}}x{{height}}.',
    negativePrompt: 'text, logo, watermark, daylight, low contrast',
    isBuiltIn: true,
  },
  {
    id: 'preset_builtin_nature',
    name: 'Nature',
    category: 'nature',
    coverImageUrl: 'https://assets.lumina.app/presets/nature.jpg',
    promptTemplate:
      'A serene nature wallpaper with {{subject}}, {{season}} atmosphere, natural {{palette}} tones, detailed landscape, {{width}}x{{height}}.',
    negativePrompt: 'text, logo, watermark, urban objects, artificial lighting',
    isBuiltIn: true,
  },
  {
    id: 'preset_builtin_anime',
    name: 'Anime',
    category: 'anime',
    coverImageUrl: 'https://assets.lumina.app/presets/anime.jpg',
    promptTemplate:
      'An anime-inspired illustration of {{subject}}, expressive composition, {{mood}} feeling, polished cel shading, {{width}}x{{height}}.',
    negativePrompt: 'text, logo, watermark, photorealistic, distorted anatomy',
    isBuiltIn: true,
  },
  {
    id: 'preset_builtin_abstract',
    name: 'Abstract',
    category: 'abstract',
    coverImageUrl: 'https://assets.lumina.app/presets/abstract.jpg',
    promptTemplate:
      'An abstract composition built from {{subject}}, layered {{palette}} forms, balanced motion and texture, {{width}}x{{height}}.',
    negativePrompt: 'text, logo, watermark, recognizable faces, clutter',
    isBuiltIn: true,
  },
  {
    id: 'preset_builtin_editorial',
    name: 'Editorial',
    category: 'editorial',
    coverImageUrl: 'https://assets.lumina.app/presets/editorial.jpg',
    promptTemplate:
      'A refined editorial artwork featuring {{subject}}, considered {{palette}} styling, gallery-quality art direction, {{width}}x{{height}}.',
    negativePrompt: 'text, logo, watermark, stock photography, generic composition',
    isBuiltIn: true,
  },
] as const;

async function main() {
  await Promise.all(
    builtInPresets.map((preset) =>
      prisma.preset.upsert({
        where: { id: preset.id },
        create: preset,
        update: preset,
      }),
    ),
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
