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
    if (!content) {
      return NextResponse.json({ error: 'Content is required for summaries' }, { status: 400 });
    }

    const systemPrompt = `You are a Social Media Editor at Khabar Cut.
Analyze the article content. Generate summaries and captions.
Output raw JSON strictly matching the keys:
"oneLineSummary", "twoLineSummary", "socialSummary", "instagramCaption", "telegramCaption", "whatsappCaption", "youtubeDescription"`;

    const userPrompt = `Content: ${content}`;

    const res = await AIService.generate(userPrompt, {
      model: 'gemini',
      systemInstruction: systemPrompt,
    });

    let summaryData = {
      oneLineSummary: 'Breaking report published by Khabar Cut.',
      twoLineSummary: 'Continuous updates available online.',
      socialSummary: 'Follow Khabar Cut for verified coverages.',
      instagramCaption: 'Read full story on our bio link!',
      telegramCaption: 'Detailed brief inside.',
      whatsappCaption: 'Share with friends!',
      youtubeDescription: 'Subscribe for live updates.',
    };

    try {
      const cleanJson = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      summaryData = { ...summaryData, ...parsed };
    } catch {
      // fallback
    }

    return NextResponse.json(summaryData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
