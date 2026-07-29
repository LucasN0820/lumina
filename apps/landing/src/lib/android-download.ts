export function getAndroidDownloadUrl(
  value = process.env.NEXT_PUBLIC_ANDROID_DOWNLOAD_URL,
): string | undefined {
  if (!value?.trim()) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
