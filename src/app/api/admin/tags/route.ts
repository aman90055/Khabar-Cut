import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateSlug, serializeBigInt } from '@/lib/utils';
import { requireAuth } from '@/middleware/rbac';

export async function GET() {
  try {
    await requireAuth();
    const tags = await prisma.tag.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { articles: { where: { deletedAt: null } } },
        },
      },
      orderBy: { name: 'asc' },
    }).catch(() => []);

    return NextResponse.json({ data: serializeBigInt(tags) });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || 'Server error' }, { status });
  }
}

const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (user.role.level > 6) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = createTagSchema.parse(body);

    const baseSlug = generateSlug(validated.name);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.tag.findFirst({
        where: { slug, deletedAt: null },
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const tag = await prisma.tag.create({
      data: {
        name: validated.name,
        slug,
        description: validated.description || null,
      },
    });

    return NextResponse.json({ success: true, data: serializeBigInt(tag) }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || 'Server error' }, { status });
  }
}
