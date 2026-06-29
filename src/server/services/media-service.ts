import { createAdminClient } from '@/lib/supabase/admin';
import { MEDIA } from '@/lib/constants';

export class MediaService {
  public static async uploadToStorage(
    file: Buffer | Blob,
    fileName: string,
    mimeType: string,
    bucket = MEDIA.STORAGE_BUCKET
  ): Promise<string> {
    const supabase = createAdminClient();
    
    const timestamp = Date.now();
    const uniqueName = `${timestamp}_${fileName.replace(/\s+/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueName, file, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload to storage: ${error.message}`);
    }

    return data.path;
  }

  public static async deleteFromStorage(path: string, bucket = MEDIA.STORAGE_BUCKET): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    
    if (error) {
      throw new Error(`Failed to delete from storage: ${error.message}`);
    }
  }

  public static processImage(size: number, mimeType: string) {
    if (size > MEDIA.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${MEDIA.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    const isAllowedType = (MEDIA.ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType) ||
                          (MEDIA.ALLOWED_VIDEO_TYPES as readonly string[]).includes(mimeType) ||
                          (MEDIA.ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(mimeType);

    if (!isAllowedType) {
      throw new Error(`File type ${mimeType} is not supported`);
    }

    return true;
  }
}
