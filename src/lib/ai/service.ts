import { prisma } from '@/lib/prisma';

export interface AIServiceResponse {
  text: string;
  modelUsed: string;
  creditsUsed: number;
}

export interface AIServiceOptions {
  model?: 'gemini' | 'openai' | 'claude';
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

export class AIService {
  private static async getApiKey(provider: 'gemini' | 'openai' | 'claude'): Promise<string | null> {
    const keyMap = {
      gemini: 'gemini_api_key',
      openai: 'openai_api_key',
      claude: 'claude_api_key',
    };

    const keySetting = await prisma.setting.findUnique({
      where: { key: keyMap[provider] },
    }).catch(() => null);

    const val = (keySetting?.value as string) || '';
    if (val) return val;

    // Fallbacks to env
    const envMap = {
      gemini: 'GEMINI_API_KEY',
      openai: 'OPENAI_API_KEY',
      claude: 'CLAUDE_API_KEY',
    };
    return process.env[envMap[provider]] || null;
  }

  /**
   * Generates text content using selected model with automatic fallback to Gemini.
   */
  public static async generate(prompt: string, options: AIServiceOptions = {}): Promise<AIServiceResponse> {
    const model = options.model || 'gemini';
    const systemPrompt = options.systemInstruction || 'You are an AI assistant for Khabar Cut enterprise Indian newsroom.';

    // Try selected model
    try {
      if (model === 'openai') {
        const res = await this.callOpenAI(prompt, systemPrompt, options);
        if (res) return res;
      } else if (model === 'claude') {
        const res = await this.callClaude(prompt, systemPrompt, options);
        if (res) return res;
      }
    } catch (err) {
      console.warn(`AI model ${model} failed, falling back to Gemini. Error:`, err);
    }

    // Default Fallback: Gemini
    return this.callGemini(prompt, systemPrompt, options);
  }

  private static async callGemini(prompt: string, systemPrompt: string, options: AIServiceOptions): Promise<AIServiceResponse> {
    const apiKey = await this.getApiKey('gemini');
    if (!apiKey) {
      return {
        text: 'Gemini API key is not configured. Please configure it in system settings.',
        modelUsed: 'gemini-fallback-failed',
        creditsUsed: 0,
      };
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Prompt: ${prompt}` }] }],
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxTokens ?? 2000,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated.';

    // Log AI Usage Credit Simulation
    await this.logUsage('gemini-1.5-flash', 1);

    return {
      text,
      modelUsed: 'gemini-1.5-flash',
      creditsUsed: 1,
    };
  }

  private static async callOpenAI(prompt: string, systemPrompt: string, options: AIServiceOptions): Promise<AIServiceResponse | null> {
    const apiKey = await this.getApiKey('openai');
    if (!apiKey) return null;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API returned status ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || 'No content generated.';

    // Log credit usage (OpenAI mini = 2 credits)
    await this.logUsage('gpt-4o-mini', 2);

    return {
      text,
      modelUsed: 'gpt-4o-mini',
      creditsUsed: 2,
    };
  }

  private static async callClaude(prompt: string, systemPrompt: string, options: AIServiceOptions): Promise<AIServiceResponse | null> {
    const apiKey = await this.getApiKey('claude');
    if (!apiKey) return null;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens ?? 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error(`Claude API returned status ${res.status}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || 'No content generated.';

    // Log credit usage (Claude 3.5 = 5 credits)
    await this.logUsage('claude-3-5-sonnet', 5);

    return {
      text,
      modelUsed: 'claude-3-5-sonnet',
      creditsUsed: 5,
    };
  }

  private static async logUsage(modelName: string, credits: number): Promise<void> {
    try {
      // Fetch or seed credits count in database Settings
      const usageKey = 'ai_credits_used';
      const existing = await prisma.setting.findUnique({
        where: { key: usageKey },
      }).catch(() => null);

      let currentVal = 0;
      if (existing) {
        currentVal = Number(existing.value) || 0;
        await prisma.setting.update({
          where: { key: usageKey },
          data: { value: currentVal + credits },
        });
      } else {
        await prisma.setting.create({
          data: {
            key: usageKey,
            value: credits,
            group: 'ai',
            description: 'Total AI credit usage counter',
          },
        });
      }

      // Log details inside audit_logs or settings array
      const logsKey = 'ai_usage_history';
      const historyRecord = await prisma.setting.findUnique({
        where: { key: logsKey },
      }).catch(() => null);

      const newLog = {
        timestamp: new Date().toISOString(),
        model: modelName,
        credits,
      };

      if (historyRecord) {
        const list = Array.isArray(historyRecord.value) ? historyRecord.value : [];
        const updatedList = [newLog, ...list].slice(0, 50); // limit to 50 logs
        await prisma.setting.update({
          where: { key: logsKey },
          data: { value: updatedList },
        });
      } else {
        await prisma.setting.create({
          data: {
            key: logsKey,
            value: [newLog],
            group: 'ai',
            description: 'AI interaction history log',
          },
        });
      }
    } catch (e) {
      console.error('Failed to log AI credit usage:', e);
    }
  }
}
