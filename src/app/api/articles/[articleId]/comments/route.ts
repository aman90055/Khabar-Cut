import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const postCommentSchema = z.object({
  author_name: z.string().min(1).max(100),
  author_email: z.string().email(),
  body: z.string().min(2).max(2000),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;

    const { data, error } = await supabase
      .from('comments')
      .select('id, content, created_at, user:users!user_id(full_name)')
      .eq('article_id', articleId)
      .eq('status', 'APPROVED')
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    const formatted = (data || []).map((c: any) => ({
      id: c.id,
      author_name: c.user?.full_name || 'पाठक',
      body: c.content,
      created_at: c.created_at,
    }));

    return NextResponse.json({ data: formatted });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    
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

    const email = parsed.data.author_email.toLowerCase().trim();
    const name = parsed.data.author_name.trim();
    const now = new Date().toISOString();

    // Find or create user
    let userId: string;
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      userId = crypto.randomUUID();
      await supabase.from('users').insert({
        id: userId,
        email,
        full_name: name,
        is_active: true,
        is_verified: false,
        auth_provider: 'guest',
        updated_at: now,
      });
    }

    const commentId = crypto.randomUUID();
    const { data, error } = await supabase
      .from('comments')
      .insert({
        id: commentId,
        article_id: articleId,
        user_id: userId,
        content: parsed.data.body,
        status: 'APPROVED',
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting comment:', error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        id: data.id,
        author_name: name,
        body: data.content,
        created_at: data.created_at,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
