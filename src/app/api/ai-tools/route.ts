import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

// Initialize OpenAI client
// The API key is automatically read from the OPENAI_API_KEY environment variable
const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const { tool, input } = await req.json();

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

// --- Tool Handlers using OpenAI ---

async function handleOcrAndCaptioning(input: string, model: string): Promise<string> {
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
  const prompt = 'Generate code based on the following request. Only output the code block. Request: ' + input;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048,
  });

  return response.choices[0].message.content || 'Could not generate code.';
}

async function handleCodeFixer(input: string, model: string): Promise<string> {
  const prompt = 'Analyze the following code, identify any bugs, and provide a corrected version. Also, provide a brief explanation of the fix. Format the output with the explanation first, then a diff or a corrected code block. Code: ' + input;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048,
  });

  return response.choices[0].message.content || 'Could not fix code.';
}

async function handleCountriesList(input: string, model: string): Promise<string> {
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
  const prompt = 'Translate the following text or JSON object into English, preserving the original structure if it is a JSON object. Input: ' + input;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
  });

  return response.choices[0].message.content || 'Could not translate text.';
}

