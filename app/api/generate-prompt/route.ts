import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Gemini API with your API key
let genAI: GoogleGenerativeAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not configured in environment variables');
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  
  // Enhance API key validation
  const apiKey = process.env.GEMINI_API_KEY.trim();
  console.log('API Key from env:', apiKey); // Log the API key
  if (!apiKey.startsWith('AI')) {
    console.error('Invalid API key format. Gemini API keys should start with "AI"');
    throw new Error('Invalid API key format. Gemini API keys should start with "AI"');
  }
  
  // Test API key format with regex
  const validKeyFormat = /^AI[A-Za-z0-9_-]{20,}$/;
  if (!validKeyFormat.test(apiKey)) {
    console.error('Invalid API key format. Please check your API key');
    throw new Error('Invalid API key format. Please check your API key');
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('Gemini API initialized successfully'); // Log successful initialization
} catch (error) {
  console.error('Error initializing Gemini API:', error);
}

export async function POST(request: Request) {
  try {
    // Validate API initialization
    if (!genAI) {
      return NextResponse.json(
        { 
          error: 'API configuration error',
          message: 'The Gemini API could not be initialized. Please check your API key format and configuration.',
          help: 'Make sure to use a valid API key from Google AI Studio (https://makersuite.google.com/app/apikey)',
          env: {
            hasApiKey: !!process.env.GEMINI_API_KEY,
            keyFormat: process.env.GEMINI_API_KEY?.startsWith('AI')
          }
        },
        { status: 500 }
      )
    }

    const { image, mimeType } = await request.json()

    // Validate request data
    if (!image || !mimeType) {
      console.error('Missing required fields:', { image: !!image, mimeType: !!mimeType })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp" })

    // Prepare the image data
    const imageData = {
      inlineData: {
        data: image,
        mimeType
      }
    }

    console.log('Sending request to Gemini API...', {
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
      prompt: process.env.GEMINI_PROMPT
    })
    
    // Generate content
    const result = await model.generateContent([
      process.env.GEMINI_PROMPT || "Generate a detailed 100-word photography description including lens choice and lighting setup for this image:",
      imageData
    ])

    const response = await result.response
    const prompt = response.text()

    console.log('Generated prompt:', prompt)

    if (!prompt) {
      console.error('No prompt was generated')
      throw new Error('No prompt generated')
    }

    return NextResponse.json({ prompt })
  } catch (error: any) {
    console.error('Error generating prompt:', {
      message: error.message,
      stack: error.stack,
      details: error,
      status: error.status,
      errorDetails: error.errorDetails
    })
    
    // Enhanced error response
    return NextResponse.json(
      { 
        error: 'Failed to generate prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error.errorDetails || error.message,
        env: {
          hasApiKey: !!process.env.GEMINI_API_KEY,
          hasModel: !!process.env.GEMINI_MODEL,
          hasPrompt: !!process.env.GEMINI_PROMPT
        }
      },
      { status: error.status || 500 }
    )
  }
} 