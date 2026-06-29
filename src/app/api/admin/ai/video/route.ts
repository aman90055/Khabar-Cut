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

    const systemPrompt = `You are a TV Broadcast Producer at Khabar Cut.
Generate TV anchor script, voiceover transcript, and reels outline.
Output raw JSON strictly matching the keys:
"anchorScript", "reelsScript", "voiceoverScript", "subtitlesTemplate"`;

    const userPrompt = `Content: ${content || 'Breaking report brief'}`;

    const res = await AIService.generate(userPrompt, {
      model: 'gemini',
      systemInstruction: systemPrompt,
    });

    let scripts = {
      anchorScript: 'Good evening. You are watching Khabar Cut live. Tonight, we bring you…',
      reelsScript: 'Hey guys, did you hear about this? Check out the details…',
      voiceoverScript: 'Reporting live from Bengaluru Smart signal blocks.',
      subtitlesTemplate: '[00:01] Welcome back to Khabar Cut news broadcasts.',
    };

    try {
      const cleanJson = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      scripts = { ...scripts, ...parsed };
    } catch {
      // fallback
    }

    return NextResponse.json(scripts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
