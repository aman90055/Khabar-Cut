import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Try finding key in database first, then fallback to environment
    const { data: dbKeySetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'gemini_api_key')
      .maybeSingle();

    const apiKey = (dbKeySetting?.value as string) || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        response: 'Gemini API key is not configured. Please add a valid GEMINI_API_KEY in Settings > API Keys.',
      });
    }

    const systemPrompt = 'You are an AI assistant for Khabar Cut, an enterprise Indian news platform. Be professional, direct, factually accurate, and concise.';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }] }],
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API call failed with status:', response.status);
      return NextResponse.json({
        response: 'Failed to generate response from Gemini API. Verify that your API key is correct and not rate-limited.',
      });
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({
      response: candidateText || 'No response generated.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
