import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const MOOD_PROMPTS: Record<string, string> = {
  thinking: 'You are a deep reflective AI who reasons carefully before answering. Take your time to provide thoughtful responses.',
  agent: 'You are a helpful and fast digital assistant who gives concise, actionable answers. Be quick and efficient.',
  research: 'You are an analytical AI researcher who provides detailed factual responses with proper citations.',
  auto: 'You are an adaptive AI who balances reasoning and quick insight automatically. Be versatile.'
};

export async function POST(req: NextRequest) {
  try {
    const { message, mood, history } = await req.json();
    const moodKey = String(mood || 'thinking').toLowerCase();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    if (!MOOD_PROMPTS[moodKey]) {
      return NextResponse.json({ error: 'Invalid mood.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key is missing.');
      return NextResponse.json({ error: 'API key missing.' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });    // Build conversation context from history
    const conversationHistory = history ? history.slice(-3).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    })) : [];

    // Add system prompt for the AI assistant
    const systemPrompt = `You are a helpful AI assistant for DMS Mehedi, a digital marketing strategist and web developer.
You help customers with inquiries about digital marketing, SEO, web development, Shopify dropshipping, and related services.
${MOOD_PROMPTS[moodKey]}
Be professional, friendly, and concise. If you don't know something specific, suggest they reach out to the admin directly.
Keep responses under 150 words.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt as string },
        ...conversationHistory,
        { role: 'user', content: message.trim() }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const aiReply = response.choices[0].message.content || "I'm here to help! Please provide more details about your inquiry.";

    return NextResponse.json({ reply: aiReply });
  } catch (error: any) {
    console.error('FAQ Chat API error:', error?.message || error);
    return NextResponse.json(
      {
        error: 'AI response failed. Please try again.',
        reply: "Thank you for your message! I'm currently offline but will get back to you as soon as possible."
      },
      { status: 500 }
    );
  }
}