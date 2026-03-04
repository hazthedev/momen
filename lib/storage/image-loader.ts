/**
 * Momen Custom Image Loader for Cloudflare R2
 * Loads images from R2 public URLs
 */

export default function cloudflareR2Loader({ src, width: _width, quality: _quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  // R2 public URL pattern
  const r2PublicUrl = process.env.R2_PUBLIC_URL || '';

  // If the image is already a full URL, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Otherwise, prepend the R2 public URL
  return `${r2PublicUrl}/${src}`;
}
