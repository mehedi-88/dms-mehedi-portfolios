import { NextRequest, NextResponse } from 'next/server';
// For edge runtimes, ensure process.env is available
import process from 'process';

const MOOD_PROMPTS: Record<string, string> = {
  thinking: 'You are a deep reflective AI who reasons carefully before answering.',
  agent: 'You are a helpful and fast digital assistant who gives concise, actionable answers.',
  research: 'You are an analytical AI researcher who provides detailed factual responses.',
  auto: 'You are an adaptive AI who balances reasoning and quick insight automatically.'
};

export async function POST(req: NextRequest) {
  try {
    const { message, mood } = await req.json();
    const moodKey = String(mood).toLowerCase();
    if (!message || !moodKey || !MOOD_PROMPTS[moodKey]) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }
    
    const apiKey = process.env.OPENAI_API_KEY;

    // === FIX ===
    // স্ট্যাটাস 200 থেকে 500 এ পরিবর্তন করা হয়েছে।
    // একটি API কী না পাওয়া একটি সার্ভার ত্রুটি (500), সফল রেসপন্স (200) নয়।
    if (!apiKey || !apiKey.startsWith('sk-')) {
      console.error('OpenAI API key is missing or invalid.'); // সার্ভারে লগ করুন
      return NextResponse.json({ error: 'OpenAI API key is missing or invalid. Please check your .env.local file.' }, { status: 500 });
    }
    // === END FIX ===
    
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: MOOD_PROMPTS[moodKey] },
          { role: 'user', content: message }
        ],
        max_tokens: 512,
        temperature: 0.7
      })
    });

    if (!openaiRes.ok) {
      let errMsg = 'OpenAI API error.';
      try {
        const errData = await openaiRes.json();
        if (errData?.error?.message) errMsg = errData.error.message;
      } catch {}
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    const data = await openaiRes.json();
    const result = data.choices?.[0]?.message?.content?.trim() || 'No response.';
    
    return NextResponse.json({ reply: result });

  } catch (error) {
    console.error('FAQ Chat API error:', error);
    return NextResponse.json({ error: 'AI response failed.' }, { status: 500 });
  }
}