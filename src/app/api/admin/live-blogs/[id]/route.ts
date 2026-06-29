import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { serializeBigInt } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const blog = await prisma.liveBlog.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: { displayName: true },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Live blog not found' }, { status: 404 });
    }

    const entries = await prisma.liveBlogEntry.findMany({
      where: { liveBlogId: id, deletedAt: null },
      include: {
        author: {
          select: { displayName: true, avatarUrl: true },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    }).catch(() => []);

    return NextResponse.json({
      blog: serializeBigInt(blog),
      entries: serializeBigInt(entries),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
