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

    const systemPrompt = `You are a Social Marketing Manager at Khabar Cut.
Analyze the story. Generate posts for distinct platforms.
Output raw JSON strictly containing keys:
"facebookPost", "instagramPost", "twitterPost", "telegramPost", "linkedinPost", "youtubeCommunityPost"`;

    const userPrompt = `Content: ${content || 'Breaking report brief'}`;

    const res = await AIService.generate(userPrompt, {
      model: 'gemini',
      systemInstruction: systemPrompt,
    });

    let socialData = {
      facebookPost: 'Breaking update from Khabar Cut news desk.',
      instagramPost: 'Full brief on bio link! #KhabarCut',
      twitterPost: 'Breaking update from Khabar Cut news desk. #News',
      telegramPost: 'Follow our channel for verified reports.',
      linkedinPost: 'Read our latest professional editorial analysis.',
      youtubeCommunityPost: 'Watch our news segments on YouTube.',
    };

    try {
      const cleanJson = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      socialData = { ...socialData, ...parsed };
    } catch {
      // fallback
    }

    return NextResponse.json(socialData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
