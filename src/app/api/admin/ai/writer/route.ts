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

    const { headline, topic, keywords, category, language, location, type } = await request.json();

    const systemPrompt = `You are a Principal Editorial Writer at Khabar Cut, India's leading digital newsroom.
Write a structured report in language "${language || 'English'}".
Style specification: Professional corporate newsroom, objective, factual.
Location focus: "${location || 'National'}".
Category focus: "${category || 'General'}".
Report Type: "${type || 'Long Form Article'}".
Include a "Sources & Cross-References" section at the end. Use markdown headings.`;

    const userPrompt = `Draft an article with the following inputs:
Headline idea: ${headline || 'No headline specified'}
Topic: ${topic || 'General News'}
Keywords to integrate: ${keywords || 'none'}
Write a comprehensive article. Do not use placeholders. Write the full text.`;

    const res = await AIService.generate(userPrompt, {
      model: 'gemini',
      systemInstruction: systemPrompt,
    });

    // Calculate reading time: 200 words per minute average
    const words = res.text.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    return NextResponse.json({
      articleText: res.text,
      wordCount: words,
      readingTime,
      modelUsed: res.modelUsed,
      creditsUsed: res.creditsUsed,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
