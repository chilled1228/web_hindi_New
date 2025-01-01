import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Gemini API with your API key
let genAI: GoogleGenerativeAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  if (!process.env.GEMINI_API_KEY.startsWith('AI')) {
    throw new Error('Invalid API key format. Gemini API keys should start with "AI"');
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
          help: 'Make sure to use an API key from Google AI Studio (https://makersuite.google.com/app/apikey)'
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
      details: error
    })
    return NextResponse.json(
      { 
        error: 'Failed to generate prompt', 
        details: error instanceof Error ? error.message : 'Unknown error',
        env: {
          hasApiKey: !!process.env.GEMINI_API_KEY,
          hasModel: !!process.env.GEMINI_MODEL,
          hasPrompt: !!process.env.GEMINI_PROMPT
        }
      },
      { status: 500 }
    )
  }
} 