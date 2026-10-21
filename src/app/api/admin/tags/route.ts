import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';
import { requireAuth } from '@/middleware/rbac';
import crypto from 'crypto';

const adminSupabase = createAdminClient();

export async function GET() {
  try {
    await requireAuth();
    const { data: tags, error } = await adminSupabase
      .from('tags')
      .select('id, name, slug, description, created_at')
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (tags || []).map((t: any) => ({
      ...t,
      _count: { articles: 0 },
    }));

    return NextResponse.json({ data: formatted });
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
      const { data: existing } = await adminSupabase
        .from('tags')
        .select('id')
        .eq('slug', slug)
        .is('deleted_at', null)
        .maybeSingle();

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const { data: tag, error } = await adminSupabase
      .from('tags')
      .insert({
        id: crypto.randomUUID(),
        name: validated.name,
        slug,
        description: validated.description || null,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { ...tag, _count: { articles: 0 } },
    }, { status: 201 });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || 'Server error' }, { status });
  }
}
