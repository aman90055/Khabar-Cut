import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'article-images';
const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const altText = (formData.get('alt_text') as string) || '';
    const caption = (formData.get('caption') as string) || '';
    const credit = (formData.get('credit') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: JPG, PNG, WebP, GIF, AVIF` },
        { status: 400 }
      );
    }

    // Validate size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_SIZE_MB}MB allowed.` },
        { status: 400 }
      );
    }

    // Generate unique path
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const safeName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
    const filePath = `articles/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${timestamp}-${safeName}`;

    // Upload to Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload] Storage error:', uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    // Save to media table
    const { data: mediaRecord, error: dbError } = await supabase
      .from('media')
      .insert({
        file_name: file.name,
        file_path: filePath,
        public_url: publicUrl,
        media_type: 'image',
        mime_type: file.type,
        file_size: file.size,
        alt_text: altText || null,
        caption: caption || null,
        credit: credit || null,
        source: 'upload',
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Upload] DB error:', dbError.message);
      // Still return the URL even if media record fails
      return NextResponse.json({
        success: true,
        url: publicUrl,
        path: filePath,
        media_id: null,
        warning: 'Media record not saved to DB',
      });
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      media_id: mediaRecord.id,
      media: mediaRecord,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    console.error('[Upload] Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET — list recent uploads from media table
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const type = searchParams.get('type') || 'image';

  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('media_type', type)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ data: [] });
  }

  return NextResponse.json({ data: data ?? [] });
}
