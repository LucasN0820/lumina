import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { describe, expect, it, vi } from 'vite-plus/test';

import {
  createR2Storage,
  generateWallpaperKey,
  R2StorageError,
  type R2Config,
  type S3CommandClient,
} from './r2.js';

const config: R2Config = {
  accessKeyId: 'test-access-key',
  accountId: 'test-account-id',
  bucket: 'lumina-images',
  endpoint: 'https://test-account-id.r2.cloudflarestorage.com',
  secretAccessKey: 'test-secret-key',
};

function createClient(): { client: S3CommandClient; send: ReturnType<typeof vi.fn> } {
  const send = vi.fn().mockResolvedValue({});
  return { client: { send }, send };
}

describe('generateWallpaperKey', () => {
  it('creates a date-partitioned image key', () => {
    expect(
      generateWallpaperKey({
        id: 'ckv4b1n2m0000j1qz8kvh4p0g',
        now: new Date('2026-07-25T12:00:00.000Z'),
      }),
    ).toBe('wallpapers/202607/ckv4b1n2m0000j1qz8kvh4p0g.png');
  });

  it('rejects IDs that could create an unsafe key', () => {
    expect(() => generateWallpaperKey({ id: '../outside' })).toThrow(R2StorageError);
  });
});

describe('R2Storage', () => {
  it('uploads a buffer and returns a public URL', async () => {
    const { client, send } = createClient();
    const storage = createR2Storage(
      { ...config, publicBaseUrl: 'https://images.example.com' },
      { client },
    );
    const image = Buffer.from('image bytes');

    await expect(
      storage.uploadBuffer(image, 'wallpapers/202607/image.png', 'image/png'),
    ).resolves.toEqual({
      key: 'wallpapers/202607/image.png',
      url: 'https://images.example.com/wallpapers/202607/image.png',
    });

    const command = send.mock.calls[0]?.[0];
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toMatchObject({
      Body: image,
      Bucket: 'lumina-images',
      ContentType: 'image/png',
      Key: 'wallpapers/202607/image.png',
    });
  });

  it('streams a remote image into a put command', async () => {
    const { client, send } = createClient();
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response('image bytes', { headers: { 'content-type': 'image/webp; charset=binary' } }),
      );
    const storage = createR2Storage(
      { ...config, publicBaseUrl: 'https://images.example.com' },
      { client, fetch },
    );

    await storage.uploadFromUrl(
      'https://provider.example.com/image.webp',
      'wallpapers/202607/image.webp',
    );

    const command = send.mock.calls[0]?.[0];
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toMatchObject({
      Bucket: 'lumina-images',
      ContentType: 'image/webp',
      Key: 'wallpapers/202607/image.webp',
    });
  });

  it('uploads a local file without reading it into a buffer', async () => {
    const { client, send } = createClient();
    const folder = await mkdtemp(join(tmpdir(), 'lumina-r2-'));
    const filePath = join(folder, 'image.png');
    await writeFile(filePath, 'image bytes');
    const storage = createR2Storage(
      { ...config, publicBaseUrl: 'https://images.example.com' },
      { client },
    );

    await storage.uploadFile(filePath, 'wallpapers/202607/image.png', 'image/png');

    const command = send.mock.calls[0]?.[0];
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input.Body).toBeTruthy();
    await rm(folder, { force: true, recursive: true });
  });

  it('uses a signed GET URL for private buckets and signs browser PUT uploads', async () => {
    const { client } = createClient();
    const getSignedUrl = vi
      .fn()
      .mockResolvedValueOnce('https://signed.example.com/get')
      .mockResolvedValueOnce('https://signed.example.com/put');
    const storage = createR2Storage(config, { client, getSignedUrl });

    await expect(storage.getUrl('wallpapers/202607/image.png', 120)).resolves.toBe(
      'https://signed.example.com/get',
    );
    await expect(
      storage.createPresignedPutUrl('wallpapers/202607/image.png', 'image/png', 180),
    ).resolves.toBe('https://signed.example.com/put');

    expect(getSignedUrl.mock.calls[0]?.[1]).toBeInstanceOf(GetObjectCommand);
    expect(getSignedUrl.mock.calls[0]?.[2]).toEqual({ expiresIn: 120, signableHeaders: undefined });
    expect(getSignedUrl.mock.calls[1]?.[1]).toBeInstanceOf(PutObjectCommand);
    expect(getSignedUrl.mock.calls[1]?.[1].input).toMatchObject({
      Bucket: 'lumina-images',
      ContentType: 'image/png',
      Key: 'wallpapers/202607/image.png',
    });
    expect(getSignedUrl.mock.calls[1]?.[2]).toEqual({
      expiresIn: 180,
      signableHeaders: new Set(['content-type']),
    });
  });

  it('exposes failed downloads and uploads as structured storage errors', async () => {
    const { client } = createClient();
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 502 }));
    const storage = createR2Storage(config, { client, fetch });

    await expect(
      storage.uploadFromUrl(
        'https://provider.example.com/missing.png',
        'wallpapers/202607/missing.png',
      ),
    ).rejects.toMatchObject({ code: 'R2_DOWNLOAD_FAILED', name: 'R2StorageError' });
    await expect(
      storage.uploadBuffer(Buffer.from('x'), '../unsafe.png', 'image/png'),
    ).rejects.toMatchObject({
      code: 'R2_INVALID_KEY',
      name: 'R2StorageError',
    });
  });
});
