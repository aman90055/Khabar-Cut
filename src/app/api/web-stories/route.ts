import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const { data: story, error: storyError } = await supabase
      .from('web_stories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (storyError) {
      return NextResponse.json({ error: storyError.message }, { status: 500 });
    }

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    let slidesArray = [];
    try {
      slidesArray = typeof story.slides === 'string' ? JSON.parse(story.slides) : (story.slides || []);
    } catch {
      slidesArray = [];
    }

    const formattedStory = {
      ...story,
      cover_image_url: story.cover_image,
      web_story_slides: slidesArray.map((s: any, idx: number) => ({
        id: s.id || `${story.id}-slide-${idx}`,
        image_url: s.image_url || s.imageUrl || '',
        text_content: s.text_content || s.textContent || s.caption || '',
        position: s.position ?? idx,
      })),
    };

    return NextResponse.json(formattedStory);
  }

  const { data: stories, error } = await supabase
    .from('web_stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedList = (stories || []).map((s: any) => ({
    ...s,
    cover_image_url: s.cover_image,
  }));

  return NextResponse.json(formattedList);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  
  try {
    const body = await req.json();
    const { title, slug, cover_image_url, cover_image, status, slides } = body;

    const storyStatus = (status || 'PUBLISHED').toUpperCase() === 'DRAFT' ? 'DRAFT' : 'PUBLISHED';
    const now = new Date().toISOString();

    const formattedSlides = (slides || []).map((s: any, index: number) => ({
      id: crypto.randomUUID(),
      image_url: s.image_url || s.imageUrl || '',
      text_content: s.text_content || s.textContent || '',
      position: index,
    }));

    const newStory = {
      id: crypto.randomUUID(),
      title,
      slug,
      cover_image: cover_image_url || cover_image || '',
      slides: formattedSlides,
      author_id: 'a1051d10-73a2-4042-975f-19c9cc3ddb54',
      status: storyStatus,
      published_at: now,
      updated_at: now,
    };

    const { data: story, error: storyError } = await supabase
      .from('web_stories')
      .insert([newStory])
      .select()
      .single();

    if (storyError) {
      console.error('[WebStories API] Insert error:', storyError);
      return NextResponse.json({ error: storyError.message }, { status: 500 });
    }

    return NextResponse.json({
      ...story,
      cover_image_url: story.cover_image,
      web_story_slides: formattedSlides,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
