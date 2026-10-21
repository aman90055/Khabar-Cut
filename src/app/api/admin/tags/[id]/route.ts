import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';
import { requireAuth } from '@/middleware/rbac';

const adminSupabase = createAdminClient();

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

    const { data: existingTag } = await adminSupabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    let slug = existingTag.slug;
    if (validated.name && validated.name !== existingTag.name) {
      const baseSlug = generateSlug(validated.name);
      slug = baseSlug;
      let counter = 1;
      while (true) {
        const { data: existing } = await adminSupabase
          .from('tags')
          .select('id')
          .eq('slug', slug)
          .neq('id', id)
          .is('deleted_at', null)
          .maybeSingle();

        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
      slug,
    };
    if (validated.name) updatePayload.name = validated.name;
    if (validated.description !== undefined) updatePayload.description = validated.description;

    const { data: updatedTag, error } = await adminSupabase
      .from('tags')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { ...updatedTag, _count: { articles: 0 } } });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || 'Server error' }, { status });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    if (user.role.level > 4) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const { error } = await adminSupabase
      .from('tags')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || 'Server error' }, { status });
  }
}
