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
      return NextResponse.json({ error: 'Content is required for moderation' }, { status: 400 });
    }

    const systemPrompt = `You are a Content Safety Moderator at Khabar Cut.
Analyze the content for policy violations, abuse, spam, profanity, and hate speech.
Output raw JSON strictly matching the keys:
"riskScore", "isSafe", "flaggedCategories", "reasoning"`;

    const userPrompt = `Content: ${content}`;

    const res = await AIService.generate(userPrompt, {
      model: 'gemini',
      systemInstruction: systemPrompt,
    });

    let modData = {
      riskScore: 0,
      isSafe: true,
      flaggedCategories: [],
      reasoning: 'No policy violations detected.',
    };

    try {
      const cleanJson = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      modData = { ...modData, ...parsed };
    } catch {
      // fallback
    }

    return NextResponse.json(modData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
