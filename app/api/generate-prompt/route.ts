import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { parseAndCleanJsonOutput } from '@/lib/utils'
import { getServerSession } from 'next-auth'

// Initialize the Gemini API with your API key
let genAI: GoogleGenerativeAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not configured in environment variables');
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('Gemini API initialized successfully');
} catch (error) {
  console.error('Error initializing Gemini API:', error);
}

// Add this helper function before the POST handler
async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.status === 503 && retries < maxRetries - 1) {
        retries++;
        const delay = initialDelay * Math.pow(2, retries - 1); // Exponential backoff
        console.log(`Retrying after ${delay}ms (attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

export async function POST(request: Request) {
  try {
    const { image, mimeType, promptType } = await request.json()

    if (!image || !mimeType || !promptType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp"
    })

    const promptTemplates = {
      photography: {
        format: `{"output": "string"}`,
        instruction: "Analyze this image and provide a detailed photography-focused description"
      },
      painting: {
        format: `{"output": "string"}`,
        instruction: "Analyze this image and provide a detailed artistic interpretation"
      },
      character: {
        format: `{"output": "string"}`,
        instruction: "Analyze this image and provide a detailed character description"
      }
    }

    const selectedTemplate = promptTemplates[promptType as keyof typeof promptTemplates] || promptTemplates.photography
    const systemPrompt = `${selectedTemplate.instruction}. Reply with only the JSON object and do not mention names of real people, locations, or copyrighted terms, and do not capitalize every word. ${selectedTemplate.format}`

    // Prepare the image data
    const imageData = {
      inlineData: {
        data: image,
        mimeType
      }
    }

    console.log('Sending request to Gemini API...', {
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
      prompt: systemPrompt,
      mimeType
    })

    // Generate content with retry logic
    const result = await retryWithBackoff(async () => {
      return await model.generateContent([
        systemPrompt,
        imageData
      ]);
    });

    const response = await result.response
    const rawText = response.text()
    
    try {
      // Parse and clean the response
      const cleanOutput = parseAndCleanJsonOutput(rawText);

      if (!cleanOutput) {
        throw new Error('No output generated');
      }

      // Only return the cleaned output
      return NextResponse.json({ 
        output: cleanOutput
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error processing response:', error);
      return NextResponse.json({
        error: 'Failed to process response',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Error in generate prompt API:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 