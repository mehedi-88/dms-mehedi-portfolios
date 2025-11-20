import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, input } = body;

    if (!tool || !input) {
      return NextResponse.json({ error: 'Missing tool or input' }, { status: 400 });
    }

    let result = '';
    const model = 'gpt-4o-mini'; // A capable model for multi-modal and code tasks

    switch (tool) {
      case 'ocr':
        // OCR & Image Captioning (Vision API)
        // 'input' is expected to be a base64 data URL string
        result = await handleOcrAndCaptioning(input, model);
        break;

      case 'codegen':
        // Code Generator
        result = await handleCodeGeneration(input, model);
        break;

      case 'codefixer':
        // Code Fixer
        result = await handleCodeFixer(input, model);
        break;

      case 'countries':
        // Countries List (Structured Data Extraction)
        result = await handleCountriesList(input, model);
        break;

      case 'translator':
        // Translator
        result = await handleTranslator(input, model);
        break;

      case 'chat':
        // AI Chat Assistant
        result = await handleChatAssistant(input, model, body);
        break;

      case 'project-assistant':
        // Project-specific AI assistant
        result = await handleProjectAssistant(input);
        break;

      default:
        return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('AI Tools API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleOcrAndCaptioning(input: string, model: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('API key missing');
  const openai = new OpenAI({ apiKey });
  
  // Extract base64 content from data URL
  const [mimeType, base64Image] = input.split(';base64,');
  const image_url = 'data:' + mimeType + ';base64,' + base64Image;

  const prompt = "Describe this image in detail and extract any visible text (OCR). Output the description first, followed by the extracted text.";

  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: image_url } },
        ],
      },
    ],
    max_tokens: 1024,
  });

  return response.choices[0].message.content || 'Could not process image.';
}

async function handleCodeGeneration(input: string, model: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('API key missing');
  const openai = new OpenAI({ apiKey });
  
  const prompt = 'Generate code based on the following request. Only output the code block. Request: ' + input;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048,
  });

  return response.choices[0].message.content || 'Could not generate code.';
}

async function handleCodeFixer(input: string, model: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('API key missing');
  const openai = new OpenAI({ apiKey });
  
  const prompt = 'Analyze the following code, identify any bugs, and provide a corrected version. Also, provide a brief explanation of the fix. Format the output with the explanation first, then a diff or a corrected code block. Code: ' + input;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048,
  });

  return response.choices[0].message.content || 'Could not fix code.';
}

async function handleCountriesList(input: string, model: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('API key missing');
  const openai = new OpenAI({ apiKey });
  
  const prompt = 'Provide a list of 10 countries and their capital cities, population, and flag emoji based on the theme: ' + input + '. Output the result as a single JSON array of objects, with keys: "country", "capital", "population", "flag". Do not include any text outside the JSON block.';

  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 1024,
  });

  // The response content will be a JSON string
  return response.choices[0].message.content || 'Could not generate country list.';
}

async function handleTranslator(input: string, model: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('API key missing');
  const openai = new OpenAI({ apiKey });
  
  const prompt = 'Translate the following text or JSON object into English, preserving the original structure if it is a JSON object. Input: ' + input;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
  });

  return response.choices[0].message.content || 'Could not translate text.';
}

async function handleProjectAssistant(input: any): Promise<string> {
  if (!input || !input.question || !input.project) {
    throw new Error('Missing question or project data.');
  }

  const { question, project } = input;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('API key missing.');
  }

  const projectOpenai = new OpenAI({ apiKey });
  const prompt = `You are an AI assistant for DMS Mehedi Portfolio. Explain the user's role and contributions in the following project:

Project Title: ${project.title}
Role: ${project.role}
Achievements: ${project.achievements.join(', ')}
Technologies: ${project.technologies.join(', ')}
Description: ${project.description}

User question: ${question}

Reply in a friendly, professional tone, under 150 words.`;

  const completion = await projectOpenai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful AI assistant for DMS Mehedi Portfolio.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 300,
  });

  return completion.choices[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';
}

async function handleChatAssistant(input: string, model: string, body: any): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('API key missing');

  const mode = body.mode || 'thinking';
  const history = body.history || [];

  const moodPrompts: Record<string, string> = {
    thinking: 'You are a deep reflective AI who reasons carefully before answering. Take your time to provide thoughtful responses.',
    agent: 'You are a helpful and fast digital assistant who gives concise, actionable answers. Be quick and efficient.',
    research: 'You are an analytical AI researcher who provides detailed factual responses with proper citations.',
    auto: 'You are an adaptive AI who balances reasoning and quick insight automatically. Be versatile.'
  };

  const openai = new OpenAI({ apiKey });

  // Build conversation context from history
  const conversationHistory = history.slice(-3).map((msg: any) => ({
    role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
    content: msg.content
  }));

  // Add system prompt for the AI assistant
  const systemPrompt = `You are DMS AI, a helpful AI assistant for DMS Mehedi, a digital marketing strategist and web developer.
You help customers with inquiries about digital marketing, SEO, web development, Shopify dropshipping, and related services.
${moodPrompts[mode] || moodPrompts.thinking}
Be professional, friendly, and concise. If you don't know something specific, suggest they reach out to the admin directly.
Keep responses under 150 words.`;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: systemPrompt as string },
      ...conversationHistory,
      { role: 'user', content: input.trim() }
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.choices[0].message.content || "I'm here to help! Please provide more details about your inquiry.";
}

