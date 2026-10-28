import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

const adminSupabase = createAdminClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a unique filename/path
    const fileExt = file.name.split('.').pop() || '';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const uniquePath = `${Date.now()}_${cleanFileName}.${fileExt}`;

    // Upload to Supabase Storage bucket 'media'
    let { error: uploadError } = await adminSupabase.storage
      .from('media')
      .upload(uniquePath, buffer, {
        contentType: file.type,
        duplex: 'half',
      });

    if (uploadError && uploadError.message.includes('Bucket not found')) {
      await adminSupabase.storage.createBucket('media', { public: true, fileSizeLimit: 52428800 });
      const retry = await adminSupabase.storage
        .from('media')
        .upload(uniquePath, buffer, {
          contentType: file.type,
          duplex: 'half',
        });
      uploadError = retry.error;
    }

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload to storage: ' + uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = adminSupabase.storage
      .from('media')
      .getPublicUrl(uniquePath);

    // Determine type
    let mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT' = 'DOCUMENT';
    if (file.type.startsWith('image/')) {
      mediaType = 'IMAGE';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'VIDEO';
    }

    const now = new Date().toISOString();
    const newId = crypto.randomUUID();

    // Save to Supabase DB media table
    const { data: media, error: dbError } = await adminSupabase
      .from('media')
      .insert({
        id: newId,
        filename: uniquePath,
        original_name: file.name,
        mime_type: file.type,
        size: file.size,
        url: publicUrl,
        storage_path: uniquePath,
        bucket: 'media',
        uploaded_by_id: '403601f3-8a10-482b-9c73-910d850adfa2',
        type: mediaType,
        updated_at: now,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to create media record in DB:', dbError);
      return NextResponse.json({ error: 'Failed to save media metadata: ' + dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: media });
  } catch (err: any) {
    console.error('Media upload route error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
