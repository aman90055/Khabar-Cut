import { NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();

    const systemPrompt = `You are a Creative Director at Khabar Cut.
Generate image generation prompts (DALL-E/Midjourney specification) for this article.
Output raw JSON strictly matching the keys:
"editorialImagePrompt", "youtubeThumbnailPrompt", "newsPosterPrompt", "breakingNewsGraphicsPrompt", "webStoryGraphicsPrompt"`;

    const userPrompt = `Content: ${content || 'Breaking report brief'}`;

    const res = await AIService.generate(userPrompt, {
      model: 'gemini',
      systemInstruction: systemPrompt,
    });

    let assetPrompts = {
      editorialImagePrompt: 'High quality documentary photograph showing national event.',
      youtubeThumbnailPrompt: 'Vibrant graphic with bold title typography.',
      newsPosterPrompt: 'Minimalist poster illustration for digital distribution.',
      breakingNewsGraphicsPrompt: 'Bold red template banner layout.',
      webStoryGraphicsPrompt: 'Segmented portrait card template layout.',
    };

    try {
      const cleanJson = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      assetPrompts = { ...assetPrompts, ...parsed };
    } catch {
      // fallback
    }

    return NextResponse.json(assetPrompts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
