import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const postCommentSchema = z.object({
  content: z.string().min(3).max(2000),
  parentId: z.string().uuid().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const { articleId } = await params;

  const comments = await prisma.comment.findMany({
    where: { articleId, status: 'APPROVED', deletedAt: null },
    include: {
      user: { select: { fullName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' },
  }).catch(() => []);

  return NextResponse.json({ data: comments });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const { articleId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { authId: user.id } }).catch(() => null);
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = postCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      articleId,
      userId: dbUser.id,
      parentId: parsed.data.parentId ?? null,
      ipAddress,
      status: 'PENDING',
    },
  }).catch(() => null);

  if (!comment) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }

  return NextResponse.json({ data: comment }, { status: 201 });
}
