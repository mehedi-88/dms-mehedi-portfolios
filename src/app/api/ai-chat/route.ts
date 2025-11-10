import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Missing messages array' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // Build conversation context
    const conversationHistory = messages.slice(-3).map((msg: any) => {
      if (msg.role === "function") {
        return {
          role: "function" as const,
          content: msg.message,
          name: msg.name || "function"
        };
      }
      const role: "user" | "assistant" | "system" =
        msg.role === "user" || msg.role === "assistant" || msg.role === "system"
          ? msg.role
          : msg.sender === "user"
          ? "user"
          : "assistant";
      return {
        role,
        content: msg.message
      };
    });

    // Add system prompt for the AI assistant
    const systemPrompt = `You are a helpful AI assistant for DMS Mehedi, a digital marketing strategist and web developer. 
You help customers with inquiries about digital marketing, SEO, web development, Shopify dropshipping, and related services.
Be professional, friendly, and concise. If you don't know something specific, suggest they reach out to the admin directly.
Keep responses under 150 words.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt as string },
        ...conversationHistory
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const aiReply = response.choices[0].message.content || "I'm here to help! Please provide more details about your inquiry.";

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI response',
        reply: "Thank you for your message! I'm currently offline but will get back to you as soon as possible."
      },
      { status: 500 }
    );
  }
}