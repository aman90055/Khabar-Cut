import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { serializeBigInt } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';

    const where = {
      deletedAt: null,
      ...(type && type !== 'ALL' && { type: type as any }),
      ...(query && {
        OR: [
          { filename: { contains: query, mode: 'insensitive' as const } },
          { originalName: { contains: query, mode: 'insensitive' as const } },
        ],
      }),
    };

    const mediaItems = await prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 40,
    }).catch(() => []);

    const serialized = serializeBigInt(mediaItems);
    return NextResponse.json({ data: serialized });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
