import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const MOOD_PROMPTS: Record<string, string> = {
  thinking: 'You are a deep reflective AI who reasons carefully before answering. Take your time to provide thoughtful responses.',
  agent: 'You are a helpful and fast digital assistant who gives concise, actionable answers. Be quick and efficient.',
  research: 'You are an analytical AI researcher who provides detailed factual responses with proper citations.',
  auto: 'You are an adaptive AI who balances reasoning and quick insight automatically. Be versatile.'
};

export async function POST(req: NextRequest) {
  try {
    const { message, mood } = await req.json();
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
    
    const openai = new OpenAI({ apiKey });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: MOOD_PROMPTS[moodKey] },
        { role: 'user', content: message.trim() }
      ],
      max_tokens: 512,
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || 'AI response was empty.';
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('FAQ Chat API error:', error?.message || error);
    return NextResponse.json({ error: 'AI response failed. Please try again.' }, { status: 500 });
  }
}