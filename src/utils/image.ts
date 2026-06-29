import { MEDIA } from '@/lib/constants';

export function getImageUrl(path: string, bucket = MEDIA.STORAGE_BUCKET): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function getThumbnailUrl(path: string, width: number, height: number): string {
  const base = getImageUrl(path);
  if (base.includes('supabase.co')) {
    return `${base}?width=${width}&height=${height}&resize=cover`;
  }
  return base;
}

export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number; format?: string } = {}
): string {
  if (!url.includes('supabase.co')) return url;
  
  const params = new URLSearchParams();
  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.quality) params.append('quality', options.quality.toString());
  if (options.format) params.append('format', options.format);
  
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

export function isValidImageType(mimeType: string): boolean {
  return (MEDIA.ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType);
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image to calculate dimensions'));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}
