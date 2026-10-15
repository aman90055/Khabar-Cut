import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const postCommentSchema = z.object({
  author_name: z.string().min(1).max(100),
  author_email: z.string().email(),
  body: z.string().min(3).max(2000),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('comments')
      .select('id, author_name, body, created_at')
      .eq('article_id', articleId)
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
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

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('comments')
      .insert({
        article_id: articleId,
        author_name: parsed.data.author_name,
        author_email: parsed.data.author_email,
        body: parsed.data.body,
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting comment:', error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
