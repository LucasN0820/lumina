import type { ImageProvider, ImageResult, ImageSpec } from './types.js';

const MOCK_TASK_ID = 'mock-image-provider';

export class MockImageProvider implements ImageProvider {
  async textToImage(spec: ImageSpec): Promise<ImageResult> {
    return this.createPlaceholder(spec);
  }

  async editImage(spec: ImageSpec): Promise<ImageResult> {
    return this.createPlaceholder(spec);
  }

  async outpaint(spec: ImageSpec): Promise<ImageResult> {
    return this.createPlaceholder(spec);
  }

  async upscale(spec: ImageSpec): Promise<ImageResult> {
    return this.createPlaceholder(spec);
  }

  async extractStyle(spec: ImageSpec): Promise<ImageResult> {
    return this.createPlaceholder(spec);
  }

  private createPlaceholder(spec: ImageSpec): ImageResult {
    const width = requireDimension(spec.width, 'width');
    const height = requireDimension(spec.height, 'height');
    const label = `${width} x ${height}`;
    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      '<rect width="100%" height="100%" fill="#1f2937"/>',
      `<text x="50%" y="50%" fill="#e5e7eb" font-family="sans-serif" font-size="48" text-anchor="middle">${label}</text>`,
      '</svg>',
    ].join('');

    return {
      imageBytes: Buffer.from(svg, 'utf8'),
      width,
      height,
      providerTask: MOCK_TASK_ID,
      metadata: {
        mimeType: 'image/svg+xml',
        placeholder: true,
      },
    };
  }
}

function requireDimension(value: number, name: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer.`);
  }

  return value;
}
