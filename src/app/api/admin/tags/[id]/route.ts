import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateSlug, serializeBigInt } from '@/lib/utils';
import { requireAuth } from '@/middleware/rbac';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').optional(),
  description: z.string().optional().nullable(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    if (user.role.level > 6) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateTagSchema.parse(body);

    const existingTag = await prisma.tag.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    let slug = existingTag.slug;
    if (validated.name && validated.name !== existingTag.name) {
      const baseSlug = generateSlug(validated.name);
      slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await prisma.tag.findFirst({
          where: { slug, id: { not: id }, deletedAt: null },
        });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.description !== undefined && { description: validated.description }),
        slug,
      },
    });

    return NextResponse.json({ success: true, data: serializeBigInt(updatedTag) });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || 'Server error' }, { status });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    if (user.role.level > 6) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const existingTag = await prisma.tag.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Soft delete by setting deletedAt
    await prisma.tag.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Tag deleted successfully' });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || 'Server error' }, { status });
  }
}
