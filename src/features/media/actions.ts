'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from '@/lib/cache';
import { requirePermission } from '@/middleware/rbac';
import { createAuditLog } from '@/middleware/audit';
import { CACHE_TAGS, CACHE_PATHS } from '@/lib/constants';
import { MediaService } from '@/server/services/media-service';
import * as mediaDb from '@/server/db/media';
import { updateMediaSchema } from './schemas';
import type { UpdateMediaInput } from './types';
import type { MediaType } from '@prisma/client';
import { getImageUrl } from '@/utils/image';

export async function uploadMedia(formData: FormData) {
  const user = await requirePermission('media', 'create');
  
  const file = formData.get('file') as File | null;
  if (!file) {
    throw new Error('No file provided');
  }

  const altText = formData.get('altText') as string | null;
  const caption = formData.get('caption') as string | null;

  MediaService.processImage(file.size, file.type);

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = await MediaService.uploadToStorage(buffer, file.name, file.type);

  let mediaType: MediaType = 'DOCUMENT';
  if (file.type.startsWith('image/')) {
    mediaType = 'IMAGE';
  } else if (file.type.startsWith('video/')) {
    mediaType = 'VIDEO';
  } else if (file.type.startsWith('audio/')) {
    mediaType = 'AUDIO';
  }

  const media = await mediaDb.createMedia({
    filename: file.name,
    originalName: file.name,
    mimeType: file.type,
    size: BigInt(file.size),
    url: getImageUrl(storagePath),
    storagePath,
    bucket: 'media',
    type: mediaType,
    altText,
    caption,
    uploadedBy: {
      connect: {
        id: user.id,
      },
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'UPLOAD_MEDIA',
    entityType: 'media',
    entityId: media.id,
    newValues: JSON.parse(JSON.stringify(media)),
  });

  revalidateTag(CACHE_TAGS.MEDIA);
  revalidatePath(CACHE_PATHS.ADMIN_MEDIA);

  return { success: true, data: media };
}

export async function updateMedia(id: string, input: UpdateMediaInput) {
  const user = await requirePermission('media', 'update');
  const validated = updateMediaSchema.parse(input);

  const oldMedia = await mediaDb.findMediaById(id);
  if (!oldMedia) {
    throw new Error('Media not found');
  }

  const media = await mediaDb.updateMedia(id, {
    altText: validated.altText,
    caption: validated.caption,
  });

  await createAuditLog({
    userId: user.id,
    action: 'UPDATE_MEDIA',
    entityType: 'media',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldMedia)),
    newValues: JSON.parse(JSON.stringify(media)),
  });

  revalidateTag(CACHE_TAGS.MEDIA);
  revalidatePath(CACHE_PATHS.ADMIN_MEDIA);

  return { success: true, data: media };
}

export async function deleteMedia(id: string) {
  const user = await requirePermission('media', 'delete');

  const oldMedia = await mediaDb.findMediaById(id);
  if (!oldMedia) {
    throw new Error('Media not found');
  }

  await MediaService.deleteFromStorage(oldMedia.storagePath);
  await mediaDb.softDeleteMedia(id);

  await createAuditLog({
    userId: user.id,
    action: 'DELETE_MEDIA',
    entityType: 'media',
    entityId: id,
    oldValues: JSON.parse(JSON.stringify(oldMedia)),
  });

  revalidateTag(CACHE_TAGS.MEDIA);
  revalidatePath(CACHE_PATHS.ADMIN_MEDIA);

  return { success: true };
}
