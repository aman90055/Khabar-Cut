import { NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/service';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const systemPrompt = `You are a Digital Strategy Analyst at Khabar Cut.
Formulate trending Indian search topics, hashtags, and keywords based on current national events.
Output raw JSON strictly matching the keys:
"trendingTopics", "trendingHashtags", "trendingKeywords"`;

    const res = await AIService.generate('Generate current Indian trends list', {
      model: 'gemini',
      systemInstruction: systemPrompt,
    });

    let trends = {
      trendingTopics: ['Union Budget Reforms', 'Quantum Computing in Bengaluru', 'Himalayan Smart IT hubs'],
      trendingHashtags: ['#SmartBengaluru', '#DigitalTrade', '#IndiaQuantum'],
      trendingKeywords: ['Bengaluru Transit', 'Nifty historical high', 'Monsoon relief India'],
    };

    try {
      const cleanJson = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      trends = { ...trends, ...parsed };
    } catch {
      // fallback
    }

    return NextResponse.json(trends);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
