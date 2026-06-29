import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    }).catch(() => null);

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

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

    // Upload to Supabase Storage
    const supabaseAdmin = createAdminClient();
    const { error: uploadError } = await supabaseAdmin.storage
      .from('media')
      .upload(uniquePath, buffer, {
        contentType: file.type,
        duplex: 'half',
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('media')
      .getPublicUrl(uniquePath);

    // Determine type
    let mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT' = 'DOCUMENT';
    if (file.type.startsWith('image/')) {
      mediaType = 'IMAGE';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'VIDEO';
    }

    // Save to DB
    const media = await prisma.media.create({
      data: {
        filename: uniquePath,
        originalName: file.name,
        mimeType: file.type,
        size: BigInt(file.size),
        url: publicUrl,
        storagePath: uniquePath,
        bucket: 'media',
        uploadedById: dbUser.id,
        type: mediaType,
      },
    }).catch((e) => {
      console.error('Failed to create media record in DB:', e);
      return null;
    });

    if (!media) {
      return NextResponse.json({ error: 'Failed to save media metadata' }, { status: 500 });
    }

    // Convert BigInt to string/number for response serialization
    const serializedMedia = {
      ...media,
      size: media.size.toString(),
    };

    return NextResponse.json({ success: true, data: serializedMedia });
  } catch (err: any) {
    console.error('Media upload route error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
