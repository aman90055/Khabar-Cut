import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const { data: story, error: storyError } = await supabase
      .from('web_stories')
      .select(`
        *,
        web_story_slides (*)
      `)
      .eq('slug', slug)
      .single();

    if (storyError) {
      return NextResponse.json({ error: storyError.message }, { status: 500 });
    }

    if (story && story.web_story_slides) {
      story.web_story_slides.sort((a: any, b: any) => a.position - b.position);
    }

    return NextResponse.json(story);
  }

  const { data: stories, error } = await supabase
    .from('web_stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(stories);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  
  try {
    const body = await req.json();
    const { title, slug, cover_image_url, status, slides } = body;

    const { data: story, error: storyError } = await supabase
      .from('web_stories')
      .insert([
        { title, slug, cover_image_url, status }
      ])
      .select()
      .single();

    if (storyError) {
      return NextResponse.json({ error: storyError.message }, { status: 500 });
    }

    if (slides && slides.length > 0) {
      const slidesToInsert = slides.map((slide: any, index: number) => ({
        story_id: story.id,
        image_url: slide.image_url,
        text_content: slide.text_content,
        position: index
      }));

      const { error: slidesError } = await supabase
        .from('web_story_slides')
        .insert(slidesToInsert);

      if (slidesError) {
        return NextResponse.json({ error: slidesError.message }, { status: 500 });
      }
    }

    return NextResponse.json(story);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
