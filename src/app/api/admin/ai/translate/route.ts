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

    const { text, targetLanguage } = await request.json();
    if (!text || !targetLanguage) {
      return NextResponse.json({ error: 'Text and targetLanguage are required' }, { status: 400 });
    }

    const systemPrompt = `You are a professional multi-language translator at Khabar Cut.
Translate the text exactly into target language "${targetLanguage}".
Keep journalistic terminology accurate. Preserve formatting.`;

    const res = await AIService.generate(text, {
      model: 'gemini',
      systemInstruction: systemPrompt,
    });

    return NextResponse.json({
      translatedText: res.text,
      modelUsed: res.modelUsed,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
