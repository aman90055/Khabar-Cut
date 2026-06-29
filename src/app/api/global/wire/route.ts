// =============================================================================
// /api/global/wire — Internal Wire Service Distribution Queue
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const wireQuerySchema = z.object({
  priority: z.enum(['URGENT', 'FLASH', 'UPDATE', 'CORRECTION', 'EXCLUSIVE', 'EMBARGO']).optional(),
  language: z.string().default('en'),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

const wireCreateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  priority: z.enum(['URGENT', 'FLASH', 'UPDATE', 'CORRECTION', 'EXCLUSIVE', 'EMBARGO']).default('UPDATE'),
  source: z.string().default('internal'),
  language: z.string().default('en'),
  embargoUntil: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = wireQuerySchema.parse({
      priority: searchParams.get('priority') || undefined,
      language: searchParams.get('language') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    });

    const where: Record<string, any> = { deletedAt: null };
    if (params.priority) where.priority = params.priority;
    if (params.language) where.language = params.language;

    // Filter out embargoed items that are still active
    const now = new Date();
    where.OR = [
      { embargoUntil: null },
      { embargoUntil: { lt: now } },
    ];

    const [items, total] = await Promise.all([
      prisma.wireItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit,
        skip: params.offset,
      }),
      prisma.wireItem.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      total,
      limit: params.limit,
      offset: params.offset,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Fetch wire error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = wireCreateSchema.parse(body);

    const wireItem = await prisma.wireItem.create({
      data: {
        title: data.title,
        content: data.content,
        priority: data.priority,
        source: data.source,
        language: data.language,
        embargoUntil: data.embargoUntil ? new Date(data.embargoUntil) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: wireItem,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create wire error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
